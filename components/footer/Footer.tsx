"use client";

import Link from "next/link";
import {footerColumns, legalLinks} from "@/lib/navigation/navigation";
import {CONTENT_GUTTER, PAGE_CONTAINER} from "@/components/ui/layout";

export default function AccountFooter() {
    const currentYear = new Date().getFullYear();

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
                    {/* Navigation Columns - single row on desktop, 3 columns on tablet, 1 column on mobile */}
                    <div
                        className="
              flex w-full flex-col gap-6
              md:grid md:grid-cols-3 md:gap-8
              lg:flex lg:flex-row lg:gap-12
            "
                    >
                        {footerColumns.map((column) => (
                            <div key={column.title} className="flex flex-col gap-2 lg:gap-3">
                                <h3
                                    className="
                    m-0 font-semibold
                    text-[16px] leading-[110%]
                    text-black/90 dark:text-white/90
                    lg:text-[18px] lg:leading-[150%]
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
                          text-[13px] leading-[100%]
                          text-black/90 dark:text-white/70
                          lg:text-[15px] lg:leading-[130%]
                        "
                                            >
                                                {link.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}

                        {/* Resources (3rd on tablet) */}
                        <div className="flex flex-col gap-2 lg:gap-3">
                            <h3
                                className="
                  m-0 font-semibold
                  text-[16px] leading-[110%]
                  text-black/90 dark:text-white/90
                  lg:text-[18px] lg:leading-[150%]
                "
                            >
                                Resources
                            </h3>
                            <ul className="m-0 flex list-none flex-col gap-2 p-0">
                                {legalLinks.map((link) => (
                                    <li key={link.href}>
                                        <Link
                                            href={link.href}
                                            className="
                        cursor-pointer no-underline transition-opacity duration-200 hover:opacity-70
                        text-[13px] leading-[100%]
                        text-black/90 dark:text-white/70
                        lg:text-[15px] lg:leading-[130%]
                      "
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Connect */}
                        <div className="flex flex-col gap-2 lg:gap-3">
                            <h3
                                className="
                  m-0 font-semibold
                  text-[16px] leading-[110%]
                  text-black/90 dark:text-white/90
                  lg:text-[18px] lg:leading-[150%]
                "
                            >
                                Connect
                            </h3>

                            <ul className="m-0 flex list-none flex-col gap-2 p-0">
                                <li>
                                    <Link
                                        href="https://instagram.com/3s_clean.de"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="
                      cursor-pointer no-underline transition-opacity duration-200 hover:opacity-70
                      text-[13px] leading-[100%]
                      text-black/90 dark:text-white/70
                      lg:text-[15px] lg:leading-[130%]
                    "
                                    >
                                        Instagram
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="https://youtube.com/@3sclean"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="
                      cursor-pointer no-underline transition-opacity duration-200 hover:opacity-70
                      text-[13px] leading-[100%]
                      text-black/90 dark:text-white/70
                      lg:text-[15px] lg:leading-[130%]
                    "
                                    >
                                        YouTube
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="https://tiktok.com/@3sclean"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="
                      cursor-pointer no-underline transition-opacity duration-200 hover:opacity-70
                      text-[13px] leading-[100%]
                      text-black/90 dark:text-white/70
                      lg:text-[15px] lg:leading-[130%]
                    "
                                    >
                                        TikTok
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Copyright */}
                    <div
                        className="
              mt-5 flex w-full flex-col gap-[10px]
              border-t border-t-[rgba(0,0,0,0.06)]
              dark:border-t-[rgba(255,255,255,0.12)]
            "
                    >
                        <p
                            className="
                flex items-start
                text-[12px] leading-[120%]
                text-[rgb(154,154,154)] dark:text-[rgba(255,255,255,0.45)]
                lg:text-[13px] lg:leading-[130%]
              "
                        >
                            © {currentYear} 3S-Clean. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}