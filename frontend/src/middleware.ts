// middleware.ts runs at the edge: before any rendering
// cheap but efficient check to see if cookie exists
// therefore a present-but-expried cookie can still get through but getScreenshot's 401 -> redirect("login") catches that case
// without middleware, a fully logged out visitor still pays for a complete trip:
// page starts rendering -> getScreenshots run -> real network call to FastAPI backend -> backend checks the session -> 401 comes
// back -> then redirect. all this work just to discover there was no cookie to begin with.

//Next.js knows about middleware.ts through file-system convention and build-time static analysis
//During the build process, the Next.js compiler looks for this exact filename at the same level as. your app or pages directory.
//If it finds the file, Next.js automatically registers it and includes it in the routing manifest for every incoming request.

//Single File Constraint: Next.js only supports one middleware.ts per project
//Static Config Analysis: exporting a 'config' object with a 'matcher', Next.js reads those values at build time.
// they must be static constants so the server can optimize which routes trigger the middlewar before a request even arrives


import type { NextRequest } from "next/server"; //.cookies: allows us to read or mutate the Set-Cookie header of the request
import { NextResponse } from "next/server";     //.cookies: allows us to read or mutate the Set-Cookie header of the response

const PROTECTED = ["/screenshots"];
const AUTH_PAGES = ["/login", "/signup"];


export function middleware(request: NextRequest) {
    const isLoggedIn = request.cookies.has("access_token");
    const { pathname } = request.nextUrl;

    if (!isLoggedIn && PROTECTED.some((p) => pathname.startsWith(p))) {
        //if not logged in and our pathname is /screenshots, then redirect to /login page
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (isLoggedIn && AUTH_PAGES.includes(pathname)) {
        //if cookie is present but user is in the login/signup page, then redirect to respective /screenshots page
        return NextResponse.redirect(new URL('/screenshots', request.url));
    }

    //else cookie is present and user is in /screenshots OR cookie is not present and user is in either /login or /signup
    return NextResponse.next();

}

//config.matcher tells Next.js which requests are even allowed to trigger this middleware function
export const config = {
    matcher: ["/screenshots/:path*", "/login", "/signup"],
};


//NextResponse.redirect(url) produces an actualy HTTP 3xx response, the browser gets told "go somewhere else" and the original route never runs
//NextResponse.next() produces no such thing; the browser ends up with whatever the matched page would have returned anyway (normal 200 and HTML),
// completely unaffected by having passed through this function: "Next's way of saying 'middleware looked, and chose not to act'".
