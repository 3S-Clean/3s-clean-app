"use client";

import Link from "next/link";
import type {ReactNode} from "react";
import {FiYoutube, FiInstagram} from "react-icons/fi";
import {LuMessageCircle} from "react-icons/lu";
import {RiTiktokLine} from "react-icons/ri";
import {footerColumns, legalLinks} from "@/lib/navigation/navigation";
import {PAGE_CONTAINER, CONTENT_GUTTER} from "@/components/ui/layout";

interface SocialLink {
    icon: ReactNode;
    href: string;
    label: string;
}

export default function AccountFooter() {
    const currentYear = new Date().getFullYear();

    const socialLinks: SocialLink[] = [
        {
            icon: <FiYoutube className="w-5 h-5 sm:w-6 sm:h-6"/>,
            href: "https://youtube.com/@3sclean",
            label: "YouTube",
        },
        {
            icon: <LuMessageCircle className="w-5 h-5 sm:w-6 sm:h-6"/>,
            href: "https://wa.me/your-number",
            label: "WhatsApp",
        },
        {
            icon: <RiTiktokLine className="w-5 h-5 sm:w-6 sm:h-6"/>,
            href: "https://tiktok.com/@3sclean",
            label: "TikTok",
        },
        {
            icon: <FiInstagram className="w-5 h-5 sm:w-6 sm:h-6"/>,
            href: "https://instagram.com/3s_clean.de",
            label: "Instagram",
        },
    ];

    return (
        <footer
            className="
                flex w-full flex-col items-center justify-center
                bg-[#f8f9fa] dark:bg-[#070A0D]
                gap-6
                pt-8 pb-5
                lg:pt-[80px] lg:pb-[50px] lg:gap-8
            "
        >
            <div className={PAGE_CONTAINER}>
                <div className={CONTENT_GUTTER}>
                    {/* Navigation Columns */}
                    <div
                        className="
                        flex w-full flex-col gap-6
                        lg:flex-row lg:flex-wrap lg:gap-12
                    "
                    >
                        {footerColumns.map((column) => (
                            <div key={column.title} className="flex min-w-[140px] flex-col gap-2 lg:gap-3">
                                <h3
                                    className="
                                    m-0 font-semibold
                                    text-[18px] leading-[110%]
                                    text-[rgb(26,26,26)] dark:text-[rgba(255,255,255,0.92)]
                                    lg:text-[20px] lg:leading-[150%]
                                "
                                >
                                    {column.title}
                                </h3>

                                <ul className="m-0 flex list-none flex-col gap-2 p-0">
                                    {column.links.map((link) => (
                                        <li key={link.href}>
                                            <Link
                                                href={link.href}
                                                className="
                                            cursor-pointer no-underline transition-opacity duration-200 hover:opacity-70
                                            text-[15px] leading-[100%]
                                            text-[rgb(26,26,26)] dark:text-[rgba(255,255,255,0.92)]
                                            lg:text-[18px] lg:leading-[140%]
                                          "
                                            >
                                                {link.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    {/* Legal */}
                    <div className="mt-[18px] flex w-full flex-col gap-2">
                        <h4
                            className="
                  m-0 font-medium
                  text-[17px] leading-[110%]
                  text-[rgb(26,26,26)] dark:text-[rgba(255,255,255,0.92)]
                  lg:text-[20px] lg:leading-[150%]
                "
                        >
                            Legal
                        </h4>

                        <div className="flex flex-wrap items-center gap-4">
                            {legalLinks.map((link) => (
                                <span key={link.href}>
                <Link
                    href={link.href}
                    className="
                    no-underline transition-opacity duration-200 hover:opacity-70
                    text-[14px] leading-[120%]
                    text-[rgb(26,26,26)] dark:text-[rgba(255,255,255,0.92)]
                    lg:text-[17px] lg:leading-[140%]
                  "
                >
                  {link.label}
                </Link>
              </span>
                            ))}
                        </div>
                    </div>

                    {/* Social */}
                    <div
                        className="
            mt-5 flex w-full flex-col gap-[10px]
            border-t border-t-[rgba(0,0,0,0.06)]
            dark:border-t-[rgba(255,255,255,0.12)]
            lg:flex-row lg:items-center lg:justify-between lg:gap-0
          "
                    >
                        <p
                            className="
              flex items-start
              text-[14px] leading-[120%]
              text-[rgb(154,154,154)] dark:text-[rgba(255,255,255,0.45)]
              lg:text-[15px] lg:leading-[130%]
            "
                        >
                            © {currentYear} 3S-Clean. All rights reserved.
                        </p>

                        <div className="flex items-start gap-[5px]">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="
                  transition-[opacity,transform] duration-200
                  text-[rgb(26,26,26)] dark:text-[rgba(255,255,255,0.8)]
                  hover:opacity-70 hover:-translate-y-[1px]
                "
                                    aria-label={social.label}
                                >
                                    {social.icon}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}