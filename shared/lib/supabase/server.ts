/* eslint-disable @typescript-eslint/no-explicit-any */
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

type CookieStoreLike = {
    getAll: () => { name: string; value: string }[];
    set: (cookie: { name: string; value: string } & Record<string, any>) => void;
};

export async function createSupabaseServerClient() {
    // В некоторых версиях Next cookies() типизируется как Promise.
    const store = (await Promise.resolve(cookies())) as unknown as CookieStoreLike;

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return store.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            store.set({ name, value, ...options });
                        });
                    } catch {}
                },
            },
        }
    );
}