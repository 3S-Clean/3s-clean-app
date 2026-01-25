"use client";

import "./footer.css";
import Link from "next/link";
import type { ReactNode } from "react";
import {
    Youtube,
    Instagram,
    MessageCircle, // WhatsApp replacement
} from "lucide-react";
import { footerColumns, legalLinks } from "@/lib/navigation/navigation";

interface SocialLink {
    icon: ReactNode;
    href: string;
    label: string;
}

/* -----------------------------
   Unified Stroke Icons
------------------------------ */

// TikTok (stroke version, unified style)
const TikTokIcon = ({ className = "" }: { className?: string }) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden
    >
        <path d="M9 3v10.5a3.5 3.5 0 1 1-2.5-3.36" />
        <path d="M9 3c1.5 2.5 4 4 6.5 4v3.2c-2.7 0-5-1.2-6.5-3" />
    </svg>
);

// WhatsApp (stroke version)
const WhatsAppIcon = ({ className = "" }: { className?: string }) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden
    >
        <path d="M20 11.5a8.5 8.5 0 1 1-3.5-6.9" />
        <path d="M8.5 8.5c.5 2 4 5 6 6" />
        <path d="M14.5 14.5l2-2" />
    </svg>
);

export default function AccountFooter() {
    const currentYear = new Date().getFullYear();

    const socialLinks: SocialLink[] = [
        {
            icon: <Youtube className="social-icon" strokeWidth={1.5} />,
            href: "https://youtube.com/@3sclean",
            label: "YouTube",
        },
        {
            icon: <WhatsAppIcon className="social-icon" />,
            href: "https://wa.me/your-number",
            label: "WhatsApp",
        },
        {
            icon: <TikTokIcon className="social-icon" />,
            href: "https://tiktok.com/@3sclean",
            label: "TikTok",
        },
        {
            icon: <Instagram className="social-icon" strokeWidth={1.5} />,
            href: "https://instagram.com/3sclean",
            label: "Instagram",
        },
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
                                <li key={link.href}>
                                    <Link href={link.href} className="footer-column-link">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            {/* Legal */}
            <div className="footer-legal">
                <h4 className="footer-legal-title">Legal</h4>
                <div className="footer-legal-links">
                    {legalLinks.map((link, i) => (
                        <span key={link.href}>
              <Link href={link.href} className="footer-legal-link">
                {link.label}
              </Link>
                            {i < legalLinks.length - 1 && (
                                <span className="footer-legal-separator" />
                            )}
            </span>
                    ))}
                </div>
                <p className="footer-copyright">
                    © {currentYear} 3S-Clean. All rights reserved.
                </p>
            </div>

            {/* Social */}
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