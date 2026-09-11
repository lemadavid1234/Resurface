"use client";

import { useRouter } from "next/navigation";
import { useState } from "react"
import { API_URL } from "../screenshots/apiUrl";



export default function SignUpPage() {

    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    async function onSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        const form = new FormData(e.currentTarget);
        try {
            const res = await fetch(`${API_URL}/auth/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({          //fetch's body and HTTP in general only carries text/bytes, never a live js object
                    email: form.get("email"),
                    password: form.get("password"),
                })
    
    
            });
    
            if (!res.ok) {
                const body = await res.json().catch(() => null);
    
                setError(body?.detail ?? "Sign up Failed");
                return;
            }
    
            router.push("/screenshots");
            router.refresh();
        } catch {
            setError("Can't reach the server - check your connection and try again.");
        } finally {
            setSubmitting(false);
        }
    }




    return (
        <main className="mx-auto mt-24 w-full max-w-sm px-4 border border-black-800">
            <h1 className="mt-6 text-xl font-semibold">Create your Resurface account</h1>
            <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-3">
                <input name="email" type="email" required placeholder="Email" className="rounded border border-gray-300 px-3 py-2 text-sm" />
                <input name="password" type="password" required placeholder="Password" className="rounded border border-gray-300 px-3 py-2 text-sm" />
                <button type="submit" disabled={submitting} className="rounded bg-gray-900 px-3 py-2 text-white text-sm disabled:opacity-50">
                    {submitting ? "Signing up..." : "Sign Up"}
                </button>
            </form>
            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
            <p className="mt-4 text-sm text-gray-600">
                Have an account? <a href="/login" className="underline">Login</a>
            </p>
        </main>
    )
}