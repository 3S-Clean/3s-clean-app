// components/ui/infohelp/InfoHelp.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ---------------- Touch UI detection ---------------- */

function useIsTouchUI() {
    const [isTouchUI, setIsTouchUI] = useState(false);

    useEffect(() => {
        const mq = window.matchMedia("(pointer: coarse), (max-width: 1024px)");
        const update = () => setIsTouchUI(mq.matches);
        update();
        mq.addEventListener("change", update);
        return () => mq.removeEventListener("change", update);
    }, []);

    return isTouchUI;
}

function lockBodyScroll(locked: boolean) {
    const body = document.body;
    if (!body) return;

    if (locked) {
        body.dataset.prevOverflow = body.style.overflow;
        body.style.overflow = "hidden";
    } else {
        body.style.overflow = body.dataset.prevOverflow ?? "";
        delete body.dataset.prevOverflow;
    }
}

/* ---------------- Component ---------------- */

export function InfoHelp({
                             text,
                             title = "Details",
                             dark = false,
                         }: {
    text: string;
    title?: string;
    dark?: boolean;
}) {
    const isTouchUI = useIsTouchUI();
    const [open, setOpen] = useState(false);
    const btnRef = useRef<HTMLButtonElement | null>(null);

    // ✅ hover close delay (desktop only)
    const closeTimerRef = useRef<number | null>(null);

    const clearCloseTimer = () => {
        if (closeTimerRef.current) {
            window.clearTimeout(closeTimerRef.current);
            closeTimerRef.current = null;
        }
    };

    const scheduleClose = (ms = 180) => {
        clearCloseTimer();
        closeTimerRef.current = window.setTimeout(() => setOpen(false), ms);
    };

    useEffect(() => {
        return () => clearCloseTimer();
    }, []);

    const stop = (e: React.SyntheticEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    /* lock scroll for mobile sheet */
    useEffect(() => {
        if (isTouchUI) lockBodyScroll(open);
        return () => lockBodyScroll(false);
    }, [open, isTouchUI]);

    /* ESC closes */
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open]);

    /* outside click (desktop) */
    useEffect(() => {
        if (!open || isTouchUI) return;

        const onDown = (e: PointerEvent) => {
            const target = e.target as Node | null;
            if (!target) return;
            const root = btnRef.current?.closest("[data-infohelp-root]");
            if (root && root.contains(target)) return;
            setOpen(false);
        };

        window.addEventListener("pointerdown", onDown, true);
        return () => window.removeEventListener("pointerdown", onDown, true);
    }, [open, isTouchUI]);

    /* icon colors */
    const iconClass = useMemo(
        () => (dark ? "text-white/60 hover:text-white" : "text-gray-400 hover:text-gray-600"),
        [dark]
    );

    return (
        <span
            data-infohelp-root
            className="relative inline-flex"
            // ✅ desktop hover: keep open when moving between icon and tooltip
            onMouseEnter={
                !isTouchUI
                    ? () => {
                        clearCloseTimer();
                        setOpen(true);
                    }
                    : undefined
            }
            onMouseLeave={!isTouchUI ? () => scheduleClose(180) : undefined}
            onPointerDown={stop}
            onClick={stop}
        >
      {/* ⓘ icon */}
            <button
                ref={btnRef}
                type="button"
                aria-label="More info"
                className={`ml-1 inline-flex items-center justify-center rounded-full transition-colors p-1.5 ${iconClass}`}
                onClick={(e) => {
                    stop(e);
                    setOpen((v) => !v);
                }}
            >
        <Info className="w-4 h-4" />
      </button>

            {/* ---------- DESKTOP TOOLTIP ---------- */}
            {!isTouchUI && open && (
                <div
                    role="tooltip"
                    // ✅ keep open while hovering tooltip
                    onMouseEnter={() => {
                        clearCloseTimer();
                        setOpen(true);
                    }}
                    onMouseLeave={() => scheduleClose(180)}
                    onClick={() => setOpen(false)}
                    className={[
                        "absolute z-50",
                        "top-full mt-2",
                        "left-0", // starts at icon edge
                        // ✅ wider, less tall feeling (better wrap)
                        "w-[min(22rem,calc(100vw-2rem))]",
                        "px-3 py-2 text-sm leading-snug",
                        "rounded-lg shadow-lg",
                        dark ? "bg-gray-900 text-white border border-white/10" : "bg-white text-gray-700 border border-gray-200",
                    ].join(" ")}
                >
                    {text}
                </div>
            )}

            {/* ---------- TOUCH UI (BOTTOM SHEET) ---------- */}
            {isTouchUI &&
                open &&
                createPortal(
                    <AnimatePresence>
                        <motion.div
                            key="overlay"
                            className="fixed inset-0 z-[2147483647]"
                            role="dialog"
                            aria-modal="true"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onPointerDown={(e) => {
                                const t = e.target as HTMLElement;
                                if (t?.dataset?.sheet === "true") return;
                                setOpen(false);
                            }}
                        >
                            {/* backdrop */}
                            <motion.div
                                className={dark ? "absolute inset-0 bg-black/60" : "absolute inset-0 bg-black/40"}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            />

                            {/* sheet */}
                            <motion.div
                                data-sheet="true"
                                className={[
                                    "absolute bottom-0 left-0 right-0",
                                    "rounded-t-3xl px-5 pt-4 pb-6 shadow-2xl",
                                    dark ? "bg-gray-900 text-white" : "bg-white text-gray-900",
                                ].join(" ")}
                                initial={{ y: 24 }}
                                animate={{ y: 0 }}
                                exit={{ y: 220 }}
                                transition={{ type: "spring", stiffness: 420, damping: 38 }}
                                drag="y"
                                dragConstraints={{ top: 0 }}
                                dragElastic={0.15}
                                onDragEnd={(_, info) => {
                                    if (info.offset.y > 90 || info.velocity.y > 800) setOpen(false);
                                }}
                                onPointerDown={stop}
                                onClick={stop}
                            >
                                <div
                                    className={
                                        dark
                                            ? "mx-auto mb-3 h-1 w-10 rounded-full bg-white/20"
                                            : "mx-auto mb-3 h-1 w-10 rounded-full bg-black/10"
                                    }
                                />

                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <div className="text-base font-semibold">{title}</div>

                                        <button
                                            type="button"
                                            className={dark ? "mt-2 text-left text-sm text-white/80" : "mt-2 text-left text-sm text-gray-600"}
                                            onClick={(e) => {
                                                stop(e);
                                                setOpen(false);
                                            }}
                                        >
                                            {text}
                                        </button>
                                    </div>

                                    <button
                                        type="button"
                                        className={
                                            dark
                                                ? "text-sm font-semibold text-white/70 px-3 py-2 -mr-2"
                                                : "text-sm font-semibold text-gray-700 px-3 py-2 -mr-2"
                                        }
                                        onClick={(e) => {
                                            stop(e);
                                            setOpen(false);
                                        }}
                                    >
                                        Close
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    </AnimatePresence>,
                    document.body
                )}
    </span>
    );
}