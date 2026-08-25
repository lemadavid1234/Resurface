"use client";

import Link from "next/link";
import { useSidebar } from "./SidebarContext";

import { X } from "lucide-react";

type Category = { name: string, count: number };

export default function Sidebar({ categories } : { categories: Category[] }) {

    const { isOpen, close } = useSidebar();

    return (
        <>
            {isOpen && (
                <div 
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={close}
                />
            )}
            <aside className={`${isOpen ? "fixed inset-y-0 left-0 z-50 flex" : "hidden"} lg:static lg:inset-auto lg:z-auto lg:flex w-64 border-r border-gray-200 p-4 flex-col gap-6 bg-white`}>
                <div className="flex items-center justify-between">
                    <span className="font-bold text-lg">Resurface</span>
                    <button onClick={close} className="lg:hidden" aria-label="Close menu">
                        <X size={15}/>
                    </button>
                </div>
                <nav className="flex flex-col gap-1">
                    <Link onClick={close} href="/screenshots" className="px-2 py-1 rounded bg-gray-100">All Screenshots</Link>
                    <span className="px-2 py-1 text-gray-400">Recently Added</span>
                    <span className="px-2 py-1 text-gray-400">Favorites</span>
                    <span className="px-2 py-1 text-gray-400">Categories</span>
                    <span className="px-2 py-1 text-gray-400">Settings</span>
                </nav>
                <div>
                    <p className="text-xs uppercase text-gray-500 mb-2">Categories</p>
                    <ul className="flex flex-col gap-1">
                        {categories.map((c) => (
                            <li key={c.name} className="flex justify-between text-sm">
                                <span>{c.name}</span>
                                <span className="text-gray-400">{c.count}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </aside>
        </>
    )
}