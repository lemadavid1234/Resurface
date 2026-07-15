"use client"; //directive marking this file's boundary into client rendered code

import { useState } from "react"

export default function UploadForm() {

    const [file, setFile] = useState<File | null>(null);

    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!file) return; //if no file, return

        const formData = new FormData();
        formData.append("file", file);

        //POST endpoint
        await fetch("http://localhost:8000/screenshots", {
            method: "POST",
            body: formData,
        });
    }

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <button type="submit">Upload</button>
        </form>
    )



}


