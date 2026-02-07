"use client";

import {useEffect} from "react";
import type {KlaroLang} from "@/lib/consent/klaroConfig";
import {getKlaroConfig} from "@/lib/consent/klaroConfig";

declare global {
    interface Window {
        klaroConfig?: unknown;
        __klaro_inited?: boolean;
        __klaro_anim_inited?: boolean;
    }
}

const EASE = "cubic-bezier(0.2, 1, 0.25, 1)";

function prefersReducedMotion() {
    return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
}

function animateOpen(modal: HTMLElement, isMobile: boolean) {
    if (prefersReducedMotion()) return;

    if (modal.dataset.klaroOpenAnimated === "1") return;
    modal.dataset.klaroOpenAnimated = "1";

    const screen = modal.closest("#cookieScreen") as HTMLElement | null;
    const overlay = screen?.querySelector(".cm-bg") as HTMLElement | null;

    overlay?.animate([{opacity: 0}, {opacity: 1}], {
        duration: 420,
        easing: EASE,
        fill: "forwards",
    });

    if (!isMobile) {
        modal.animate(
            [
                {opacity: 0, transform: "translate(34px, 46px) scale(0.93)", filter: "blur(14px)"},
                {opacity: 1, transform: "translate(-7px, -7px) scale(1.018)", filter: "blur(3px)", offset: 0.58},
                {opacity: 1, transform: "translate(3px, 3px) scale(0.996)", filter: "blur(0.4px)", offset: 0.82},
                {opacity: 1, transform: "translate(0px, 0px) scale(1)", filter: "blur(0px)"},
            ],
            {duration: 920, easing: EASE, fill: "forwards"}
        );
    } else {
        modal.animate(
            [
                {opacity: 0, transform: "translateY(54px) scale(0.93)", filter: "blur(14px)"},
                {opacity: 1, transform: "translateY(-14px) scale(1.018)", filter: "blur(3px)", offset: 0.58},
                {opacity: 1, transform: "translateY(5px) scale(0.996)", filter: "blur(0.4px)", offset: 0.82},
                {opacity: 1, transform: "translateY(0px) scale(1)", filter: "blur(0px)"},
            ],
            {duration: 940, easing: EASE, fill: "forwards"}
        );
    }

    // Stagger only the purpose rows (skip toggle-all if present)
    const items = Array.from(
        modal.querySelectorAll("ul.cm-purposes > li.cm-purpose:not(.cm-toggle-all)")
    ) as HTMLElement[];

    items.forEach((el, i) => {
        el.animate(
            [
                {opacity: 0, transform: "translateY(14px) scale(0.985)", filter: "blur(3px)"},
                {opacity: 1, transform: "translateY(-2px) scale(1.005)", filter: "blur(0.6px)", offset: 0.6},
                {opacity: 1, transform: "translateY(0px) scale(1)", filter: "blur(0px)"},
            ],
            {
                duration: 680,
                delay: 120 + i * 70,
                easing: EASE,
                fill: "forwards",
            }
        );
    });
}

function animateClose(modal: HTMLElement) {
    if (prefersReducedMotion()) return;

    const screen = modal.closest("#cookieScreen") as HTMLElement | null;
    const overlay = screen?.querySelector(".cm-bg") as HTMLElement | null;

    // reverse panel
    modal.animate(
        [
            {
                opacity: 1,
                transform: getComputedStyle(modal).transform || "translate(0,0) scale(1)",
                filter: "blur(0px)"
            },
            {opacity: 0, transform: "translate(22px, 28px) scale(0.97)", filter: "blur(10px)"},
        ],
        {duration: 420, easing: "cubic-bezier(0.4, 0, 0.2, 1)", fill: "forwards"}
    );

    // reverse overlay
    overlay?.animate([{opacity: 1}, {opacity: 0}], {
        duration: 320,
        easing: "cubic-bezier(0.4, 0, 0.2, 1)",
        fill: "forwards",
    });
}

export default function CookieBanner({lang}: { lang: KlaroLang }) {
    useEffect(() => {
        window.klaroConfig = getKlaroConfig(lang);

        if (!window.__klaro_inited) {
            void (async () => {
                const mod = await import("klaro/dist/klaro-no-css");
                mod.default.setup(window.klaroConfig);
                window.__klaro_inited = true;
            })();
        }

        if (window.__klaro_anim_inited) return;
        window.__klaro_anim_inited = true;

        const obs = new MutationObserver(() => {
            const modal = document.querySelector("#cookieScreen .cm-modal.cm-klaro") as HTMLElement | null;
            if (!modal) return;

            const isMobile = window.matchMedia("(max-width: 640px)").matches;
            animateOpen(modal, isMobile);

            // hook close buttons (Reject/Save/Accept/Close) to play reverse animation
            const closeBtns = modal.querySelectorAll("button.cm-btn") as NodeListOf<HTMLButtonElement>;
            closeBtns.forEach((btn) => {
                if (btn.dataset.klaroCloseHooked === "1") return;
                btn.dataset.klaroCloseHooked = "1";
                btn.addEventListener("click", () => animateClose(modal), {passive: true});
            });
        });

        obs.observe(document.documentElement, {childList: true, subtree: true});
        return () => obs.disconnect();
    }, [lang]);

    return <div id="klaro" className="klaro"/>;
}