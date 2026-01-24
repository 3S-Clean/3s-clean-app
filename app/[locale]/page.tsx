import HomePageClient from "./HomePageClient";

export default async function Page({
                                       params
                                   }: {
    params: Promise<{ locale: string }>;
}) {
    // unwrap params, чтобы Next не ругался на sync dynamic api
    await params;

    return <HomePageClient />;
}