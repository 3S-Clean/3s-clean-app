import {notFound} from "next/navigation";
import {NextIntlClientProvider} from "next-intl";
import CookieBanner from "@/features/consent/components/CookieBanner";

const locales = ["en", "de"] as const;
type Locale = (typeof locales)[number];

export default async function LocaleLayout({
                                               children,
                                               params,
                                           }: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const {locale} = await params;
    if (!locales.includes(locale as Locale)) notFound();

    const messages = (await import(`../../messages/${locale}.json`)).default;

    return (
        <>
            <NextIntlClientProvider locale={locale} messages={messages}>
                {children}
            </NextIntlClientProvider>

            {/* ✅ баннер всегда на /en/* и /de/* */}
            <CookieBanner lang={locale as "en" | "de"}/>
        </>
    );
}