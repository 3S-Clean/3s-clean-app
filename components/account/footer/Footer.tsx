"use client";

import "./footer.css";

import Link from "next/link";
import type { ReactNode } from "react";
import { Youtube, Instagram } from "lucide-react";

import { footerColumns, legalLinks } from "@/lib/navigation/navigation";

interface SocialLink {
    icon: ReactNode;
    href: string;
    label: string;
}

// TikTok icon
const TikTokIcon = ({ className = "" }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
);

// WhatsApp icon
const WhatsAppIcon = ({ className = "" }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
);

function FooterLinkItem({
                            href,
                            external,
                            className,
                            children,
                        }: {
    href: string;
    external?: boolean;
    className: string;
    children: ReactNode;
}) {
    if (external) {
        return (
            <a href={href} className={className} target="_self" rel="noreferrer">
                {children}
            </a>
        );
    }
    return (
        <Link href={href} className={className}>
            {children}
        </Link>
    );
}

export default function AccountFooter() {
    const currentYear = new Date().getFullYear();

    const socialLinks: SocialLink[] = [
        { icon: <Youtube className="social-icon" strokeWidth={1.5} />, href: "https://youtube.com/@3sclean", label: "YouTube" },
        { icon: <WhatsAppIcon className="social-icon" />, href: "https://wa.me/your-number", label: "WhatsApp" },
        { icon: <TikTokIcon className="social-icon" />, href: "https://tiktok.com/@3sclean", label: "TikTok" },
        { icon: <Instagram className="social-icon" strokeWidth={1.5} />, href: "https://instagram.com/3sclean", label: "Instagram" },
    ];

    return (
        <footer className="footer">
            {/* Navigation Columns */}
            <div className="footer-columns">
                {footerColumns.map((column) => (
                    <div key={column.title} className="footer-column">
                        <h3 className="footer-column-title">{column.title}</h3>
                        <ul className="footer-column-links">
                            {column.links.map((link) => (
                                <li key={`${column.title}-${link.href}`}>
                                    <FooterLinkItem href={link.href} external={link.external} className="footer-column-link">
                                        {link.label}
                                    </FooterLinkItem>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            {/* Legal Section */}
            <div className="footer-legal">
                <h4 className="footer-legal-title">Legal</h4>

                <div className="footer-legal-links">
                    {legalLinks.map((link, index) => (
                        <span key={link.href}>
              <FooterLinkItem href={link.href} external={link.external} className="footer-legal-link">
                {link.label}
              </FooterLinkItem>

                            {index < legalLinks.length - 1 && <span className="footer-legal-separator" />}
            </span>
                    ))}
                </div>

                <p className="footer-copyright">© {currentYear} 3S-Clean. All rights reserved.</p>
            </div>

            {/* Social Links */}
            <div className="footer-social">
                {socialLinks.map((social) => (
                    <a
                        key={social.label}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="footer-social-link"
                        aria-label={social.label}
                    >
                        {social.icon}
                    </a>
                ))}
            </div>
        </footer>
    );
}