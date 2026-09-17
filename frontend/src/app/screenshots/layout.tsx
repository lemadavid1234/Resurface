import { getScreenshots } from "./getScreenshots";
import { getCategoryCounts } from "./getCategoryCounts";

import { SidebarProvider } from "./sidebar/SidebarContext";
import Sidebar from "./sidebar/Sidebar";

export default async function ScreenshotsLayout({ children } : { children: React.ReactNode }) {

    const screenshots = await getScreenshots();
    const categories = getCategoryCounts(screenshots);

    return (
        <SidebarProvider>
            <div className="flex h-screen overflow-hidden">
                <Sidebar categories={categories}></Sidebar>
                <main className="flex-1 overflow-y-auto">{children}</main>
            </div>
        </SidebarProvider>
    )
}