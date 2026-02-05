// proxy.ts
import {type NextRequest, NextResponse} from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import type {CookieOptions} from "@supabase/ssr";
import {createServerClient} from "@supabase/ssr";

const locales = ["en", "de"] as const;
type Locale = (typeof locales)[number];
const defaultLocale: Locale = "en";
// 1) next-intl middleware (adds /en or /de if missing)
const intlMiddleware = createIntlMiddleware({
    locales: [...locales],
    defaultLocale,
});
type CookieToSet = { name: string; value: string; options?: CookieOptions };

function getLocaleAndRest(pathname: string) {
    // "/en/account/settings" -> locale="en", rest="/account/settings"
    const segments = pathname.split("/").filter(Boolean);
    const maybeLocale = segments[0];

    if (maybeLocale === "en" || maybeLocale === "de") {
        const rest = "/" + segments.slice(1).join("/");
        return {locale: maybeLocale as Locale, rest: rest === "/" ? "/" : rest};
    }

    // if it somehow comes without /en, assume default (intlMiddleware usually fixes it)
    return {locale: defaultLocale, rest: pathname};
}

export default async function proxy(req: NextRequest) {
    // 0) run next-intl first
    let response = intlMiddleware(req);
    // if next-intl did a redirect (e.g. / -> /en), return immediately
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
                        ...newCookies.map((c) => ({name: c.name, value: c.value, options: c.options}))
                    );
                },
            },
        }
    );

    const {
        data: {user},
    } = await supabase.auth.getUser();
    // 2) pathname + locale/rest
    const pathname = req.nextUrl.pathname;
    const {locale, rest} = getLocaleAndRest(pathname);
    // ✅ check rest without /en or /de prefix
    const isProtected = rest.startsWith("/account");
    const isSetPassword = rest === "/set-password";
    const isReset = rest === "/reset-password";
    const flow = req.nextUrl.searchParams.get("flow");
    const isRecoveryReset = isReset && flow === "recovery";
    const isAuthPage = rest === "/login" || rest === "/signup" || rest === "/forgot-password";
    // 3) redirects
    // 1) Not logged in -> can't access /account/*
    if (!user && isProtected) {
        const url = req.nextUrl.clone();
        url.pathname = `/${locale}/login`;
        url.searchParams.set("next", `/${locale}${rest}`);
        response = NextResponse.redirect(url);
    }
    // 1.1) Not logged in -> can't access /set-password
    if (!user && isSetPassword) {
        const url = req.nextUrl.clone();
        url.pathname = `/${locale}/login`;
        url.searchParams.set("next", `/${locale}${rest}`);
        response = NextResponse.redirect(url);
    }
    // 2) Logged in -> no need to be on login/signup/forgot-password
    if (user && isAuthPage) {
        const url = req.nextUrl.clone();
        url.pathname = `/${locale}/account`;
        response = NextResponse.redirect(url);
    }
    // 3) reset-password:
    // - allow only /reset-password?flow=recovery
    // - otherwise always redirect to /forgot-password
    if (isReset && !isRecoveryReset) {
        const url = req.nextUrl.clone();
        url.pathname = `/${locale}/forgot-password`;
        response = NextResponse.redirect(url);
    }
    // 4) apply cookies
    cookiesToSet.forEach(({name, value, options}) => {
        response.cookies.set(name, value, options);
    });

    return response;
}

// Run proxy on all pages except api/_next/static files
export const config = {
    matcher: ["/((?!api|_next|.*\\..*).*)"],
};