// proxy.ts
import { NextResponse, type NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";

const locales = ["en", "de"] as const;
type Locale = (typeof locales)[number];
const defaultLocale: Locale = "en";

// 1) next-intl middleware (добавляет /en или /de, если нет)
const intlMiddleware = createIntlMiddleware({
    locales: [...locales],
    defaultLocale
});

type CookieToSet = { name: string; value: string; options?: CookieOptions };

function getLocaleAndRest(pathname: string) {
    // "/en/account/settings" -> locale="en", rest="/account/settings"
    const segments = pathname.split("/").filter(Boolean);
    const maybeLocale = segments[0];

    if (maybeLocale === "en" || maybeLocale === "de") {
        const rest = "/" + segments.slice(1).join("/");
        return { locale: maybeLocale as Locale, rest: rest === "/" ? "/" : rest };
    }

    // если вдруг пришло без /en — считаем default (но обычно intlMiddleware сам исправит)
    return { locale: defaultLocale, rest: pathname };
}

export default async function proxy(req: NextRequest) {
    // 0) сначала next-intl
    let response = intlMiddleware(req);

    // если next-intl сделал redirect (например / -> /en), просто возвращаем
    if (response.headers.get("location")) {
        return response;
    }

    const cookiesToSet: CookieToSet[] = [];

    // 1) supabase server client
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return req.cookies.getAll();
                },
                setAll(newCookies) {
                    cookiesToSet.push(
                        ...newCookies.map((c) => ({ name: c.name, value: c.value, options: c.options }))
                    );
                }
            }
        }
    );

    const {
        data: { user }
    } = await supabase.auth.getUser();

    // 2) pathname + locale/rest
    const pathname = req.nextUrl.pathname;
    const { locale, rest } = getLocaleAndRest(pathname);

    // ✅ твоя логика, но проверяем rest без префикса /en или /de
    const isProtected = rest.startsWith("/account");

    const isReset = rest === "/reset-password";
    const flow = req.nextUrl.searchParams.get("flow");
    const isRecoveryReset = isReset && flow === "recovery";

    const isAuthPage = rest === "/login" || rest === "/signup" || rest === "/forgot-password";

    // 3) редиректы
    // 1) Не залогинен → нельзя на account
    if (!user && isProtected) {
        const url = req.nextUrl.clone();
        url.pathname = `/${locale}/login`;
        url.searchParams.set("next", `/${locale}${rest}`);
        response = NextResponse.redirect(url);
    }

    // 2) Залогинен → нечего делать на login/signup/forgot-password
    if (user && isAuthPage) {
        const url = req.nextUrl.clone();
        url.pathname = `/${locale}/account`;
        response = NextResponse.redirect(url);
    }

    // 3) reset-password:
    // - только /reset-password?flow=recovery разрешаем
    // - иначе всегда уводим на /forgot-password
    if (isReset && !isRecoveryReset) {
        const url = req.nextUrl.clone();
        url.pathname = `/${locale}/forgot-password`;
        response = NextResponse.redirect(url);
    }

    // 4) apply cookies
    cookiesToSet.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, options);
    });

    return response;
}

// Запускаем proxy на всех страницах, кроме api/_next/файлов
export const config = {
    matcher: ["/((?!api|_next|.*\\..*).*)"]
};