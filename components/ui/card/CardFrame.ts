export const CARD_FRAME_BASE = [
    "relative overflow-hidden",
    "rounded-3xl",
    "bg-[var(--card)] backdrop-blur-sm",
    "text-gray-900",

    // Light: glass overlay WITHOUT top wash
    "before:pointer-events-none before:absolute before:inset-0 before:content-['']",
    "before:opacity-[0.95]",
    "before:[background:radial-gradient(120%_90%_at_18%_0%,rgba(255,255,255,0.55)_0%,rgba(255,255,255,0)_60%)]",
    "dark:before:opacity-0",

    // Light: depth (mid/bottom)
    "[box-shadow:inset_0_1px_0_rgba(255,255,255,0.82),inset_0_18px_24px_rgba(255,255,255,0.22),inset_0_-220px_320px_rgba(0,0,0,0.095),0_8px_24px_rgba(0,0,0,0.08)]",

    // Dark: subtle premium gradient (NOT white) + glass blur
    "dark:bg-gradient-to-br dark:from-[var(--card)]/85 dark:via-[var(--card)]/70 dark:to-black/30",
    "dark:backdrop-blur-sm dark:text-white",
    "dark:[box-shadow:inset_0_1px_0_rgba(255,255,255,0.10),0_12px_34px_rgba(0,0,0,0.48)]",
].join(" ");

export const AUTH_CARD_BASE = [
    "relative overflow-hidden",
    "rounded-3xl",
    "bg-[var(--card)] backdrop-blur-sm",
    "text-[color:var(--text)]",
    "border border-black/3 dark:border-white/8",
    "[box-shadow:inset_0_1px_0_rgba(255,255,255,0.60)]",
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

    // Light hover (only on hover-capable devices)
    "[@media(hover:hover)]:hover:bg-gradient-to-br [@media(hover:hover)]:hover:from-white [@media(hover:hover)]:hover:via-white [@media(hover:hover)]:hover:to-gray-50/50",
    "[@media(hover:hover)]:hover:text-gray-900",
    "[@media(hover:hover)]:hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]",
    "[@media(hover:hover)]:hover:-translate-y-1",

    // Dark hover (no white wash)
    "[@media(hover:hover)]:dark:hover:bg-gradient-to-br [@media(hover:hover)]:dark:hover:from-[var(--card)]/85 [@media(hover:hover)]:dark:hover:via-[var(--card)]/70 [@media(hover:hover)]:dark:hover:to-black/30",
    "[@media(hover:hover)]:dark:hover:backdrop-blur-sm [@media(hover:hover)]:dark:hover:text-white",
    "[@media(hover:hover)]:dark:hover:shadow-[0_12px_34px_rgba(0,0,0,0.48)]",

    // Active (tap/click) feedback
    "active:bg-gradient-to-br active:from-white active:via-white active:to-gray-50/50",
    "active:text-gray-900",
    "active:shadow-[0_8px_24px_rgba(0,0,0,0.08)]",
    "active:scale-[0.99]",
    "dark:active:bg-[var(--card)]/70 dark:active:backdrop-blur-sm dark:active:text-white",
    "dark:active:shadow-[0_12px_34px_rgba(0,0,0,0.48)]",

    "focus:outline-none focus-visible:ring-4 focus-visible:ring-black/15 dark:focus-visible:ring-white/15",
    "motion-reduce:transition-none motion-reduce:hover:transform-none",
].join(" ");

// For non-clickable cards (Contact-style): base only, no cursor
export const CARD_FRAME_STATIC = CARD_FRAME_BASE;

// For clickable cards: base + interactive + hover lift
export const CARD_FRAME_ACTION = [CARD_FRAME_BASE, CARD_FRAME_INTERACTIVE, CARD_FRAME_HOVER_LIFT].join(" ");