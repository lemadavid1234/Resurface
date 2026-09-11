"use client";

import { useRouter } from "next/navigation";
import { useState } from "react"
import { API_URL } from "../screenshots/apiUrl";



export default function LoginPage() {

    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    async function onSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        const form = new FormData(e.currentTarget);

        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include", //send + accept the auth cookie
                body: JSON.stringify({
                    email: form.get("email"),
                    password: form.get("password"),
                }),
            });
    
            if (!res.ok) {
                const body = await res.json().catch(() => null);
    
                setError(body?.detail ?? "Log in Failed");
                return;
            }
    
            // router.push("/screenshots");
            // router.refresh();
            window.location.href = "/screenshots";

        } catch {
            setError("Can't reach the server - check your connection and try again.")
        } finally {
            setSubmitting(false);
        }
    }




    return (
        <main className="mx-auto mt-24 w-full max-w-sm px-4 border border-gray-800">
            <h1 className="mt-6 text-xl font-semibold">Log in to Resurface</h1>
            <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-3">
                <input name="email" type="email" required placeholder="Email" className="rounded border border-gray-300 px-3 py-2 text-sm" />
                <input name="password" type="password" required placeholder="Password" className="rounded border border-gray-300 px-3 py-2 text-sm" />
                <button type="submit" disabled={submitting} className="rounded bg-gray-900 px-3 py-2 text-white text-sm disabled:opacity-50">
                    {submitting ? "Logging in..." : "Log in"}
                </button>
            </form>
            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
            <p className="mt-4 text-sm text-gray-600">
                No account? <a href="/signup" className="underline">Sign up</a>
            </p>
        </main>
    )
}