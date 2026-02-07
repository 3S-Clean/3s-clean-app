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

const EASE_OPEN = "cubic-bezier(0.2, 1, 0.25, 1)";
const EASE_CLOSE = "cubic-bezier(0.4, 0, 0.2, 1)";

function prefersReducedMotion() {
    return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
}

function stopEvent(e: Event) {
    e.preventDefault();
    e.stopPropagation();
    const maybe = e as unknown as { stopImmediatePropagation?: () => void };
    maybe.stopImmediatePropagation?.();
}

/**
 * Reliable toggling (mobile-safe):
 * - find label.cm-list-label click
 * - resolve linked input by `for=...`
 * - manually toggle `checked` and dispatch input/change (Klaro reacts reliably)
 * - update .slider visual state
 */
function enableLabelToggles(modal: HTMLElement) {
    if (modal.dataset.klaroLabelToggles === "1") return;
    modal.dataset.klaroLabelToggles = "1";

    const toggle = (input: HTMLInputElement) => {
        if (input.disabled) return;

        // Toggle checked state
        input.checked = !input.checked;
        input.dispatchEvent(new Event("input", {bubbles: true}));
        input.dispatchEvent(new Event("change", {bubbles: true}));

        // Update slider visual
        const label = modal.querySelector(`label[for="${input.id}"]`);
        const slider = label?.querySelector(".slider");
        if (slider) {
            if (input.checked) {
                slider.classList.add("active");
            } else {
                slider.classList.remove("active");
            }
        }
    };

    const onClick = (e: Event) => {
        const t = e.target as HTMLElement | null;
        const label = t?.closest?.("label.cm-list-label") as HTMLLabelElement | null;
        if (!label) return;

        const id = label.getAttribute("for");
        if (!id) return;

        const input = modal.querySelector(`#${CSS.escape(id)}`) as HTMLInputElement | null;
        if (!input || input.disabled) return;

        stopEvent(e);
        toggle(input);
    };

    const onKeyDown = (e: KeyboardEvent) => {
        const t = e.target as HTMLElement | null;
        const label = t?.closest?.("label.cm-list-label") as HTMLLabelElement | null;
        if (!label) return;

        if (e.key !== "Enter" && e.key !== " ") return;

        const id = label.getAttribute("for");
        if (!id) return;

        const input = modal.querySelector(`#${CSS.escape(id)}`) as HTMLInputElement | null;
        if (!input || input.disabled) return;

        stopEvent(e);
        toggle(input);
    };

    modal.addEventListener("click", onClick, true);
    modal.addEventListener("keydown", onKeyDown, true);

    // ✅ FIX: Sync initial slider states with input checked state
    syncSliderStates(modal);
}

/**
 * Sync all .slider states with their input checkbox states
 */
function syncSliderStates(modal: HTMLElement) {
    const inputs = modal.querySelectorAll("input.cm-list-input") as NodeListOf<HTMLInputElement>;
    inputs.forEach((input) => {
        const label = modal.querySelector(`label[for="${input.id}"]`);
        const slider = label?.querySelector(".slider");
        if (slider) {
            if (input.checked) {
                slider.classList.add("active");
            } else {
                slider.classList.remove("active");
            }
        }
    });
}

function animateOpen(modal: HTMLElement, isMobile: boolean) {
    if (prefersReducedMotion()) return;
    if (modal.dataset.klaroOpenAnimated === "1") return;
    modal.dataset.klaroOpenAnimated = "1";

    const screen = modal.closest("#cookieScreen") as HTMLElement | null;
    const overlay = screen?.querySelector(".cm-bg") as HTMLElement | null;

    overlay?.animate([{opacity: 0}, {opacity: 1}], {
        duration: 520,
        easing: EASE_OPEN,
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
            {duration: 980, easing: EASE_OPEN, fill: "forwards"}
        );
    } else {
        modal.animate(
            [
                {opacity: 0, transform: "translateY(54px) scale(0.93)", filter: "blur(14px)"},
                {opacity: 1, transform: "translateY(-14px) scale(1.018)", filter: "blur(3px)", offset: 0.58},
                {opacity: 1, transform: "translateY(5px) scale(0.996)", filter: "blur(0.4px)", offset: 0.82},
                {opacity: 1, transform: "translateY(0px) scale(1)", filter: "blur(0px)"},
            ],
            {duration: 1040, easing: EASE_OPEN, fill: "forwards"}
        );
    }

    // Stagger rows
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
                duration: 720,
                delay: 140 + i * 80,
                easing: EASE_OPEN,
                fill: "forwards",
            }
        );
    });
}

function animateClose(modal: HTMLElement) {
    if (prefersReducedMotion()) return;

    const screen = modal.closest("#cookieScreen") as HTMLElement | null;
    const overlay = screen?.querySelector(".cm-bg") as HTMLElement | null;

    modal.animate(
        [
            {opacity: 1, transform: "translate(0px, 0px) scale(1)", filter: "blur(0px)"},
            {opacity: 0, transform: "translate(22px, 28px) scale(0.97)", filter: "blur(10px)"},
        ],
        {duration: 520, easing: EASE_CLOSE, fill: "forwards"}
    );

    overlay?.animate([{opacity: 1}, {opacity: 0}], {
        duration: 420,
        easing: EASE_CLOSE,
        fill: "forwards",
    });
}

export default function CookieBanner({lang}: { lang: KlaroLang }) {
    useEffect(() => {
        window.klaroConfig = getKlaroConfig(lang);

        if (!window.__klaro_inited) {
            void (async () => {
                const mod = (await import("klaro/dist/klaro-no-css")) as unknown as {
                    default: { setup: (cfg: unknown) => void };
                };
                mod.default.setup(window.klaroConfig);
                window.__klaro_inited = true;
            })();
        }

        if (window.__klaro_anim_inited) return;
        window.__klaro_anim_inited = true;

        const obs = new MutationObserver(() => {
            const modal = document.querySelector("#cookieScreen .cm-modal.cm-klaro") as HTMLElement | null;
            if (!modal) return;

            enableLabelToggles(modal);

            const isMobile = window.matchMedia("(max-width: 640px)").matches;
            animateOpen(modal, isMobile);

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
