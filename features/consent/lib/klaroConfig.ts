export type KlaroLang = "en" | "de";

export function getKlaroConfig(lang: KlaroLang) {
    const isDE = lang === "de";

    return {
        // ✅ Tell Klaro which language to render
        lang,

        storageName: "klaro",
        cookieName: "klaro",

        // ✅ Allow HTML in texts so we can render a real <a> link
        htmlTexts: true,

        mustConsent: true,
        acceptAll: true,
        hideDeclineAll: false,
        hideLearnMore: false,
        noticeAsModal: false,
        disablePoweredBy: true,

        elementID: "klaro",

        translations: {
            // ✅ Always define both languages so Klaro can resolve them
            en: {
                privacyPolicyUrl: "/en/privacy",
                cookiePolicyUrl: "/en/privacy#cookies",

                consentNotice: {
                    title: "Cookies & Privacy",
                    description:
                        "We use essential cookies for basic functionality. You can reject all, accept all, or adjust details.",
                },

                consentModal: {
                    title: "Cookie settings",
                    description:
                        "Choose which categories you allow. Essential cookies are always enabled.",
                },

                acceptAll: "Accept all",
                acceptSelected: "Save selection",
                decline: "Reject all",
                close: "Close",
                learnMore: "Settings",

                purposes: {
                    necessary: {
                        title: "Necessary",
                        description:
                            "Session, security, and consent storage. Always required.",
                    },
                    external: {
                        title: "External media",
                        description:
                            "YouTube videos and embedded content",
                    },
                    analytics: {
                        title: "Analytics",
                        description:
                            "Anonymous usage statistics for improvement",
                    },
                },
            },

            de: {
                privacyPolicyUrl: "/de/privacy",
                cookiePolicyUrl: "/de/privacy#cookies",

                consentNotice: {
                    title: "Cookies & Datenschutz",
                    description:
                        "Wir verwenden notwendige Cookies für Grundfunktionen. Sie können alles ablehnen, alles akzeptieren oder Details einstellen.",
                },

                consentModal: {
                    title: "Cookie-Einstellungen",
                    description:
                        "Wählen Sie aus, welche Kategorien Sie erlauben. Notwendige Cookies sind immer aktiv.",
                },

                acceptAll: "Alle akzeptieren",
                acceptSelected: "Auswahl speichern",
                decline: "Alle ablehnen",
                close: "Schließen",
                learnMore: "Einstellungen",

                purposes: {
                    necessary: {
                        title: "Notwendig",
                        description:
                            "Sitzung, Sicherheit und Einwilligungsspeicher. Immer erforderlich.",
                    },
                    external: {
                        title: "Externe Medien",
                        description:
                            "YouTube-Videos und eingebettete Inhalte",
                    },
                    analytics: {
                        title: "Statistik",
                        description:
                            "Anonyme Nutzungsstatistiken zur Verbesserung",
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