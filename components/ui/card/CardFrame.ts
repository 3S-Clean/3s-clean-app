export const CARD_FRAME_BASE = [
    "relative overflow-hidden",
    "rounded-3xl",
    "backdrop-blur-sm",
    "text-gray-900",

    // Light: gradient background mirroring dark approach
    "bg-gradient-to-b from-white via-white to-gray-100/80",

    // Light: diagonal sheen overlay
    "before:pointer-events-none before:absolute before:inset-0 before:content-['']",
    "before:opacity-100",
    "before:[background:linear-gradient(135deg,rgba(255,255,255,0.6)_0%,rgba(255,255,255,0)_40%,rgba(0,0,0,0.04)_60%,rgba(0,0,0,0.08)_100%)]",
    "dark:before:opacity-0",

    // Light: layered shadow with hairline border
    "[box-shadow:inset_0_1px_0_rgba(255,255,255,0.90),0_1px_2px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.12),0_0_0_1px_rgba(0,0,0,0.04)]",

    // Dark (unchanged)
    "dark:bg-gradient-to-br dark:from-[var(--card)]/85 dark:via-[var(--card)]/70 dark:to-black/30",
    "dark:backdrop-blur-sm dark:text-white",
    "dark:[box-shadow:inset_0_1px_0_rgba(255,255,255,0.10),0_12px_34px_rgba(0,0,0,0.48)]",
].join(" ");

export const AUTH_CARD_BASE = [
    "relative overflow-hidden",
    "rounded-3xl",
    "backdrop-blur-sm",
    "text-[color:var(--text)]",

    // Light
    "bg-gradient-to-b from-white to-gray-50/60",
    "border border-black/[0.04] dark:border-white/8",
    "[box-shadow:inset_0_1px_0_rgba(255,255,255,0.80),0_1px_2px_rgba(0,0,0,0.04),0_6px_20px_rgba(0,0,0,0.08)]",

    // Dark
    "dark:bg-[var(--card)]",
    "dark:[box-shadow:inset_0_1px_0_rgba(255,255,255,0.08)]",
].join(" ");

export const CARD_FRAME_INTERACTIVE = [
    "cursor-pointer select-none transition-all duration-200",
    "active:scale-[0.985] active:translate-y-[1px]",
    "focus:outline-none focus-visible:ring-4 focus-visible:ring-black/15 dark:focus-visible:ring-white/15",
    "motion-reduce:transition-none motion-reduce:hover:transform-none",
].join(" ");

export const CARD_FRAME_HOVER_LIFT = ["hover:shadow-xl hover:-translate-y-1"].join(" ");

export const CARD_FRAME_GHOST_ACTION = [
    "relative overflow-hidden",
    "rounded-3xl",
    "transition-all duration-200",
    "cursor-pointer select-none",
    "bg-transparent shadow-none",

    // Light hover
    "[@media(hover:hover)]:hover:bg-gradient-to-b [@media(hover:hover)]:hover:from-white [@media(hover:hover)]:hover:via-white [@media(hover:hover)]:hover:to-gray-100/80",
    "[@media(hover:hover)]:hover:text-gray-900",
    "[@media(hover:hover)]:hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.90),0_1px_2px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.12),0_0_0_1px_rgba(0,0,0,0.04)]",
    "[@media(hover:hover)]:hover:-translate-y-1",

    // Dark hover (unchanged)
    "[@media(hover:hover)]:dark:hover:bg-gradient-to-br [@media(hover:hover)]:dark:hover:from-[var(--card)]/85 [@media(hover:hover)]:dark:hover:via-[var(--card)]/70 [@media(hover:hover)]:dark:hover:to-black/30",
    "[@media(hover:hover)]:dark:hover:backdrop-blur-sm [@media(hover:hover)]:dark:hover:text-white",
    "[@media(hover:hover)]:dark:hover:shadow-[0_12px_34px_rgba(0,0,0,0.48)]",

    // Active light
    "active:bg-gradient-to-b active:from-white active:via-white active:to-gray-100/80",
    "active:text-gray-900",
    "active:shadow-[inset_0_1px_0_rgba(255,255,255,0.90),0_1px_2px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.12)]",
    "active:scale-[0.99]",

    // Active dark (unchanged)
    "dark:active:bg-[var(--card)]/70 dark:active:backdrop-blur-sm dark:active:text-white",
    "dark:active:shadow-[0_12px_34px_rgba(0,0,0,0.48)]",

    "focus:outline-none focus-visible:ring-4 focus-visible:ring-black/15 dark:focus-visible:ring-white/15",
    "motion-reduce:transition-none motion-reduce:hover:transform-none",
].join(" ");

export const CARD_FRAME_STATIC = CARD_FRAME_BASE;

export const CARD_FRAME_ACTION = [CARD_FRAME_BASE, CARD_FRAME_INTERACTIVE, CARD_FRAME_HOVER_LIFT].join(" ");