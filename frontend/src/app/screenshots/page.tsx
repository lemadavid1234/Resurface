//app router -> localhost/screenshots opens this page.tsx

import UploadForm from "./UploadForm";


//since res.json returns type 'any', since project's tsconfig.json has strict: true
//which includes a rule called noImplicitAny, it refuses to let a type silently become 'any
//without me explicitly acknowledging it
type Screenshot = {
    id: number;
    image_url: string;
    extracted_text: string | null;
    category: string | null;
    ai_summary: string | null;
    programming_language: string | null;
    source_platform: string | null;
};


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
            <form method="get">
                <input type="text" name="q" defaultValue={q} />
                <button type="submit">Search</button>
            </form>
            <UploadForm/>
            {screenshots.map((screenshot)=> (
                <img key={screenshot.id} src={screenshot.image_url} alt="" />
            ))}
        </div>

    )
}