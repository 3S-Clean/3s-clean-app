export const WEBFLOW_BASE = "https://s3-final.webflow.io";

export function webflowUrl(path = "/") {
    const url = new URL(path, WEBFLOW_BASE);

    // флаг, по которому Webflow прячет Sign Up / Log In и показывает Account
    url.searchParams.set("auth", "1");

    return url.toString();
}


export type NavItem = {
    label: string;
    href: string;
    external?: boolean;
};

export const mainNav: NavItem[] = [
    { label: "Experience", href: webflowUrl("/experience"), external: true },
    { label: "Definition", href: webflowUrl("/definition"), external: true },
    { label: "Inside 3S", href: webflowUrl("/inside-3s"), external: true },
    { label: "FAQ", href: webflowUrl("/faq"), external: true },
];

// --- Footer
export type FooterLink = {
    label: string;
    href: string;
    external?: boolean;
};

export type FooterColumn = {
    title: string;
    links: FooterLink[];
};

export type LegalLink = {
    label: string;
    href: string;
    external?: boolean;
};

export const footerColumns: FooterColumn[] = [
    {
        title: "Get Started",
        links: [
            // берём из mainNav (Experience)
            { label: "Experience", href: mainNav[0].href, external: true },
            { label: "Booking", href: "/book" },
        ],
    },
    {
        title: "Explore",
        links: [
            // берём из mainNav (Inside 3S)
            { label: "Inside 3S", href: mainNav[2].href, external: true },
            { label: "Careers", href: `${WEBFLOW_BASE}/career`, external: true },
        ],
    },
    {
        title: "Help & Support",
        links: [
            // берём из mainNav (FAQ)
            { label: "FAQ", href: mainNav[3].href, external: true },
            { label: "Contact", href: `${WEBFLOW_BASE}/contact`, external: true },
        ],
    },
];

export const legalLinks: LegalLink[] = [
    { label: "Impressum", href: `${WEBFLOW_BASE}/impressum`, external: true },
    { label: "Datenschutz", href: `${WEBFLOW_BASE}/datenschutz`, external: true },
    { label: "AGB", href: `${WEBFLOW_BASE}/agb`, external: true },
];