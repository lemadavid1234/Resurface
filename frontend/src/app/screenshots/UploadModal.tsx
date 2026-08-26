"use client";

//useRef - a React Hook that lets you keep a value between renders without causing a re-render when that value changes
import { useState, useRef, useEffect } from "react";

import { Upload } from "lucide-react";

import UploadItemRow from "./UploadItemRow";


export default function UploadModal() {
    
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [isDragging, setIsDragging] = useState(false); //to show different UI in both cases
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    //event handlers
    function handleDrop(e: React.DragEvent<HTMLDivElement>) {
        //default behavior would make the browser navigate to and try to open the dropped file directly, every drag handler needs to call it
        //allowing function to decide what happens next, saving the dropped file into React state
        e.preventDefault();

        setIsDragging(false);

        //if user drops something that isn't a file then droppedFile = undefined
        //const droppedFile = e.dataTransfer.files?.[0]; 
        //e.dataTransfer.files and e.target.files are both a FileList (array-like), must be converted into a real JavaScript array 
        const droppedFiles = Array.from(e.dataTransfer.files ?? []);

        if (droppedFiles.length > 0) {
            setSelectedFiles(droppedFiles);
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
        const selected = Array.from(e.target.files ?? [])
        if (selected.length > 0) {
            setSelectedFiles(selected);
        }
    }

    function closeModal() {
        setIsOpen(false);
        setSelectedFiles([]); //clear selectedFiles in order to not silently re-upload every file
    }

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

                    <button onClick={closeModal} className="absolute inset-0" aria-label="Close" />
                    <div className="relative bg-white rounded-3xl p-8 w-full max-w-xl flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold tracking-tight">Upload Files</h2>
                                <button 
                                    onClick={closeModal} 
                                    className="self-end text-sm text-gray-400 hover:text-gray-600"
                                >
                                    Close
                                </button>
                            </div>
                            <p className="text-lg text-gray-500">Choose multiple files at once - PNG, JPG</p>
                        </div>

                        {selectedFiles.length === 0 ? (
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
                                    multiple
                                    className="hidden"
                                    onChange={handleFileSelect}
                                />
                            </> 
                        ) : (
                            <div className="flex flex-col gap-1">
                                {selectedFiles.map((f, index) => (
                                    <UploadItemRow key={`${f.name}-${f.size}-${index}`} file={f} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}