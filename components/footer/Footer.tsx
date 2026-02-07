"use client";

import Link from "next/link";
import {usePathname} from "next/navigation";
import {useTranslations} from "next-intl";
import {footerColumns} from "@/lib/navigation/navigation";
import {CONTENT_GUTTER, PAGE_CONTAINER} from "@/components/ui/layout";

function isExternal(href: string) {
    return href.startsWith("http://") || href.startsWith("https://");
}

export default function AccountFooter() {
    const currentYear = new Date().getFullYear();

    const pathname = usePathname();
    const locale = pathname.split("/")[1];
    const hasLocale = locale === "en" || locale === "de";
    const withLocale = (href: string) => (hasLocale ? `/${locale}${href}` : href);

    // full keys in navigation -> no namespace needed
    const t = useTranslations();

    return (
        <footer
            className="
        flex w-full flex-col items-center justify-center
        bg-[#F5F6F8] dark:bg-[#070A0D]
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
              md:grid md:grid-cols-6 md:gap-8
              lg:flex lg:flex-row lg:gap-12
            "
                    >
                        {footerColumns.map((column) => (
                            <div key={column.titleKey} className="flex flex-col gap-2 lg:gap-3 md:col-span-2">
                                <h3
                                    className="
                    m-0 font-semibold
                    text-[16px] leading-[110%]
                    text-black/90 dark:text-white/90
                    lg:text-[18px] lg:leading-[150%]
                  "
                                >
                                    {t(column.titleKey)}
                                </h3>

                                <ul className="m-0 flex list-none flex-col gap-2 p-0">
                                    {column.links.map((link) => {
                                        const rawHref =
                                            typeof link.href === "string"
                                                ? link.href
                                                : link.href[locale as "de" | "en"];

                                        const external = isExternal(rawHref);
                                        const href = external ? rawHref : withLocale(rawHref);

                                        return (
                                            <li key={rawHref}>
                                                <Link
                                                    href={href}
                                                    {...(external
                                                        ? {
                                                            target: "_blank",
                                                            rel: "noopener noreferrer",
                                                        }
                                                        : {})}
                                                    className="
                            cursor-pointer no-underline transition-opacity duration-200 hover:opacity-70
                            text-[13px] leading-[100%]
                            text-black/90 dark:text-white/70
                            lg:text-[15px] lg:leading-[130%]
                          "
                                                >
                                                    {t(link.labelKey)}
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        ))}
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
                            {t("footer.copyright", {year: currentYear})}
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}