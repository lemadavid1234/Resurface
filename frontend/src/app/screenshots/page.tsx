//app router -> localhost/screenshots opens this page.tsx

import UploadModal from "./UploadModal";

import ScreenshotCard from "./ScreenshotCard";

import DetailPanel from "./DetailPanel";

import { getScreenshots } from "./getScreenshots";
import SidebarToggleButton from "./SidebarToggleButton";

import { Search } from "lucide-react";


//async function because...
export default async function ScreenshotsPage(
    { searchParams }: { searchParams: Promise<{ q?: string; screenshot?: string }> }
) {
    //since prop is a Promise, can't read off .q directly, therefore must await
    const { q, screenshot: selectedId } = await searchParams;

    //websearch_to_tsquery automatically handles trimming, lowercasing, removing stop words during tokenization
    //however, trimming "    " will result in "" therefore q is falsy and will render all screenshot
    const searchQuery = q?.trim();

    //don't need ': Screenshot[]' annotation here since TS already knows the return type from getScreenshot's own signature and infers it automatically
    //also means 'import type { Screenshot } from ./types' line becomes unused
    const screenshots = await getScreenshots(searchQuery);

    //once screenshots is fetched
    const selected = selectedId ? screenshots.find((s) => s.id === Number(selectedId)) : undefined;


    return (
        <div>
            <div className="flex items-center justify-between gap-4 p-4 border-b border-gray-200">
                <SidebarToggleButton />
                <form method="get" className="flex-1 flex max-w-md gap-2">
                    <div className="relative flex-1">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        <input
                            type="text"
                            name="q"
                            defaultValue={q}
                            placeholder="Search screenshots..."
                            className="w-full pl-9 pr-3 py-1.5 border rounded-full border-gray-300 text-sm"
                        />
                    </div>
                    <button
                        type="submit"
                        className="hidden lg:block px-3 py-1.5 rounded border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
                    >
                        Search
                    </button>

                </form>
                <UploadModal />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {screenshots.map((screenshot) => (
                    <ScreenshotCard key={screenshot.id} screenshot={screenshot} q={q} />
                ))}
            </div>
            {selected && <DetailPanel screenshot={selected} q={q}/>}
        </div>

    )
}