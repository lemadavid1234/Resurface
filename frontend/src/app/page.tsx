//Landing Page
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {

  // const res = await fetch("http://localhost:8000/health");
  // const data = await res.json();

  const cookieStore = await cookies();
  if (cookieStore.has("access_token")) redirect("/screenshots")

  return (
    <main className="mx-auto mt-24 w-full max-w-md px-4 text-center">
      <h1 className="text-2xl font-semibold">Resurface</h1>
      <p className="mt-2 text-sm text-gray-600">An AI-powered organizer for the screenshots you save while learning.</p>
      <div className="mt-6 flex justify-center gap-3">
        <a href="/login" className="rounded bg-gray-900 px-4 py-2 text-sm text-white">Log in</a>
        <a href="/signup" className="rounded bg-gray-900 px-4 py-2 text-sm text-white">Sign Up</a>
      </div>
    </main>
  
  )
}