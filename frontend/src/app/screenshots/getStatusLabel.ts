import type { Screenshot } from "./types";

export function getStatusLabel(screenshot: Screenshot): string {

    switch(screenshot.status) {
        case "pending":
            return "loading category";
        case "completed":
            return screenshot.category ?? "Uncategorized";
        case "failed":
            return "Classification failed";
        default:
            return "Unknown status";
    }
}