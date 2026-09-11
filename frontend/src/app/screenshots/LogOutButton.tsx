"use client";

import { useState } from "react";
import { API_URL } from "./apiUrl";

export default function LogOutButton() {
    
    const [logginOut, setLogginOut] = useState(false);


    async function handleLogOut() {
        setLogginOut(true);

        try {
            await fetch(`${API_URL}/auth/logout`, {
                method: "POST",
                credentials: "include",
            });
        } finally {
            window.location.href = "/"; //hard nav
        }

    }

    return (
        <button 
            onClick={handleLogOut}
            disabled={logginOut}
            className="text-sm"
        >
            {logginOut ? "Logging out..." : "Log Out"}
        </button>
    )
}