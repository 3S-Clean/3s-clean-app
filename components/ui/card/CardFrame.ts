export const CARD_FRAME_BASE = [
    "relative overflow-hidden",
    "rounded-3xl",

    // (2) subtle premium gradient in light mode
    "bg-gradient-to-br from-white via-white to-gray-50/50",
    "text-gray-900",

    // glass in dark mode
    "dark:bg-[var(--card)]/70 dark:backdrop-blur-sm dark:text-white",

    // (1) no border — depth via shadow
    "shadow-[0_8px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_12px_34px_rgba(0,0,0,0.48)]",
].join(" ");

export const CARD_FRAME_INTERACTIVE = [
    "cursor-pointer select-none transition-all duration-200",
    "active:scale-[0.99]",
    "focus:outline-none focus-visible:ring-4 focus-visible:ring-black/15 dark:focus-visible:ring-white/15",
    "motion-reduce:transition-none motion-reduce:hover:transform-none",
].join(" ");

export const CARD_FRAME_HOVER_LIFT = ["hover:shadow-xl hover:-translate-y-1"].join(" ");