//since res.json returns type 'any', since project's tsconfig.json has strict: true
//which includes a rule called noImplicitAny, it refuses to let a type silently become 'any
//without me explicitly acknowledging it
export type Screenshot = {
    id: number;
    image_url: string;
    extracted_text: string | null;
    category: string | null;
    ai_summary: string | null;
    programming_language: string | null;
    source_platform: string | null;
    created_at: string;

    status: "pending" | "completed" | "failed";

};
