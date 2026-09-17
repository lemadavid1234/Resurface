import { API_URL } from "./apiUrl";
import type { User } from "./types"
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

//Data-fetching function
//API Client function (hides the URL, the fetch call, the cookie-forwarding, and the JSON paring behind a plain typed function call)
//so nothing that calls getCurrentUser() needs to know any of that exists
export async function getCurrentUser(): Promise<User> {

    const cookieStore = await cookies();

    const res = await fetch(`${API_URL}/auth/me`, {
        headers: { Cookie: cookieStore.toString() }
    });

    if (res.status == 401) redirect("/login");

    // res only receives what the UserRead model provides 
    return res.json();
}