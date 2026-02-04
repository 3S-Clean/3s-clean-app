export const CARD_FRAME_BASE = [
    "relative overflow-hidden",
    "rounded-3xl",
    // subtle premium gradient (light)
    "bg-gradient-to-br from-white via-white to-gray-50/50",
    "text-gray-900",
    // Light: subtle inner highlight (like dark)
    "[box-shadow:inset_0_1px_0_rgba(255,255,255,0.70),0_8px_24px_rgba(0,0,0,0.08)]",
    // Dark: subtle premium gradient (NOT white) + glass blur
    "dark:bg-gradient-to-br dark:from-[var(--card)]/85 dark:via-[var(--card)]/70 dark:to-black/30",
    "dark:backdrop-blur-sm dark:text-white",
    "dark:[box-shadow:inset_0_1px_0_rgba(255,255,255,0.10),0_12px_34px_rgba(0,0,0,0.48)]",
    // no border — depth via shadow
    "shadow-[0_8px_24px_rgba(0,0,0,0.08)]",
].join(" ");

export const CARD_FRAME_INTERACTIVE = [
    "cursor-pointer select-none transition-all duration-200",
    // Press: a bit more noticeable
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
    // base: invisible surface
    "bg-transparent shadow-none",
    // hover: show the SAME surface as CARD_FRAME_BASE (light)
    "hover:bg-gradient-to-br hover:from-white hover:via-white hover:to-gray-50/50",
    "hover:text-gray-900",
    "hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]",
    "hover:-translate-y-1",
    // hover: show the SAME surface as CARD_FRAME_BASE (dark)
    "dark:hover:bg-[var(--card)]/70 dark:hover:backdrop-blur-sm dark:hover:text-white",
    "dark:hover:shadow-[0_12px_34px_rgba(0,0,0,0.48)]",
    // active (mobile): same as hover (because no hover)
    "active:bg-gradient-to-br active:from-white active:via-white active:to-gray-50/50",
    "active:text-gray-900",
    "active:shadow-[0_8px_24px_rgba(0,0,0,0.08)]",
    "active:scale-[0.99]",
    "dark:active:bg-[var(--card)]/70 dark:active:backdrop-blur-sm dark:active:text-white",
    "dark:active:shadow-[0_12px_34px_rgba(0,0,0,0.48)]",
    // a11y
    "focus:outline-none focus-visible:ring-4 focus-visible:ring-black/15 dark:focus-visible:ring-white/15",
    "motion-reduce:transition-none motion-reduce:hover:transform-none",
].join(" ");
// ✅ For non-clickable cards (Contact-style): base only, no cursor
export const CARD_FRAME_STATIC = CARD_FRAME_BASE;

// ✅ For clickable cards: base + interactive + hover lift
export const CARD_FRAME_ACTION = [CARD_FRAME_BASE, CARD_FRAME_INTERACTIVE, CARD_FRAME_HOVER_LIFT].join(" ");