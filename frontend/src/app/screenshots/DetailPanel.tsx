import type { Screenshot } from "./types"
import Link from "next/link";

import DeleteButton from "./DeleteButton";

import { getStatusLabel } from "./getStatusLabel";

export default function DetailPanel({ screenshot, q } : { screenshot: Screenshot; q?: string }) {

    const closeHref = q ? `?q=${encodeURIComponent(q)}` : "/screenshots";


    return (
        <div className="fixed inset-0 bg-black/40 flex justify-end z-50">
            <Link href={closeHref} className="absolute inset-0" aria-label="Close" />
            <div className="relative bg-white w-full max-w-md h-full overflow-y-auto p-4 flex flex-col gap-3">
                <Link href={closeHref} className="self-end text-sm text-gray-400 hover:text-gray-600">
                    Close
                </Link>

                <img src={screenshot.image_url} alt={screenshot.category ?? "Saved screenshot"} className="w-full rounded"/>

                <p className={screenshot.status === "pending" ? "font-semibold text-gray-600 text-lg"
                    : screenshot.status === "failed" ? "font-semibold text-red-600 text-lg"
                        : "font-semibold text-amber-700 text-lg"}>
                    {getStatusLabel(screenshot)}
                </p>

                {screenshot.ai_summary && (
                    <p className="text-sm text-gray-600">{screenshot.ai_summary}</p>
                )}

                <div className="flex gap-2 text-xs">
                    {screenshot.programming_language && (
                        <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">
                            {screenshot.programming_language}
                        </span>
                    )}
                    {screenshot.source_platform && (
                        <span className="bg-gray-100 px-2 py-0.5 rounded">
                            {screenshot.source_platform}
                        </span>
                    )}
                </div>

                <p className="text-xs text-gray-400">
                    {new Date(screenshot.created_at).toLocaleDateString()}
                </p>

                {screenshot.extracted_text && (
                    <div>
                        <p className="text-xs uppercase text-gray-500 mb-1">
                            Extracted Text
                        </p>
                        <pre className="font-mono text-xs bg-gray-50 border border-gray-200 rounded p-2 max-h-64 overflow-y-auto whitespace-pre-wrap">
                            {screenshot.extracted_text}
                        </pre>
                    </div>
                )}

                <div className="border-t border-gray-200 pt-3 mt-2 flex justify-center">
                    <DeleteButton screenshot_id={screenshot.id} closeHref={closeHref}></DeleteButton>
                </div>

            </div>
        </div>
    )
}