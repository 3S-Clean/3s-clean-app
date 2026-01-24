import { NextResponse, type NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";

const locales = ["en", "de"] as const;
type Locale = (typeof locales)[number];

const defaultLocale: Locale = "en";

const intlMiddleware = createIntlMiddleware({
    locales: [...locales],
    defaultLocale,
});

type CookieToSet = { name: string; value: string; options?: CookieOptions };

// type guard: string -> Locale
function isLocale(value: string): value is Locale {
    return (locales as readonly string[]).includes(value);
}

function getLocaleAndPathname(pathname: string): { locale: Locale | null; rest: string } {
    const segments = pathname.split("/").filter(Boolean);
    const maybeLocale = segments[0];

    if (maybeLocale && isLocale(maybeLocale)) {
        const rest = "/" + segments.slice(1).join("/");
        return { locale: maybeLocale, rest: rest === "/" ? "/" : rest };
    }

    return { locale: null, rest: pathname };
}

export default async function middleware(req: NextRequest) {
    // 1) next-intl
    const intlResponse = intlMiddleware(req);

    // если есть редирект (например / -> /en), возвращаем сразу
    if (intlResponse.headers.get("location")) return intlResponse;

    const cookiesToSet: CookieToSet[] = [];

    // 2) supabase
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
                },
            },
        }
    );

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { locale, rest } = getLocaleAndPathname(req.nextUrl.pathname);
    const activeLocale: Locale = locale ?? defaultLocale;

    const isProtected = rest.startsWith("/account");

    const isReset = rest === "/reset-password";
    const flow = req.nextUrl.searchParams.get("flow");
    const isRecoveryReset = isReset && flow === "recovery";

    const isAuthPage = rest === "/login" || rest === "/signup" || rest === "/forgot-password";

    let response = intlResponse;

    // 1) Не залогинен → нельзя на account
    if (!user && isProtected) {
        const url = req.nextUrl.clone();
        url.pathname = `/${activeLocale}/login`;
        url.searchParams.set("next", `/${activeLocale}${rest}`);
        response = NextResponse.redirect(url);
    }

    // 2) Залогинен → нечего делать на login/signup/forgot-password
    if (user && isAuthPage) {
        const url = req.nextUrl.clone();
        url.pathname = `/${activeLocale}/account`;
        response = NextResponse.redirect(url);
    }

    // 3) reset-password
    if (isReset && !isRecoveryReset) {
        const url = req.nextUrl.clone();
        url.pathname = `/${activeLocale}/forgot-password`;
        response = NextResponse.redirect(url);
    }

    // apply cookies
    cookiesToSet.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, options);
    });

    return response;
}

export const config = {
    matcher: ["/((?!api|_next|.*\\..*).*)"],
};