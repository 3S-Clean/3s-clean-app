import type {Metadata} from "next";
import {getLegalMarkdown} from "@/shared/lib/legal/getLegalMarkdown";
import ReactMarkdown from "react-markdown";
import {unstable_noStore as noStore} from "next/cache";
import Header from "@/shared/layout/header/Header";
import Footer from "@/shared/layout/footer/Footer";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Props = { params: Promise<{ locale: "en" | "de" }> };

export const metadata: Metadata = {
    title: "Imprint",
};

export default async function Page({params}: Props) {
    noStore();

    const {locale} = await params;
    const md = getLegalMarkdown("imprint", locale);

    return (
        <>
            <Header/>
            <main
                className="mx-auto w-full max-w-3xl px-6 py-10 md:px-8 min-h-screen bg-[var(--background)] pt-[90px] sm:pt-[86px] overflow-x-hidden">
                <div
                    className="
                  rounded-3xl
                  bg-[var(--card)]
                  px-6 py-7 md:px-8 md:py-9
                  [box-shadow:inset_0_1px_0_rgba(255,255,255,0.70),0_8px_24px_rgba(0,0,0,0.08)]
                  dark:[box-shadow:inset_0_1px_0_rgba(255,255,255,0.08),0_10px_26px_rgba(0,0,0,0.55)]
                "
                >
                    <ReactMarkdown
                        components={{
                            h1: (props) => (
                                <h1 className="mb-3 text-[28px] leading-[1.1] font-semibold tracking-[-0.01em]">
                                    {props.children}
                                </h1>
                            ),
                            h2: (props) => (
                                <h2 className="mt-8 mb-2 text-[18px] md:text-[20px] leading-[1.25] font-semibold tracking-[-0.01em]">
                                    {props.children}
                                </h2>
                            ),
                            h3: (props) => (
                                <h3 className="mt-6 mb-2 text-[16px] md:text-[18px] leading-[1.3] font-semibold tracking-[-0.01em]">
                                    {props.children}
                                </h3>
                            ),
                            p: (props) => (
                                <p className="text-[15px] md:text-[16px] leading-[1.7] text-[var(--text)]">
                                    {props.children}
                                </p>
                            ),
                            ul: (props) => <ul className="my-4 list-disc pl-5">{props.children}</ul>,
                            ol: (props) => <ol className="my-4 list-decimal pl-5">{props.children}</ol>,
                            li: (props) => (
                                <li className="text-[15px] md:text-[16px] leading-[1.7] text-[var(--text)]">
                                    {props.children}
                                </li>
                            ),
                            a: (props) => (
                                <a className="underline underline-offset-2 hover:opacity-80" {...props} />
                            ),
                            strong: (props) => (
                                <strong className="font-semibold text-black/90 dark:text-white/90">
                                    {props.children}
                                </strong>
                            ),
                            hr: () => (
                                <hr className="my-8 border-t border-black/10 dark:border-white/15"/>
                            ),
                        }}
                    >
                        {md}
                    </ReactMarkdown>
                </div>
            </main>
            <Footer/>

        </>
    );
}