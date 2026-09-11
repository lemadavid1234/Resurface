//helper function

//use import type { } ... (recommended) since when TypeScript compiles your code, types disappear. They do not exist at runtime
//says: “Only import this for type checking. Remove this import from the generated JavaScript.”
import { API_URL } from "./apiUrl";
import type { Screenshot } from "./types";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";


export async function getScreenshots(q? : string): Promise<Screenshot[]> {

    //construct url: if q exists encode search terms into url, else return all
    const url = q
        ? `${API_URL}/screenshots?q=${encodeURIComponent(q)}`
        : `${API_URL}/screenshots`;

    //cookies() reads the cookie the browser sent to the Next server;
    const cookieStore = await cookies(); 

    //sends HTTP request, res is a Response object (entire HTTP response). 
    //res is a "package" that contains status,headers,body,methods
    //.toString() serializes it back into a Cookie: header for the backend call
    const res = await fetch(url, {
        headers: { Cookie: cookieStore.toString() }
    });

    //redirect works here even though this isn't a component
    if (res.status === 401) redirect("/login") //not logged in OR access token expired
    
    //.json() reads the response body and converts the JSON into a JavaScript object
    //returns Promise that contains a normal Javascript array with the actual data of Screenshot type
    return res.json();
}