"use client";

import "./footer.css";
import Link from "next/link";
import type { ReactNode } from "react";
import { FiYoutube, FiInstagram } from "react-icons/fi";
import { LuMessageCircle } from "react-icons/lu";
import { RiTiktokLine } from "react-icons/ri";
import { footerColumns, legalLinks } from "@/lib/navigation/navigation";

interface SocialLink {
    icon: ReactNode;
    href: string;
    label: string;
}

export default function AccountFooter() {
    const currentYear = new Date().getFullYear();

    const socialLinks: SocialLink[] = [
        {
            icon: <FiYoutube className="social-icon" />,
            href: "https://youtube.com/@3sclean",
            label: "YouTube",
        },
        {
            icon: <LuMessageCircle className="social-icon" />,
            href: "https://wa.me/your-number",
            label: "WhatsApp",
        },
        {
            icon: <RiTiktokLine className="social-icon" />,
            href: "https://tiktok.com/@3sclean",
            label: "TikTok",
        },
        {
            icon: <FiInstagram className="social-icon" />,
            href: "https://instagram.com/3sclean",
            label: "Instagram",
        },
    ];

    return (
        <footer className="footer">
            <div className="footer-inner">
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
            </div>
        </footer>
    );
}
