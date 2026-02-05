// /lib/navigation/navigation.ts
export const mainNav = [
    {label: "Promise", href: "/promise"},
    {label: "Experiences", href: "/experience"},
    {label: "Story", href: "/story"},
    {label: "FAQ", href: "/faq"},
    {label: "Contact", href: "/contact"},
];

export type FooterLink = { labelKey: string; href: string };
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
            {labelKey: "footer.columns.resources.links.impressum", href: "/impressum"},
            {labelKey: "footer.columns.resources.links.datenschutz", href: "/datenschutz"},
            {labelKey: "footer.columns.resources.links.agb", href: "/agb"},
        ],
    },
];