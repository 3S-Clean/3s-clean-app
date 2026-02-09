export const LEGAL_VERSION = "2026-02-09";

export type LegalConsentSnapshot = {
    termsRead: boolean;
    privacyRead: boolean;
    accepted: boolean;
    acceptedAt: string;
    version: string;
};

export function isLegalConsentComplete(consent: {
    termsRead: unknown;
    privacyRead: unknown;
    accepted: unknown;
    acceptedAt: unknown;
    version?: unknown;
}) {
    const acceptedAt =
        typeof consent.acceptedAt === "string" ? consent.acceptedAt.trim() : "";
    const hasValidAcceptedAt = acceptedAt.length > 0 && !Number.isNaN(Date.parse(acceptedAt));

    return (
        consent.termsRead === true &&
        consent.privacyRead === true &&
        consent.accepted === true &&
        hasValidAcceptedAt
    );
}

export function formatLegalConsentNote(snapshot: LegalConsentSnapshot) {
    return [
        "[legal-consent]",
        `version: ${snapshot.version}`,
        `accepted: ${snapshot.accepted ? "yes" : "no"}`,
        `accepted_at: ${snapshot.acceptedAt}`,
        `terms_read: ${snapshot.termsRead ? "yes" : "no"}`,
        `privacy_read: ${snapshot.privacyRead ? "yes" : "no"}`,
    ].join("\n");
}
