import {NextResponse} from "next/server";
import {getLegalMarkdown, type LegalDoc} from "@/shared/lib/legal/getLegalMarkdown";

type LegalRequest = {
    doc?: unknown;
    locale?: unknown;
};

function normalizeDoc(value: unknown): LegalDoc | null {
    if (value === "terms" || value === "privacy") return value;
    return null;
}

function normalizeLocale(value: unknown) {
    return value === "de" ? "de" : "en";
}

export async function GET(req: Request) {
    const {searchParams} = new URL(req.url);
    const doc = normalizeDoc(searchParams.get("doc"));
    const locale = normalizeLocale(searchParams.get("locale"));

    if (!doc) {
        return NextResponse.json({error: "Invalid legal document"}, {status: 400});
    }

    try {
        const markdown = getLegalMarkdown(doc, locale);
        return NextResponse.json({doc, locale, markdown}, {status: 200});
    } catch {
        return NextResponse.json({error: "Legal document not found"}, {status: 404});
    }
}

export async function POST(req: Request) {
    let body: LegalRequest = {};
    try {
        body = (await req.json()) as LegalRequest;
    } catch {
        return NextResponse.json({error: "Invalid JSON"}, {status: 400});
    }

    const doc = normalizeDoc(body.doc);
    const locale = normalizeLocale(body.locale);
    if (!doc) {
        return NextResponse.json({error: "Invalid legal document"}, {status: 400});
    }

    try {
        const markdown = getLegalMarkdown(doc, locale);
        return NextResponse.json({doc, locale, markdown}, {status: 200});
    } catch {
        return NextResponse.json({error: "Legal document not found"}, {status: 404});
    }
}
