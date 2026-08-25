"use client";

//useRef - a React Hook that lets you keep a value between renders without causing a re-render when that value changes
import { useState, useRef, useEffect } from "react";

import { useRouter } from "next/navigation";

import { Upload } from "lucide-react";

export default function UploadModal() {

    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [status, setStatus] = useState<"idle" | "processing" | "uploading" | "completed" | "failed">("idle");

    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false); //to show different UI in both cases
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [screenshotId, setScreenshotId] = useState<number | null>(null);

    const router = useRouter();

    //event handlers
    function handleDrop(e: React.DragEvent<HTMLDivElement>) {
        //default behavior would make the browser navigate to and try to open the dropped file directly, every drag handler needs to call it
        //allowing function to decide what happens next, saving the dropped file into React state
        e.preventDefault();

        setIsDragging(false);

        //if user drops something that isn't a file then droppedFile = undefined
        const droppedFile = e.dataTransfer.files?.[0];
        if (droppedFile) {
            setFile(droppedFile);
            uploadFile(droppedFile);
        };
    }

    function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
        e.preventDefault();
        setIsDragging(true);
    }

    function handleDragLeave() {
        setIsDragging(false);
    }

    function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            uploadFile(selectedFile);
        }
    }

    async function uploadFile(fileToUpload: File) {
        setStatus("uploading");
        const formData = new FormData();
        formData.append("file", fileToUpload); //without it, request body was always empty regardless of what file got passed in

        try {
            const res = await fetch("http://localhost:8000/screenshots", {
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

    useEffect(() => {
        if (status !== "processing" || !screenshotId) return;

        const intervalId = setInterval(async () => {
            const res = await fetch(`http://localhost:8000/screenshots/${screenshotId}`);
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
        if (status !== "completed") return;

        const timeoutId = setTimeout(() => {
            setIsOpen(false);
            router.refresh();
        }, 900);

        return () => clearTimeout(timeoutId);
    }, [status, router]);


    return (
        <>
            {/* click background to close */}
            <button 
                onClick={() => setIsOpen(true)} 
                className="rounded bg-amber-600 text-white px-3 py-1.5 font-medium"
                aria-label="Upload screenshot"
            >
                <Upload size={18} className="lg:hidden"/>
                <span className="hidden lg:inline">Upload Screenshot</span>
            </button>


            {/* modal */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

                    <button onClick={() => setIsOpen(false)} className="absolute inset-0" aria-label="Close" />
                    <div className="relative bg-white rounded-3xl p-8 w-full max-w-xl flex flex-col gap-4">
                        <button onClick={() => setIsOpen(false)} className="self-end text-sm text-gray-400 hover:text-gray-600">Close</button>

                        {status === "idle" && (
                            <>
                                <div
                                    onDrop={handleDrop}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    className={isDragging
                                        ? "border-2 border-dashed border-amber-600 rounded-lg p-8 flex flex-col items-center text-center"
                                        : "border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center text-center"
                                    }
                                >
                                    <p className="font-semibold">Drop screenshot here</p>
                                    <p className="text-sm text-gray-400">PNG, JPG · up to 10MB</p>
                                </div>

                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="mt-2 px-3 py-1.5 rounded border border-gray-300 text-sm"
                                >
                                    Choose File
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/png, image/jpeg"
                                    className="hidden"
                                    onChange={handleFileSelect}
                                />
                            </>
                        )}

                        {(status === "uploading" || status==="processing") && (
                            <p className="text-sm text-gray-600">
                                {file?.name} - {status === "uploading" ? "Uploading..." : "Processing..."}
                            </p>
                        )}

                        {status==="completed" && (
                            <p className="text-sm text-green-600 text-center py-8">Completed!</p>
                        )}

                        {status==="failed" && (
                            <div className="flex flex-col items-center text-center gap-3 py-4">
                                <p className="font-semibold">We couldn&apos;t process that screenshot</p>
                                <p className="text-sm text-gray-500">
                                    The upload didn&apos;t finish. Check your connection and try again - nothing was saved.
                                </p>
                                <div className="flex gap-2 mt-2">
                                    <button 
                                        onClick={() => { setFile(null); setStatus("idle"); setScreenshotId(null); }}
                                        className="px-3 py-1.5 rounded text-sm text-gray-600"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={() => file && uploadFile(file)}
                                        className="px-3 py-1.5 rounded bg-amber-600 text-white text-sm font-medium"
                                    >
                                        Try again
                                    </button>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            )}
        </>
    )
}