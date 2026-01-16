// proxy.ts
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";

type CookieToSet = {
    name: string;
    value: string;
    options?: CookieOptions;
};

export async function proxy(req: NextRequest) {
    const cookiesToSet: CookieToSet[] = [];

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
                        ...newCookies.map((c) => ({
                            name: c.name,
                            value: c.value,
                            options: c.options,
                        }))
                    );
                },
            },
        }
    );

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const pathname = req.nextUrl.pathname;

    const isProtected = pathname.startsWith("/account");

    // ✅ reset-password разрешаем НЕ всегда:
    // только если recovery flow (мы ставим это в URL из verify-code)
    const isReset = pathname === "/reset-password";
    const flow = req.nextUrl.searchParams.get("flow");
    const recoveryFlag = req.nextUrl.searchParams.get("recovery");
    const isRecoveryReset = isReset && (flow === "recovery" || recoveryFlag === "1");

    // ✅ auth-страницы, с которых залогиненного уводим в /account
    // ❗️reset-password сюда НЕ включаем (он обрабатывается отдельно)
    const isAuthPage =
        pathname === "/login" ||
        pathname === "/signup" ||
        pathname === "/forgot-password";

    let response = NextResponse.next();

    // ✅ не залогинен → нельзя на account
    if (!user && isProtected) {
        const url = req.nextUrl.clone();
        url.pathname = "/login";
        url.searchParams.set("next", pathname);
        response = NextResponse.redirect(url);
    }

    // ✅ залогинен → нечего делать на login/signup/forgot-password
    if (user && isAuthPage) {
        const url = req.nextUrl.clone();
        url.pathname = "/account";
        response = NextResponse.redirect(url);
    }

    // ✅ reset-password:
    // - если recovery flow → пропускаем (даже если user есть)
    // - если НЕ recovery flow:
    //    - user есть → /account
    //    - user нет → /forgot-password
    if (isReset && !isRecoveryReset) {
        const url = req.nextUrl.clone();
        url.pathname = user ? "/account" : "/forgot-password";
        response = NextResponse.redirect(url);
    }

    // ✅ применяем куки, которые Supabase попросил установить
    cookiesToSet.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, options);
    });

    return response;
}

export const config = {
    matcher: ["/account/:path*", "/login", "/signup", "/forgot-password", "/reset-password"],
};