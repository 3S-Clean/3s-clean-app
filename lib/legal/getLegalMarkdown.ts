import {readFileSync} from "node:fs";
import {join} from "node:path";

export type LegalDoc = "imprint" | "privacy" | "terms";
export type LegalLocale = "en" | "de";

function normalizeLocale(locale: unknown): LegalLocale {
    return locale === "de" ? "de" : "en"; // default -> en
}


export function getLegalMarkdown(doc: LegalDoc, locale: unknown) {
    const safeLocale = normalizeLocale(locale);
    const filename = `${doc}.${safeLocale}.md`;
    const fullPath = join(process.cwd(), "content", "legal", filename);
    return readFileSync(fullPath, "utf8");
}