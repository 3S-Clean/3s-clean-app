import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
    const res = NextResponse.next();

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return req.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        res.cookies.set(name, value, options);
                    });
                },
            },
        }
    );

    const { data } = await supabase.auth.getUser();
    const user = data.user;

    const pathname = req.nextUrl.pathname;

    const isProtected = pathname.startsWith("/account");
    const isAuthPage =
        pathname.startsWith("/login") ||
        pathname.startsWith("/signup") ||
        pathname.startsWith("/forgot-password") ||
        pathname.startsWith("/reset-password");

    // если не залогинен и идёт на /account -> на /login
    if (!user && isProtected) {
        const url = req.nextUrl.clone();
        url.pathname = "/login";
        url.searchParams.set("next", pathname);
        return NextResponse.redirect(url);
    }

    // если залогинен и идёт на auth страницы -> на /account
    if (user && isAuthPage) {
        const url = req.nextUrl.clone();
        url.pathname = "/account";
        return NextResponse.redirect(url);
    }

    return res;
}

export const config = {
    matcher: ["/account/:path*", "/login", "/signup", "/forgot-password", "/reset-password"],
};