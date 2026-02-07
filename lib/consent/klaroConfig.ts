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
        hideDeclineAll: false,
        hideLearnMore: false,
        noticeAsModal: false,
        disablePoweredBy: true,

        elementID: "klaro",

        translations: {
            [lang]: {
                privacyPolicyUrl: `/${lang}/privacy`,
                cookiePolicyUrl: `/${lang}/privacy#cookies`,

                consentNotice: {
                    title: isDE ? "Cookies & Datenschutz" : "Cookies & Privacy",
                    description: isDE
                        ? "Wir verwenden notwendige Cookies für Grundfunktionen. Sie können alles ablehnen, alles akzeptieren oder Details einstellen."
                        : "We use essential cookies for basic functionality. You can reject all, accept all, or adjust details.",
                },

                consentModal: {
                    title: isDE ? "Cookie-Einstellungen" : "Cookie settings",
                    description: isDE
                        ? "Wählen Sie aus, welche Kategorien Sie erlauben. Notwendige Cookies sind immer aktiv. Mehr erfahren Sie in unserer {privacyPolicy}."
                        : "Choose which categories you allow. Essential cookies are always enabled. To learn more, please read our {privacyPolicy}.",
                },

                acceptAll: isDE ? "Alle akzeptieren" : "Accept all",
                acceptSelected: isDE ? "Auswahl speichern" : "Save selection",
                decline: isDE ? "Alle ablehnen" : "Reject all",
                close: isDE ? "Schließen" : "Close",
                learnMore: isDE ? "Einstellungen" : "Settings",

                // ✅ IMPORTANT: must be a STRING for {privacyPolicy} placeholder to render as a link
                privacyPolicy: isDE ? "Datenschutzerklärung" : "privacy policy",

                purposes: {
                    necessary: {
                        title: isDE ? "Notwendig" : "Necessary",
                        description: isDE
                            ? "Sitzung, Sicherheit und Einwilligungsspeicher"
                            : "Session, security, and consent storage",
                    },
                    external: {
                        title: isDE ? "Externe Medien" : "External media",
                        description: isDE
                            ? "YouTube-Videos und eingebettete Inhalte"
                            : "YouTube videos and embedded content",
                    },
                    analytics: {
                        title: isDE ? "Statistik" : "Analytics",
                        description: isDE
                            ? "Anonyme Nutzungsstatistiken zur Verbesserung"
                            : "Anonymous usage statistics for improvement",
                    },
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
            {
                name: "youtube",
                title: "YouTube",
                purposes: ["external"],
                required: false,
            },
            {
                name: "analytics",
                title: isDE ? "Website-Statistik" : "Website analytics",
                purposes: ["analytics"],
                required: false,
            },
        ],
    };
}