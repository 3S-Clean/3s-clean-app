import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";

const locales = ["en", "de"] as const;
type Locale = (typeof locales)[number];

export default async function LocaleLayout({
                                               children,
                                               params,
                                           }: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    // ✅ Next 16: params — Promise
    const { locale } = await params;

    if (!locales.includes(locale as Locale)) notFound();

    // messages лежат в /messages рядом с /app
    const messages = (await import(`../../messages/${locale}.json`)).default;

    return (
        <NextIntlClientProvider locale={locale} messages={messages}>
            {children}
        </NextIntlClientProvider>
    );
}