import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";

const locales = ["en", "de"] as const;
type Locale = (typeof locales)[number];

export default async function LocaleLayout({
                                               children,
                                               params,
                                           }: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    if (!locales.includes(locale as Locale)) {
        notFound();
    }

    const messages = (await import(`../../messages/${locale}.json`)).default;

    return (
        <html lang={locale}>
        <body className="antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
            {children}
        </NextIntlClientProvider>
        </body>
        </html>
    );
}