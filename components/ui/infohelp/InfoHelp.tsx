"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Info } from "lucide-react";

/** tiny hook: mobile < md */
function useIsMobile(breakpointPx = 768) {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const mq = window.matchMedia(`(max-width:${breakpointPx - 1}px)`);
        const update = () => setIsMobile(mq.matches);
        update();
        mq.addEventListener?.("change", update);
        return () => mq.removeEventListener?.("change", update);
    }, [breakpointPx]);

    return isMobile;
}

function lockBodyScroll(locked: boolean) {
    if (typeof document === "undefined") return;
    const body = document.body;
    if (!body) return;

    if (locked) {
        const prev = body.style.overflow;
        body.dataset.prevOverflow = prev;
        body.style.overflow = "hidden";
    } else {
        body.style.overflow = body.dataset.prevOverflow ?? "";
        delete body.dataset.prevOverflow;
    }
}

/**
 * Desktop: Tooltip
 * Mobile: Bottom-sheet
 * One icon ⓘ
 */
export function InfoHelp({
                             text,
                             title = "Details",
                             dark = false,
                         }: {
    text: string;
    title?: string;
    dark?: boolean;
}) {
    const isMobile = useIsMobile(768);
    const [open, setOpen] = useState(false);
    const btnRef = useRef<HTMLButtonElement | null>(null);

    const stop = (e: React.SyntheticEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    // lock scroll when sheet open
    useEffect(() => {
        if (isMobile) lockBodyScroll(open);
        return () => lockBodyScroll(false);
    }, [open, isMobile]);

    // close on ESC
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open]);

    // close tooltip on outside click (desktop)
    useEffect(() => {
        if (!open || isMobile) return;

        const onDown = (e: PointerEvent) => {
            const t = e.target as Node | null;
            if (!t) return;

            // if click is inside the button wrapper, ignore
            const root = btnRef.current?.closest("[data-infohelp-root]");
            if (root && root.contains(t)) return;

            setOpen(false);
        };

        window.addEventListener("pointerdown", onDown, { capture: true });
        return () => window.removeEventListener("pointerdown", onDown, { capture: true } as any);
    }, [open, isMobile]);

    const iconClass = useMemo(() => {
        // чуть контрастнее на dark карточках
        if (dark) return "text-white/60 hover:text-white/85";
        return "text-gray-400 hover:text-gray-600";
    }, [dark]);

    return (
        <span
            data-infohelp-root
            className="relative inline-block"
            onPointerDown={stop} // ✅ не даём выбрать карточку
            onClick={stop}
        >
      <button
          ref={btnRef}
          type="button"
          aria-label="More info"
          className={[
              "ml-1.5 inline-flex items-center justify-center transition-colors",
              iconClass,
              // увеличили hit-area (важно для мобилы)
              "p-2 -m-2",
          ].join(" ")}
          onMouseEnter={() => {
              if (!isMobile) setOpen(true);
          }}
          onMouseLeave={() => {
              if (!isMobile) setOpen(false);
          }}
          onClick={(e) => {
              stop(e);
              setOpen((v) => !v);
          }}
      >
        <Info className="w-4 h-4" />
      </button>

            {/* DESKTOP TOOLTIP */}
            {!isMobile && open && (
                <div
                    role="tooltip"
                    className={[
                        "absolute z-50 w-72 p-3 text-sm rounded-lg shadow-lg",
                        dark ? "bg-gray-900 text-white border border-white/10" : "bg-white text-gray-700 border border-gray-200",
                        "-top-2 left-6",
                    ].join(" ")}
                    onPointerDown={stop}
                    onClick={stop}
                >
                    {text}
                </div>
            )}

            {/* MOBILE BOTTOM-SHEET */}
            {isMobile && open && (
                <div
                    className="fixed inset-0 z-[60]"
                    aria-modal="true"
                    role="dialog"
                    onPointerDown={(e) => {
                        // tap on backdrop closes
                        // (если тапнули по самому шиту — не закрываем)
                        const target = e.target as HTMLElement;
                        if (target?.dataset?.sheet === "true") return;
                        setOpen(false);
                    }}
                >
                    {/* backdrop */}
                    <div className="absolute inset-0 bg-black/40" />

                    {/* sheet */}
                    <div
                        data-sheet="true"
                        className={[
                            "absolute bottom-0 left-0 right-0",
                            "rounded-t-3xl bg-white",
                            "px-5 pt-4 pb-6",
                            "shadow-2xl",
                            // лёгкая анимация “дорого”
                            "animate-[sheetIn_180ms_ease-out]",
                        ].join(" ")}
                        onPointerDown={stop}
                        onClick={stop}
                    >
                        {/* grabber */}
                        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-black/10" />

                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <div className="text-base font-semibold text-gray-900">{title}</div>
                                <div className="mt-2 text-sm leading-relaxed text-gray-600">{text}</div>
                            </div>

                            <button
                                type="button"
                                className="text-sm font-semibold text-gray-900/70 px-3 py-2 -mr-2"
                                onClick={(e) => {
                                    stop(e);
                                    setOpen(false);
                                }}
                            >
                                Close
                            </button>
                        </div>
                    </div>

                    {/* keyframes inline (без глобального css) */}
                    <style jsx>{`
            @keyframes sheetIn {
              from {
                transform: translateY(16px);
                opacity: 0;
              }
              to {
                transform: translateY(0);
                opacity: 1;
              }
            }
          `}</style>
                </div>
            )}
    </span>
    );
}