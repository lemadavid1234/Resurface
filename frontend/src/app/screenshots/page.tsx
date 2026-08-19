//app router -> localhost/screenshots opens this page.tsx

import UploadForm from "./UploadForm";

import ScreenshotCard from "./ScreenshotCard";

import DetailPanel from "./DetailPanel";

import { getScreenshots } from "./getScreenshots";


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
                <UploadForm />
            </div>
            <div className="grid grid-cols-3 gap-4 p-4">
                {screenshots.map((screenshot) => (
                    <ScreenshotCard key={screenshot.id} screenshot={screenshot} q={q} />
                ))}
            </div>
            {selected && <DetailPanel screenshot={selected} q={q}/>}
        </div>

    )
}