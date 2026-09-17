import Link from "next/link";

import { getScreenshots } from "../getScreenshots";
import { getCategoryCounts } from "../getCategoryCounts";
import SidebarToggleButton from "../sidebar/SidebarToggleButton";


export default async function CategoriesPage() {

    const screenshots = await getScreenshots();
    const categories = getCategoryCounts(screenshots);
    //where category is 
    // type Category = { 
    //     name: string,
    //     count: number, 
    // };
    
    
    return (
        <div>
            <div className="p-4 border-b border-gray-200">
                <SidebarToggleButton />
            </div>


            <div className="p-4 max-w-md flex flex-col gap-1 border border-gray-700">
                <h1 className="text-lg font-bold mb-2">Categories</h1>
                {categories.map((c) => (
                    <Link
                        key={c.name}
                        href={`/screenshots?category=${encodeURIComponent(c.name)}`}
                        className="flex justify-between text-sm px-2 py-1.5 rounded hover:bg-gray-100"
                    >
                        <span>{c.name}</span>
                        <span className="text-gray-400">{c.count}</span>
                    </Link>
                ))}
            </div>
        </div>
    )
}