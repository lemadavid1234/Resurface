import { getScreenshots } from "./getScreenshots";

import { SidebarProvider } from "./SidebarContext";
import Sidebar from "./Sidebar";

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
        <SidebarProvider>
            <div className="flex min-h-screen">
                <Sidebar categories={categories}></Sidebar>
                <main className="flex-1">{children}</main>
            </div>
        </SidebarProvider>
    )
}