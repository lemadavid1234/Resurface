import Link from "next/link";

const categories = [
    { name: "React", count: 2 },
    { name: "SQL", count: 1 },
    { name: "FastAPI", count: 1},
]

export default function ScreenshotsLayout({ children } : { children: React.ReactNode }) {

    return (
        <div className="flex min-h-screen">
            <aside className="w-64 border-r border-gray-200 p-4 flex flex-col gap-6">
                <span className="font-bold text-lg">Resurface</span>

                <nav className="flex flex-col gap-1">
                    <Link href="/screenshots" className="px-2 py-1 rounded bg-gray-100">All Screenshots</Link>
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
            <main className="flex-1">{children}</main>
        </div>
    )
}