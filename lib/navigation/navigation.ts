export const mainNav = [
    {key: "promise", href: "/promise"},
    {key: "experiences", href: "/experience"},
    {key: "story", href: "/story"},
    {key: "faq", href: "/faq"},
    {key: "contact", href: "/contact"},
] as const;

export type Locale = "de" | "en";
export type LocalizedHref = string | { de: string; en: string };

export type FooterLink = { labelKey: string; href: LocalizedHref };
export type FooterColumn = { titleKey: string; links: FooterLink[] };

export const footerColumns: FooterColumn[] = [
    {
        titleKey: "footer.columns.getStarted.title",
        links: [
            {labelKey: "footer.columns.getStarted.links.experiences", href: "/experience"},
            {labelKey: "footer.columns.getStarted.links.booking", href: "/booking"},
        ],
    },
    {
        titleKey: "footer.columns.explore.title",
        links: [
            {labelKey: "footer.columns.explore.links.promise", href: "/promise"},
            {labelKey: "footer.columns.explore.links.story", href: "/story"},
        ],
    },
    {
        titleKey: "footer.columns.support.title",
        links: [
            {labelKey: "footer.columns.support.links.faq", href: "/faq"},
            {labelKey: "footer.columns.support.links.contact", href: "/contact"},
        ],
    },
    {
        titleKey: "footer.columns.connect.title",
        links: [
            {labelKey: "footer.columns.connect.links.tiktok", href: "https://tiktok.com/@3sclean"},
            {labelKey: "footer.columns.connect.links.youtube", href: "https://youtube.com/@3sclean"},
            {labelKey: "footer.columns.connect.links.instagram", href: "https://instagram.com/3s_clean.de"},
        ],
    },
    {
        titleKey: "footer.columns.resources.title",
        links: [
            {
                labelKey: "footer.columns.resources.links.impressum",
                href: {de: "/impressum", en: "/imprint"},
            },
            {
                labelKey: "footer.columns.resources.links.datenschutz",
                href: {de: "/datenschutz", en: "/privacy"},
            },
            {
                labelKey: "footer.columns.resources.links.agb",
                href: {de: "/agb", en: "/terms"},
            },
        ],
    },
];