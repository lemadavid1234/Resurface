import Link from "next/link";
import { getScreenshots } from "./getScreenshots";

export default async function ScreenshotsLayout({ children } : { children: React.ReactNode }) {

    const screenshots = await getScreenshots();

    //.reduce<ResultType>( (accumulator, currVal, currIdx, array) => { //logic }, initialValue)
    //counts is an Object that contains all available categories (key) and their counts (value) 
    const counts = screenshots.reduce<Record<string, number>>((acc, s) => {
        if (!s.category) return acc;
        
        acc[s.category] = (acc[s.category] ?? 0) + 1;
        return acc;

    }, {});
    //counts is now an object whose type is Record<string,number>
    //{ Python: 3, JavaScript: 5}
    //Object.entries -> turns object into an array of key-value pairs (array of arrays) 
    //      ([ ["Python", 3], ["JavaScript", 5], ...])
    //.map goes through each pair, destructs array, and creates an object
    //      [ ["Python", 3] ] --> [ { name: "Python", count: 3} ]
    //.sort compares two objects at a time. b.count - a.count sorts from largest count to smallest count
    const categories = Object.entries(counts)
        .map(([name, count]) => ({ name, count }))
        .sort((a,b) => b.count - a.count);




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