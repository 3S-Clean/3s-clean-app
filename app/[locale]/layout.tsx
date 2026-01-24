import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";

const locales = ["en", "de"] as const;
type Locale = (typeof locales)[number];

function isLocale(v: string): v is Locale {
    return (locales as readonly string[]).includes(v);
}

async function getMessages(locale: Locale) {
    switch (locale) {
        case "en":
            return (await import("../../messages/en.json")).default;
        case "de":
            return (await import("../../messages/de.json")).default;
    }
}

export default async function LocaleLayout({
                                               children,
                                               params,
                                           }: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    if (!isLocale(locale)) notFound();

    const messages = await getMessages(locale);

    return (
        <NextIntlClientProvider locale={locale} messages={messages}>
            {children}
        </NextIntlClientProvider>
    );
}