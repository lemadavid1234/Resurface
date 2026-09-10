# auth.py is the one place in the backend that knows how to talk to Supabase Auth (GoTrue)
# main.py calls these as plain functions and never imports 'supabase' itself


import time
from dataclasses import dataclass

from supabase import create_client
from supabase.lib.client_options import SyncClientOptions
from supabase_auth.errors import AuthError as GoTrueError

from app.config import SUPABASE_ANON_KEY, SUPABASE_URL


# one client, shared by every request. It must never hold per-user session state,
# so persistence + auto-refresh are off and every function below passes
# its tokens in explicitly
# leading _ means "internal to this module" - not part of its public API
# leading _ also because it's the raw SDK object, nothing outside auth.py should use it directly
_client = create_client(
    SUPABASE_URL, 
    SUPABASE_ANON_KEY,
    options=SyncClientOptions(persist_session=False, auto_refresh_token=False),
)

class AuthError(Exception):
    """Anything the auth provider rejected: bad credentials, weak password,
    email already registered, invalid or expired token.
    main.py maps this to a 4XX response"""

@dataclass
class AuthSession:
    """Just what the backend needs from a Supabase session 
    - no SDK-shaped object crosses into main.py"""
    access_token: str
    refresh_token: str
    expires_at: int #unix seconds: when the access token stops being valid
    user_id: str
    email: str | None

def _to_session(sdk_session) -> AuthSession:
    return AuthSession(
        access_token=sdk_session.access_token,
        refresh_token=sdk_session.refresh_token,
        expires_at=sdk_session.expires_at or int(time.time()) + sdk_session.expires_in,
        user_id=sdk_session.user.id,
        email=sdk_session.user.email, 
        )

def sign_up(email: str, password: str) -> AuthSession:
    """Register a new user and return their first session"""
    try:
        result = _client.auth.sign_up({"email": email, "password": password})

    except GoTrueError as e: 
        raise AuthError(str(e)) from e

    if result.session is None:
        # GoTrue returns no session here when the project has email
        # confirmation enabled - not something we handle yet

        raise AuthError("this project requires email confirmation before sign-in")

    return _to_session(result.session)


def sign_in(email: str, password: str) -> AuthSession:
    """Verify email + password, return a fresh session"""
    try:
        result = _client.auth.sign_in_with_password({"email": email, "password": password})

    except GoTrueError as e:
        raise AuthError(str(e)) from e

    return _to_session(result.session)

# A token (JWT) carries a payload -- user_id, email, expiry -- plus a signature.
# GoTrue produces that signature with a private key only Supabase has.
# matching public key is published openly at project's /.well-known/jwks.json
#analogy: wax seal on a letter: ANYONE can check the seal is the king's, only the king has the stamp to make it
def get_user_from_token(access_token: str) -> dict:
    """Verify a JWT's signature and expiry against the project's public keys
    (fetched once from the JWKS endpoint, then cached in-process).
    Return the identity in the token. Raises AuthError if it's invalid or expired."""
    try:
        response = _client.auth.get_claims(access_token)
    except GoTrueError as e:
        raise AuthError(str(e)) from e

    if response is None:
        raise AuthError("invalid token")

    claims = response["claims"]
    return {"id": claims["sub"], "email": claims.get("email")}


def refresh(refresh_token: str) -> AuthSession:
    """Exchange a valid refresh token for a new session"""
    try:
        result = _client.auth.refresh_session(refresh_token)
    except GoTrueError as e:
        raise AuthError(str(e)) from e

    return _to_session(result.session)

def sign_out(access_token: str) -> None:
    """Revoke this user's refresh tokens on Supabase. Best-effort - the
    outcome doesn't matter (clearing the cookie ends the browser session), and a
    failure here means never break logout. The access token itself can't be revoked;
    it stays valid until it expires (~1h)."""

    try:
        _client.auth.admin.sign_out(access_token, "global")
    except Exception:
        pass
    