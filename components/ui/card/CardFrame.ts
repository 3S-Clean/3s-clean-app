// components/ui/CardFrame.ts
export const CARD_FRAME = [
    "relative overflow-hidden",
    "rounded-3xl",

    "bg-white text-gray-900",
    "dark:bg-[var(--card)]/70 dark:backdrop-blur-sm dark:text-white",

    "border border-black/5 dark:border-white/10",
    "shadow-[0_10px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.50)]",

    "cursor-pointer select-none transition-all duration-200",
    "hover:shadow-xl hover:-translate-y-1",
    "active:scale-[0.99]",
    "focus:outline-none focus-visible:ring-4 focus-visible:ring-black/15 dark:focus-visible:ring-white/15",

    "motion-reduce:transition-none motion-reduce:hover:transform-none",
].join(" ");