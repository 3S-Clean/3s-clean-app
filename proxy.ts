// proxy.ts
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr"; // ✅ тип для options

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

    const isAuthPage =
        pathname === "/login" ||
        pathname === "/signup" ||
        pathname === "/forgot-password" ||
        pathname === "/reset-password";

    let response = NextResponse.next();

    if (!user && isProtected) {
        const url = req.nextUrl.clone();
        url.pathname = "/login";
        url.searchParams.set("next", pathname);
        response = NextResponse.redirect(url);
    }

    if (user && isAuthPage) {
        const url = req.nextUrl.clone();
        url.pathname = "/account";
        response = NextResponse.redirect(url);
    }

    cookiesToSet.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, options);
    });

    return response;
}

export const config = {
    matcher: [
        "/account/:path*",
        "/login",
        "/signup",
        "/forgot-password",
        "/reset-password",
        "/auth/callback",
        "/confirmed"
    ],
};