//helper function

//use import type { } ... (recommended) since when TypeScript compiles your code, types disappear. They do not exist at runtime
//says: “Only import this for type checking. Remove this import from the generated JavaScript.”
import type { Screenshot } from "./types";


export async function getScreenshots(q? : string): Promise<Screenshot[]> {

    //construct url: if q exists encode search terms into url, else return all
    const url = q
        ? `http://localhost:8000/screenshots?q=${encodeURIComponent(q)}`
        : `http://localhost:8000/screenshots`;

    //sends HTTP request, res is a Response object (entire HTTP response). 
    //res is a "package" that contains status,headers,body,methods
    const res = await fetch(url);
    
    //.json() reads the response body and converts the JSON into a JavaScript object
    //returns Promise that contains a normal Javascript array with the actual data of Screenshot type
    return res.json();
}