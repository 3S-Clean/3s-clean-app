"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Info } from "lucide-react";

/** mobile < md */
function useIsMobile(breakpointPx = 768) {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const mq = window.matchMedia(`(max-width:${breakpointPx - 1}px)`);
        const update = () => setIsMobile(mq.matches);
        update();
        mq.addEventListener("change", update);
        return () => mq.removeEventListener("change", update);
    }, [breakpointPx]);

    return isMobile;
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

    /** lock scroll on mobile sheet */
    useEffect(() => {
        if (isMobile) lockBodyScroll(open);
        return () => lockBodyScroll(false);
    }, [open, isMobile]);

    /** close on ESC */
    useEffect(() => {
        if (!open) return;

        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };

        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open]);

    /** outside click (desktop tooltip) */
    useEffect(() => {
        if (!open || isMobile) return;

        const capture = true;

        const onDown = (e: PointerEvent) => {
            const target = e.target as Node | null;
            if (!target) return;

            const root = btnRef.current?.closest("[data-infohelp-root]");
            if (root && root.contains(target)) return;

            setOpen(false);
        };

        window.addEventListener("pointerdown", onDown, capture);
        return () => window.removeEventListener("pointerdown", onDown, capture);
    }, [open, isMobile]);

    const iconClass = useMemo(
        () =>
            dark
                ? "text-white/60 hover:text-white/85"
                : "text-gray-400 hover:text-gray-600",
        [dark]
    );

    return (
        <span
            data-infohelp-root
            className="relative inline-block"
            onPointerDown={stop}
            onClick={stop}
        >
      <button
          ref={btnRef}
          type="button"
          aria-label="More info"
          className={`ml-1.5 inline-flex items-center justify-center transition-colors p-2 -m-2 ${iconClass}`}
          onMouseEnter={() => !isMobile && setOpen(true)}
          onMouseLeave={() => !isMobile && setOpen(false)}
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
                    className={`absolute z-50 w-72 p-3 text-sm rounded-lg shadow-lg -top-2 left-6
            ${
                        dark
                            ? "bg-gray-900 text-white border border-white/10"
                            : "bg-white text-gray-700 border border-gray-200"
                    }`}
                    onPointerDown={stop}
                    onClick={stop}
                >
                    {text}
                </div>
            )}

            {/* MOBILE BOTTOM-SHEET (PORTAL) */}
            {isMobile &&
                open &&
                createPortal(
                    <div
                        className="fixed inset-0 z-[2147483647]"
                        aria-modal="true"
                        role="dialog"
                        onPointerDown={(e) => {
                            const t = e.target as HTMLElement;
                            if (t?.dataset?.sheet === "true") return;
                            setOpen(false);
                        }}
                    >
                        {/* backdrop */}
                        <div className="absolute inset-0 bg-black/40" />

                        {/* sheet */}
                        <div
                            data-sheet="true"
                            className="absolute bottom-0 left-0 right-0 rounded-t-3xl bg-white px-5 pt-4 pb-6 shadow-2xl animate-[sheetIn_180ms_ease-out]"
                            onPointerDown={stop}
                            onClick={stop}
                        >
                            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-black/10" />

                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <div className="text-base font-semibold text-gray-900">
                                        {title}
                                    </div>
                                    <div className="mt-2 text-sm leading-relaxed text-gray-600">
                                        {text}
                                    </div>
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
                    </div>,
                    document.body
                )}
    </span>
    );
}