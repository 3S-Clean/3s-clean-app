export const mainNav = [
    { label: "Inside", href: "/inside" },
    { label: "Experience", href: "/experience" },
    { label: "Definition", href: "/definition" },
    { label: "FAQ", href: "/faq" },
    { label: "Contact", href: "/contact" },
];

// --- Footer
export type FooterLink = {
    label: string;
    href: string;
};

export type FooterColumn = {
    title: string;
    links: FooterLink[];
};

export type LegalLink = {
    label: string;
    href: string;
};
export const footerColumns: FooterColumn[] = [
    {
        title: "Get Started",
        links: [
            { label: "Experience", href: "/experience" },
            { label: "Booking", href: "/booking" },
        ],
    },
    {
        title: "Explore",
        links: [
            { label: "Inside 3S", href: "/inside" },
            // если Careers пока нет в app — лучше убрать, чем вести наружу
            // { label: "Careers", href: "/careers" },
        ],
    },
    {
        title: "Help & Support",
        links: [
            { label: "FAQ", href: "/faq" },
            { label: "Contact", href: "/contact" },
        ],
    },
];

export const legalLinks: LegalLink[] = [
    { label: "Impressum", href: "/impressum" },
    { label: "Datenschutz", href: "/datenschutz" },
    { label: "AGB", href: "/agb" },
];