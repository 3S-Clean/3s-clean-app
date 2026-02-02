import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { Metadata } from "next";

const locales = ["en", "de"] as const;
type Locale = (typeof locales)[number];

export const metadata: Metadata = {
    icons: {
        icon: "/favicon.ico",
        apple: "/apple-touch-icon-180x180.png",
    },
};


export default async function LocaleLayout({
                                               children,
                                               params,
                                           }: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    if (!locales.includes(locale as Locale)) notFound();
    const messages = (await import(`../../messages/${locale}.json`)).default;

    return (
        <NextIntlClientProvider locale={locale} messages={messages}>
            {children}
        </NextIntlClientProvider>
    );
}