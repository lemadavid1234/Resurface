"use client";

import { useRef, useState, useEffect } from "react";

import { useRouter } from "next/navigation";

import { scheduleGridRefresh } from "./scheduleGridRefresh"; //debouncing refresh

import { API_URL } from "./apiUrl";

export default function UploadItemRow({ file }: {file: File} ) {

    const [status, setStatus] = useState<"uploading" | "processing" | "completed" | "failed">("uploading");
    const [screenshotId, setScreenshotId] = useState<number | null>(null);

    const hasStartedUpload = useRef(false);

    const router = useRouter();

    useEffect(() => {
        if (hasStartedUpload.current) return;
        hasStartedUpload.current = true;

        async function uploadFile() {
            const formData = new FormData();
            formData.append("file", file); //without it, request body was always empty regardless of what file got passed in

            try {
                // const res = await fetch("http://localhost:8000/screenshots", {
                //     method: "POST",
                //     body: formData,
                // });
                const res = await fetch(`${API_URL}/screenshots`, {
                    method: "POST",
                    body: formData,
                });

                if (!res.ok) {
                    setStatus("failed");
                    return;
                }

                const newScreenshot = await res.json();
                setScreenshotId(newScreenshot.id);
                setStatus("processing");
            } catch {
                setStatus("failed");
            }

        }

        uploadFile();
    }, [file]);

    useEffect(() => {
        if (status !== "processing" || !screenshotId) return;

        const intervalId = setInterval(async () => {
            // const res = await fetch(`http://localhost:8000/screenshots/${screenshotId}`);
            const res = await fetch(`${API_URL}/screenshots/${screenshotId}`);

            const data = await res.json();

            if (data.status === "completed") {
                clearInterval(intervalId);
                setStatus("completed");
            } else if (data.status === "failed") {
                clearInterval(intervalId);
                setStatus("failed");
            }   
        }, 2000);

        return () => clearInterval(intervalId);
    }, [status, screenshotId]);

    useEffect(() => {
        if (status === "completed") {
            scheduleGridRefresh(router);
        }
    }, [status, router]);


    return (
        <div className="flex items-center justify-between text-sm py-1">
            <span className="truncate">{file.name}</span>
            <span className={
                status === "failed" ? "text-red-600" :
                    status === "completed" ? "text-green-600" :
                        "text-gray-500"
            }>
                {status === "uploading" && "Uploading..."}
                {status === "processing" && "Processing..."}
                {status === "completed" && "Completed"}
                {status === "failed" && "Failed"}
            </span>
        </div>
    )
}