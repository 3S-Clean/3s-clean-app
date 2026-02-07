// lib/consent/klaroConfig.ts
export type KlaroLang = "en" | "de";

export function getKlaroConfig(lang: KlaroLang) {
    const isDE = lang === "de";

    return {
        storageName: "klaro",
        cookieName: "klaro",
        htmlTexts: false,

        mustConsent: true,
        acceptAll: true,
        hideDeclineAll: false, // ✅ показываем Reject all
        hideLearnMore: false,  // ✅ показываем Settings
        noticeAsModal: false,  // ✅ старт = маленький notice, НЕ центр-модалка
        disablePoweredBy: true,

        elementID: "klaro",

        translations: {
            [lang]: {
                privacyPolicyUrl: `/${lang}/privacy`,
                cookiePolicyUrl: `/${lang}/privacy#cookies`,

                // START (notice) — коротко + 3 действия
                consentNotice: {
                    title: isDE ? "Cookies & Datenschutz" : "Cookies & Privacy",
                    description: isDE
                        ? "Wir verwenden notwendige Cookies für Grundfunktionen. Sie können alles ablehnen, alles akzeptieren oder Details einstellen."
                        : "We use essential cookies for basic functionality. You can reject all, accept all, or adjust details.",
                },

                // MODAL (settings)
                consentModal: {
                    title: isDE ? "Cookie-Einstellungen" : "Cookie settings",
                    description: isDE
                        ? "Wählen Sie aus, welche Kategorien Sie erlauben. Notwendige Cookies sind immer aktiv."
                        : "Choose which categories you allow. Essential cookies are always enabled.",
                },

                // Button labels
                acceptAll: isDE ? "Alle akzeptieren" : "Accept all",
                acceptSelected: isDE ? "Auswahl speichern" : "Save selection",
                decline: isDE ? "Alle ablehnen" : "Reject all",
                close: isDE ? "Schließen" : "Close",

                // Klaro uses this as “learn more / settings”
                learnMore: isDE ? "Einstellungen" : "Settings",

                purposes: {
                    necessary: isDE ? "Notwendig" : "Necessary",
                    external: isDE ? "Externe Medien" : "External media",
                    analytics: isDE ? "Statistik" : "Analytics",
                },
            },
        },

        services: [
            {
                name: "essential",
                title: isDE ? "Technisch notwendige Cookies" : "Essential cookies",
                purposes: ["necessary"],
                required: true,
            },
            // Оставь, если планируешь YouTube embed (iframe). Если только ссылка — можешь удалить.
            {
                name: "youtube",
                title: "YouTube",
                purposes: ["external"],
                required: false,
            },
            // GA включишь позже
            {
                name: "analytics",
                title: isDE ? "Website-Statistik" : "Website analytics",
                purposes: ["analytics"],
                required: false,
            },
        ],
    };
}