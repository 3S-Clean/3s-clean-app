import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";

const locales = ["en", "de"] as const;

export default async function LocaleLayout({
                                               children,
                                               params,
                                           }: {
    children: React.ReactNode;
    params: { locale: string };
}) {
    const { locale } = params;

    if (!locales.includes(locale as (typeof locales)[number])) {
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