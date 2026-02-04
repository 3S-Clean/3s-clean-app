// /lib/navigation/navigation.ts
export const mainNav = [
    {label: "Promise", href: "/promise"},
    {label: "Experiences", href: "/experience"},
    {label: "Story", href: "/story"},
    {label: "FAQ", href: "/faq"},
    {label: "Contact", href: "/contact"},
];

export type FooterLink = { label: string; href: string };
export type FooterColumn = { title: string; links: FooterLink[] };
export type LegalLink = { label: string; href: string };

export const footerColumns: FooterColumn[] = [
    {
        title: "Get Started",
        links: [
            {label: "Experiences", href: "/experience"},
            {label: "Booking", href: "/booking"},
        ],
    },
    {
        title: "Explore",
        links: [
            {label: "Promise", href: "/promise"},
            {label: "Story", href: "/story"},
        ],
    },
    {
        title: "Support",
        links: [
            {label: "FAQ", href: "/faq"},
            {label: "Contact", href: "/contact"},
        ],
    },
];

export const legalLinks: LegalLink[] = [
    {label: "Impressum", href: "/impressum"},
    {label: "Datenschutz", href: "/datenschutz"},
    {label: "AGB", href: "/agb"},
];