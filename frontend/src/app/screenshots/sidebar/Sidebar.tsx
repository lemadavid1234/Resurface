"use client";

import Link from "next/link";
import { useSidebar } from "./SidebarContext";
//client-side hook that returns the current URL path. Sidebar.tsx is client component so it can call this to check
//"is this link the route I'm currently on" and style itself active
import { usePathname } from "next/navigation"; 

import { X } from "lucide-react";

type Category = { name: string, count: number };

const NAV_ITEMS = [
    { href: "/screenshots", label: "All Screenshots" },
    { href: "/screenshots/recent", label: "Recently Added" },
    { href: "/screenshots/favorites", label: "Favorites" },
    { href: "/screenshots/categories", label: "Categories" },
    { href: "/screenshots/settings", label: "Settings" },
];

export default function Sidebar({ categories } : { categories: Category[] }) {

    const { isOpen, close } = useSidebar();
    const pathname = usePathname();

    //only show top 10 categories
    const topCategories = categories.slice(0,10);

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
                    {NAV_ITEMS.map((item) => (
                        <Link 
                            key={item.href} 
                            onClick={close} 
                            href={item.href} 
                            className={`px-2 py-1 rounded ${pathname === item.href ? "bg-gray-100" : "text-gray-600 hover:bg-gray-50"}`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>


                <div>
                    <p className="text-xs uppercase text-gray-500 mb-2">Top 10 Categories</p>
                    <ul className="flex flex-col gap-1">
                        {topCategories.map((c) => (
                            <li key={c.name} className="flex justify-between text-sm">
                                <span>{c.name}</span>
                                <span className="text-gray-400">{c.count}</span>
                            </li>
                        ))}
                    </ul>
                    {categories.length > 10 && (
                        <Link
                            onClick={close}
                            href="/screenshots/categories"
                            className="block text-sm text-gray-500 hover:text-gray-700 mt-2"
                        >
                            Show more
                        </Link>
                    )}
                </div>
            </aside>
        </>
    )
}