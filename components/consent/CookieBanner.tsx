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

function prefersReducedMotion() {
    return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
}

function stopEvent(e: Event) {
    e.preventDefault();
    e.stopPropagation();
    const maybe = e as unknown as { stopImmediatePropagation?: () => void };
    maybe.stopImmediatePropagation?.();
}

/** Sync all .slider states with their checkbox checked state */
function syncSliderStates(modal: HTMLElement) {
    const inputs = modal.querySelectorAll("input.cm-list-input") as NodeListOf<HTMLInputElement>;
    inputs.forEach((input) => {
        const label = modal.querySelector(`label[for="${input.id}"]`);
        const slider = label?.querySelector<HTMLElement>(".slider.round");
        if (!slider) return;

        if (input.checked) slider.classList.add("active");
        else slider.classList.remove("active");
    });
}

/**
 * Reliable toggling (mobile-safe):
 * - click on label.cm-list-label
 * - resolve input by `for=...`
 * - manually toggle checked + dispatch input/change (Klaro reacts reliably)
 * - update slider visual state
 */
function enableLabelToggles(modal: HTMLElement) {
    if (modal.dataset.klaroLabelToggles === "1") return;
    modal.dataset.klaroLabelToggles = "1";

    const toggle = (input: HTMLInputElement) => {
        if (input.disabled) return;

        input.checked = !input.checked;

        input.dispatchEvent(new Event("input", {bubbles: true}));
        input.dispatchEvent(new Event("change", {bubbles: true}));

        // keep UI in sync even if Klaro re-renders
        syncSliderStates(modal);
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

    // initial sync
    syncSliderStates(modal);
}

function animateOpen(modal: HTMLElement, isMobile: boolean) {
    if (prefersReducedMotion()) return;
    if (modal.dataset.klaroOpenAnimated === "1") return;
    modal.dataset.klaroOpenAnimated = "1";

    // smoother + longer (wow, but still quick)
    const EASE_OPEN = "cubic-bezier(0.16, 1, 0.3, 1)";

    if (!isMobile) {
        modal.animate(
            [
                {opacity: 0, transform: "translate(34px, 46px) scale(0.92)", filter: "blur(16px)"},
                {opacity: 1, transform: "translate(-6px, -6px) scale(1.02)", filter: "blur(3px)", offset: 0.62},
                {opacity: 1, transform: "translate(2px, 2px) scale(0.995)", filter: "blur(0.5px)", offset: 0.84},
                {opacity: 1, transform: "translate(0px, 0px) scale(1)", filter: "blur(0px)"},
            ],
            {duration: 980, easing: EASE_OPEN, fill: "forwards"}
        );
    } else {
        modal.animate(
            [
                {opacity: 0, transform: "translateY(56px) scale(0.92)", filter: "blur(16px)"},
                {opacity: 1, transform: "translateY(-14px) scale(1.02)", filter: "blur(3px)", offset: 0.62},
                {opacity: 1, transform: "translateY(5px) scale(0.995)", filter: "blur(0.5px)", offset: 0.84},
                {opacity: 1, transform: "translateY(0px) scale(1)", filter: "blur(0px)"},
            ],
            {duration: 1020, easing: EASE_OPEN, fill: "forwards"}
        );
    }

    // stagger rows
    const items = Array.from(modal.querySelectorAll("ul.cm-purposes > li.cm-purpose:not(.cm-toggle-all)")) as HTMLElement[];
    items.forEach((el, i) => {
        el.animate(
            [
                {opacity: 0, transform: "translateY(12px) scale(0.99)", filter: "blur(3px)"},
                {opacity: 1, transform: "translateY(-2px) scale(1.01)", filter: "blur(0.7px)", offset: 0.65},
                {opacity: 1, transform: "translateY(0px) scale(1)", filter: "blur(0px)"},
            ],
            {duration: 720, delay: 160 + i * 90, easing: EASE_OPEN, fill: "forwards"}
        );
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

            // keep syncing even if Klaro re-renders list after click
            syncSliderStates(modal);

            const isMobile = window.matchMedia("(max-width: 640px)").matches;
            animateOpen(modal, isMobile);
        });

        obs.observe(document.documentElement, {childList: true, subtree: true});
        return () => obs.disconnect();
    }, [lang]);

    return <div id="klaro" className="klaro"/>;
}