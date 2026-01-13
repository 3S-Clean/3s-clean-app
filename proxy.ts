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

    // ✅ защищаем ТОЛЬКО account
    const isProtected = pathname.startsWith("/account");

    // ✅ auth-страницы (где залогиненного логично уводить в account)
    const isAuthPage =
        pathname === "/login" ||
        pathname === "/signup" ||
        pathname === "/forgot-password" ||
        pathname === "/reset-password";

    let response = NextResponse.next();

    // ✅ не залогинен → нельзя на account
    if (!user && isProtected) {
        const url = req.nextUrl.clone();
        url.pathname = "/login";
        url.searchParams.set("next", pathname);
        response = NextResponse.redirect(url);
    }

    // ✅ залогинен → нечего делать на login/signup
    if (user && isAuthPage) {
        const url = req.nextUrl.clone();
        url.pathname = "/account";
        response = NextResponse.redirect(url);
    }

    // ✅ применяем куки, которые Supabase попросил установить
    cookiesToSet.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, options);
    });

    return response;
}

// ✅ matcher НЕ должен включать /confirmed и /callback
// потому что эти страницы должны быть “нейтральными” и не ломать flow.
export const config = {
    matcher: [
        "/account/:path*",
        "/login",
        "/signup",
        "/forgot-password",
        "/reset-password",
    ],
};