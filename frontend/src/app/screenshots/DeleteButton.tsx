"use client";
//client component since it needs user interactivity (click handler), a fetch() call, and a loading/error state
//all fall under browser-side interactivity, which a Server Component cannot have

import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "./apiUrl";



export default function DeleteButton({ screenshot_id, closeHref } : { screenshot_id : number, closeHref : string }) {

    const [ status, setStatus ] = useState<"idle" | "deleting" | "error">("idle");
    const router = useRouter();

    async function handleDelete() {

        const confirmed = window.confirm("Delete this screenshot? This can't be undone.");
        
        if (!confirmed) return;

        setStatus("deleting");

        //fetch call that makes an HTTP DELETE request to FastAPI backend
        //no need for res.json() since there is no response body in 204 DELETE response
        try {
            // const res = await fetch(`http://localhost:8000/screenshots/${screenshot_id}`, 
            //     { method: "DELETE" }
            // );
            const res = await fetch(`${API_URL}/screenshots/${screenshot_id}`, 
                { method: "DELETE" }
            );
            
            if (!res.ok) {
                setStatus("error");
                return;
            }

            router.replace(closeHref);
            router.refresh();

        } catch (error) {
            setStatus("error");
            console.log(`Unsuccessful delete: ${error}`);
        }    
    }


    return (
        <>
            <button
                onClick={handleDelete}
                disabled={status === "deleting"}
                className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
            >
                {status === "deleting" ? "Deleting..." : "Delete"}
            </button>
            {status === "error" && <p className="text-sm text-red-600">Failed to delete. Try again.</p>}
        </>
    )
}