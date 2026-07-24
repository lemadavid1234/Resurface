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
            <form onSubmit={handleSubmit}>
                <input
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />

                <button type="submit" disabled={status === "uploading"}>
                    {status === "uploading" ? "uploading..." : "Upload"}
                </button>
            </form>
            {status === "success" && <p>Successful Upload.</p>}
            {status === "error" && <p>Failed to Upload. Try again.</p>}
        </>
    )

}


