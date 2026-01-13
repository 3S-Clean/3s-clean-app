import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * proxy.ts
 * Работает как middleware:
 * - читает Supabase-сессию из cookies
 * - защищает приватные страницы
 * - делает авто-редиректы
 */
export async function proxy(req: NextRequest) {
    /**
     * NextResponse.next() — стандартный ответ,
     * который мы возвращаем, если ничего не редиректим
     */
    const res = NextResponse.next();

    /**
     * Создаём Supabase server-client,
     * который УМЕЕТ работать с cookies (обязательно для SSR / Edge)
     */
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                /**
                 * Читаем ВСЕ cookies из входящего запроса
                 * (там лежит supabase-auth-token)
                 */
                getAll() {
                    return req.cookies.getAll();
                },

                /**
                 * Если Supabase обновляет сессию,
                 * прокидываем новые cookies в ответ
                 */
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        res.cookies.set(name, value, options);
                    });
                },
            },
        }
    );

    /**
     * Получаем текущего пользователя из cookies
     * (если нет — user = null)
     */
    const { data } = await supabase.auth.getUser();
    const user = data.user;

    /**
     * Текущий URL (например: /account, /login, /signup)
     */
    const pathname = req.nextUrl.pathname;

    /**
     * Защищённые страницы (требуют логин)
     */
    const isProtected = pathname.startsWith("/account");

    /**
     * Страницы аутентификации
     * (если пользователь уже залогинен — туда пускать не надо)
     */
    const isAuthPage =
        pathname.startsWith("/login") ||
        pathname.startsWith("/signup") ||
        pathname.startsWith("/forgot-password") ||
        pathname.startsWith("/reset-password");

    /**
     * ❌ НЕ залогинен → пытается зайти на /account
     * → редиректим на /login
     */
    if (!user && isProtected) {
        const url = req.nextUrl.clone();
        url.pathname = "/login";

        /**
         * next — удобно для будущего:
         * после логина можно вернуть пользователя туда, куда он хотел
         */
        url.searchParams.set("next", pathname);
        return NextResponse.redirect(url);
    }

    /**
     * ✅ ЗАЛОГИНЕН → пытается открыть login / signup / forgot / reset
     * → редиректим сразу в аккаунт
     */
    if (user && isAuthPage) {
        const url = req.nextUrl.clone();
        url.pathname = "/account";
        return NextResponse.redirect(url);
    }

    /**
     * Во всех остальных случаях
     * просто продолжаем загрузку страницы
     */
    return res;
}

/**
 * matcher — на какие маршруты этот proxy срабатывает
 * (чем уже — тем быстрее)
 */
export const config = {
    matcher: [
        "/account/:path*",
        "/login",
        "/signup",
        "/forgot-password",
        "/reset-password",
    ],
};