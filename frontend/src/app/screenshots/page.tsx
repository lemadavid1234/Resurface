//app router -> localhost/screenshots opens this page.tsx

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
export default async function ScreenshotsPage() {

    //sends HTTP request, res is a Response object (entire HTTP response). 
    //res is a "package" that contains status,headers,body,methods
    const res = await fetch("http://localhost:8000/screenshots");
    console.log(res); //print res to console to test

    //.json() reads the response body and converts the JSON into a JavaScript object
    //now screenshots contains a normal Javascript array with the actual data
    const screenshots: Screenshot[] = await res.json();

    return (
        <div>
            {screenshots.map((screenshot)=> (
                <img key={screenshot.id} src={screenshot.image_url} alt="" />
            ))}
        </div>
    )
}