//app router -> localhost/screenshots opens this page.tsx

import UploadForm from "./UploadForm";

//use import type { } ... (recommended) since when TypeScript compiles your code, types disappear. They do not exist at runtime
//says: “Only import this for type checking. Remove this import from the generated JavaScript.”
import type { Screenshot } from "./types";

import ScreenshotCard  from "./ScreenshotCard";


//async function because...
export default async function ScreenshotsPage(
    { searchParams } : { searchParams: Promise<{q?: string}>}
) {
    //since prop is a Promise, can't read off .q directly, therefore must await
    const { q } = await searchParams;

    //websearch_to_tsquery automatically handles trimming, lowercasing, removing stop words during tokenization
    //however, trimming "    " will result in "" therefore q is falsy and will render all screenshot
    const searchQuery = q?.trim();

    //construct url: if q exists encode search terms into url, else return all
    const url = searchQuery
    ? `http://localhost:8000/screenshots?q=${encodeURIComponent(searchQuery)}`
    : "http://localhost:8000/screenshots";


    //sends HTTP request, res is a Response object (entire HTTP response). 
    //res is a "package" that contains status,headers,body,methods
    const res = await fetch(url);

    //.json() reads the response body and converts the JSON into a JavaScript object
    //now screenshots contains a normal Javascript array with the actual data
    const screenshots: Screenshot[] = await res.json();

    return (
        <div>
            <div className="flex items-center justify-between gap-4 p-4 border-b border-gray-200">
                <form method="get" className="flex-1 flex max-w-md gap-2">
                    <input 
                        type="text" 
                        name="q" 
                        defaultValue={q} 
                        placeholder="Search screenshots..."
                        className="w-full px-3 py-1.5 border rounded border-gray-300 text-sm"
                    />
                    <button 
                        type="submit"
                        className="px-3 py-1.5 rounded border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
                    >
                        Search
                    </button>
                </form>
                <UploadForm/>
            </div>
            <div className="grid grid-cols-3 gap-4 p-4">
                {screenshots.map((screenshot)=> (
                    <ScreenshotCard key={screenshot.id} screenshot={screenshot} />
                ))}
            </div>
        </div>

    )
}