//Next.js only exposes an environment variable to browser-side code if its name
//starts with exactll NEXT_PUBLIC_, anything else stays server-only.
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";