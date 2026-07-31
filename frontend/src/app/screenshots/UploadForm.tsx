"use client"; //directive marking this file's boundary into client rendered code

import { useState } from "react"
import { useRouter } from "next/navigation" //must be used inside a Client-Component

export default function UploadForm() {

    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
    const router = useRouter();

    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault(); //prevent full page reload/navifgation so the fetch below can run instead
        if (!file) return; //if no file, return

        setStatus("uploading");

        const formData = new FormData();
        formData.append("file", file);

        try {
            //POST endpoint
            const res = await fetch("http://localhost:8000/screenshots", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                setStatus("error");
                return;
            }

            //successful POST
            setStatus("success");
            router.refresh();

        } catch (error) {
            //only fires for actual network failures (server unreachable, not HTTP codes)
            setStatus("error")
            console.log(`Unsuccessful Upload: ${error}`)
        }
    }

    return (
        <>
            <form onSubmit={handleSubmit} className="flex items-center gap-3">
                <input
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    className="text-sm text-gray-500 file:mr-3 file:px-3 file:py-1.5 file:rounded file:border file:border-gray-300 file:bg-gray-50 file:text-gray-700 file:font-medium hover:file:bg-gray-100"
                />

                <button 
                    type="submit" 
                    disabled={status === "uploading"}
                    className="px-4 py-1.5 rounded bg-amber-600 text-white text-sm font-medium disabled:opacity-50"
                >
                    {status === "uploading" ? "uploading..." : "Upload"}
                </button>
            </form>
            {status === "success" && <p className="text-sm text-green-600">Successful Upload.</p>}
            {status === "error" && <p className="text-sm text-red-600">Failed to Upload. Try again.</p>}
        </>
    )

}


