"use client";

import { useMemo, useState } from "react";
import { Search, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";

/* -------------------------------- types -------------------------------- */

type FAQItem = {
    question: string;
    answer: string;
};

type FAQCategory = {
    id: string;
    title: string;
    shortTitle: string;
    items: FAQItem[];
};

function cx(...classes: Array<string | false | null | undefined>) {
    return classes.filter(Boolean).join(" ");
}

/* ------------------------------ Accordion ------------------------------ */

function AccordionItem({
                           item,
                           isOpen,
                           onToggle,
                       }: {
    item: FAQItem;
    isOpen: boolean;
    onToggle: () => void;
}) {
    return (
        <div className="border-b border-black/5 dark:border-white/10 last:border-0">
            <button
                type="button"
                onClick={onToggle}
                className={cx(
                    "w-full flex items-center gap-4 py-5 text-left rounded-xl px-4",
                    "transition-opacity duration-200",
                    "hover:opacity-80",
                    "focus:outline-none focus-visible:ring-4 focus-visible:ring-black/15 dark:focus-visible:ring-white/15"
                )}
            >
                <span className="font-medium text-[var(--text)] pr-2">{item.question}</span>
                {/* Icon pinned to the far right */}
                <span className="ml-auto flex-shrink-0">
          <Plus
              className={cx(
                  "w-5 h-5 text-[var(--muted)]",
                  "transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
                  isOpen && "rotate-45" // plus -> x
              )}
              aria-hidden="true"
          />
        </span>
            </button>

            {/* Smooth “press in / compress” close animation */}
            <div
                className={cx(
                    "overflow-hidden will-change-[height]",
                    "transition-[height] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                )}
                style={{ height: isOpen ? "auto" : 0 }}
            >
                {/* We need real height measurement? Nope: we do a CSS trick below */}
                <div className={cx("px-4 pb-5")}>
                    <div
                        className={cx(
                            "relative rounded-xl p-4",
                            "backdrop-blur-xl ring-1 ring-black/5 dark:ring-white/10",
                            "bg-[var(--card)]/75 dark:bg-[var(--card)]/40",
                            "[box-shadow:inset_0_1px_0_rgba(255,255,255,0.55)] dark:[box-shadow:inset_0_1px_0_rgba(255,255,255,0.10)]",
                            "transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
                            isOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"
                        )}
                    >
                        {/* Liquid Glass grain */}
                        <p className="relative text-[var(--muted)] leading-relaxed">{item.answer}</p>
                    </div>
                </div>
            </div>

            {/* Height auto animation helper (keeps it smooth) */}
            <style jsx>{`
        div[style*="height: auto"] {
          height: auto !important;
        }
      `}</style>
        </div>
    );
}

/* ------------------------------- Page ------------------------------- */

export default function FAQPage() {
    const t = useTranslations("faqPage");

    // ✅ i18n data (EN/DE): faqPage.categories = array
    const faqData = useMemo(() => (t.raw("categories") as FAQCategory[]) ?? [], [t]);

    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [openItems, setOpenItems] = useState<Set<string>>(new Set());

    const categories = useMemo(
        () => [{ id: null as string | null, label: t("filters.all") }, ...faqData.map((c) => ({ id: c.id, label: c.shortTitle }))],
        [faqData, t]
    );

    const filteredData = useMemo(() => {
        let data = faqData;

        if (activeCategory) {
            data = data.filter((cat) => cat.id === activeCategory);
        }

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            data = data
                .map((category) => ({
                    ...category,
                    items: category.items.filter(
                        (item) => item.question.toLowerCase().includes(q) || item.answer.toLowerCase().includes(q)
                    ),
                }))
                .filter((category) => category.items.length > 0);
        }

        return data;
    }, [faqData, searchQuery, activeCategory]);

    const toggleItem = (categoryId: string, questionIndex: number) => {
        const key = `${categoryId}-${questionIndex}`;
        setOpenItems((prev) => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    return (
        <>
            <Header />
            <main className="min-h-screen pt-[80px] bg-[var(--background)] text-[var(--text)]">
                {/* HERO (like Experience) */}
                <section className="px-6 pt-10 pb-8 md:pt-16 md:pb-12 max-w-7xl mx-auto">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight whitespace-pre-line">
                        {t("hero.title")}
                    </h1>
                    <p className="mt-4 text-lg text-[var(--muted)] max-w-2xl">{t("hero.subtitle")}</p>
                </section>
                {/* Search */}
                <section className="px-6 pb-4 max-w-7xl mx-auto">
                    <div className="relative max-w-3xl">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted)]" />
                        <input
                            type="text"
                            placeholder={t("search.placeholder")}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={cx(
                                "w-full pl-12 pr-4 py-4 rounded-2xl",
                                "bg-[var(--card)]/70 dark:bg-[var(--card)]/35",
                                "backdrop-blur-xl ring-1 ring-black/10 dark:ring-white/10",
                                "text-[var(--text)] placeholder:text-[var(--muted)]",
                                "focus:outline-none focus:ring-4 focus:ring-black/10 dark:focus:ring-white/10",
                                "[box-shadow:inset_0_1px_0_rgba(255,255,255,0.55)] dark:[box-shadow:inset_0_1px_0_rgba(255,255,255,0.10)]"
                            )}
                        />
                    </div>
                </section>
                {/* Category Filters (glassy in dark too) */}
                <section className="px-6 py-4 max-w-7xl mx-auto">
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {categories.map((cat) => {
                            const active = activeCategory === cat.id;
                            return (
                                <button
                                    key={cat.id ?? "all"}
                                    type="button"
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={cx(
                                        "px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap",
                                        "transition-all duration-200",
                                        active
                                            ? "bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-white/90"
                                            : cx(
                                                "bg-[var(--card)]/70 dark:bg-[var(--card)]/35 text-[var(--text)]",
                                                "backdrop-blur-xl ring-1 ring-black/10 dark:ring-white/10",
                                                "hover:opacity-85",
                                                "[box-shadow:inset_0_1px_0_rgba(255,255,255,0.55)] dark:[box-shadow:inset_0_1px_0_rgba(255,255,255,0.10)]"
                                            )
                                    )}
                                >
                                    {cat.label}
                                </button>
                            );
                        })}
                    </div>
                </section>
                {/* FAQ Content */}
                <section className="px-6 py-8 max-w-7xl mx-auto">
                    {filteredData.length === 0 ? (
                        <div className="py-12">
                            <p className="text-[var(--muted)]">{t("empty")}</p>
                        </div>
                    ) : (
                        <div className="space-y-10 max-w-3xl">
                            {filteredData.map((category) => (
                                <div key={category.id}>
                                    <h2 className="text-xl font-bold mb-4">{category.title}</h2>
                                    {/* Glass container (consistent width, no weird highlights) */}
                                    <div
                                        className={cx(
                                            "relative rounded-2xl p-4",
                                            "backdrop-blur-xl ring-1 ring-black/5 dark:ring-white/10",
                                            "bg-[var(--card)]/70 dark:bg-[var(--card)]/35",
                                            "[box-shadow:inset_0_1px_0_rgba(255,255,255,0.55),0_20px_60px_rgba(0,0,0,0.06)]",
                                            "dark:[box-shadow:inset_0_1px_0_rgba(255,255,255,0.10),0_20px_60px_rgba(0,0,0,0.45)]"
                                        )}
                                    >
                                        <div className="relative">
                                            {category.items.map((item, index) => (
                                                <AccordionItem
                                                    key={index}
                                                    item={item}
                                                    isOpen={openItems.has(`${category.id}-${index}`)}
                                                    onToggle={() => toggleItem(category.id, index)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>

            <Footer />
        </>
    );
}