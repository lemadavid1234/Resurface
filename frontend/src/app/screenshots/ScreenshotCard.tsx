import type { Screenshot } from './types';

import Link from "next/link";

import { getStatusLabel } from "./getStatusLabel";

//UI: display how long ago screenshot was posted
function formatRelativeDate(isoString: string): string {

    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMinutes = Math.floor(diffMs / 1000 / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return "just now";
    if (diffHours < 1) return `${diffMinutes}m ago`;
    if (diffDays < 1) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(isoString).toLocaleDateString(); //if over a week return "MM/DD/YYYY"

}


export default function ScreenshotCard({ screenshot, q }: { screenshot: Screenshot; q?: string }) {

    const href = q
        ? `?q=${encodeURIComponent(q)}&screenshot=${screenshot.id}`
        : `?screenshot=${screenshot.id}`;

    return (
        <Link href={href} className='block border border-gray-400 rounded-lg overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition'>
            <img src={screenshot.image_url} alt={screenshot.category ?? "Saved screenshot"} className="w-full" />
            <div className="p-3 flex flex-col gap-1">
                <p className={screenshot.status === "pending" ? "font-semibold text-gray-600"
                    : screenshot.status === "failed" ? "font-semibold text-red-600"
                        : "font-semibold text-amber-700"}>
                    {getStatusLabel(screenshot)}
                </p>

                {screenshot.ai_summary && (
                    <p className="text-sm text-gray-600 line-clamp-3">
                        {screenshot.ai_summary}
                    </p>
                )}

                <div className="flex gap-2 justify-between text-xs mt-1">
                    {screenshot.programming_language ? (
                        <span className="font-mono bg-gray-100 px-2">
                            {screenshot.programming_language}
                        </span>
                    ) : (
                        <span className="font-mono bg-gray-100 px-2">
                            no_lang
                        </span>
                    )}
                    {screenshot.source_platform ? (
                        <span className="font-mono bg-gray-100 px-2">
                            {screenshot.source_platform}
                        </span>
                    ) : (
                        <span className="font-mono bg-gray-100 px-2">
                            no_source
                        </span>
                    )}
                </div>

                <p className="text-sm text-gray-400 mt-1">
                    {formatRelativeDate(screenshot.created_at)}
                </p>
            </div>
        </Link>
    )
}
