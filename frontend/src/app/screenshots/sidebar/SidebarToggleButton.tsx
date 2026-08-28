"use client";

import { useSidebar } from "./SidebarContext";
import { Menu } from "lucide-react";

export default function SidebarToggleButton() {

    const { isOpen, toggle } = useSidebar();

    if (isOpen) return null;

    return (
        <button 
            onClick={toggle} 
            className="lg:hidden px-3 py-1.5 rounded border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
            aria-label="Open menu"
        >
            <Menu size={18}/>   
        </button>
    )
}