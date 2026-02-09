import {redirect} from "next/navigation";
import {createSupabaseServerClient} from "@/shared/lib/supabase/server";
import OrderDetailsClient from "@/features/account/components/OrderDetailsClient";
import {Footer, Header} from "@/shared/layout";

type Props = {
    params: Promise<{ locale: "en" | "de"; orderId: string }>;
};

export default async function OrderDetailsPage({params}: Props) {
    const {locale, orderId} = await params;

    const supabase = await createSupabaseServerClient();
    const {
        data: {user},
        error,
    } = await supabase.auth.getUser();

    if (error || !user) redirect(`/${locale}/login`);

    return (
        <>
            <Header/>
            <div className="min-h-screen bg-[var(--background)] pt-[90px]">
                <OrderDetailsClient orderId={orderId} locale={locale}/>
            </div>
            <Footer/>
        </>
    );
}
