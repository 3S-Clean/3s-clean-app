"use client";

import {useEffect} from "react";
import type {KlaroLang} from "@/lib/consent/klaroConfig";
import {getKlaroConfig} from "@/lib/consent/klaroConfig";

declare global {
    interface Window {
        klaroConfig?: unknown;
        __klaro_inited?: boolean;
        __klaro_hooks_inited?: boolean;
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

/**
 * Sync slider.active classes with actual input checked state
 */
function syncSliderStates(root: HTMLElement) {
    const inputs = root.querySelectorAll("input.cm-list-input") as NodeListOf<HTMLInputElement>;
    inputs.forEach((input) => {
        const label = root.querySelector(`label[for="${input.id}"]`);
        const slider = label?.querySelector(".cm-switch .slider");
        if (!slider) return;
        slider.classList.toggle("active", !!input.checked);
    });
}

/**
 * Mobile-safe toggling:
 * - capture click/keydown on label.cm-list-label
 * - resolve linked input by `for=...`
 * - toggle checked + dispatch input/change
 * - keep slider class in sync
 */
function enableLabelToggles(modal: HTMLElement) {
    if (modal.dataset.klaroLabelToggles === "1") return;
    modal.dataset.klaroLabelToggles = "1";

    const toggleInput = (input: HTMLInputElement) => {
        if (input.disabled) return;

        input.checked = !input.checked;
        input.dispatchEvent(new Event("input", {bubbles: true}));
        input.dispatchEvent(new Event("change", {bubbles: true}));

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
        toggleInput(input);
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
        toggleInput(input);
    };

    modal.addEventListener("click", onClick, true);
    modal.addEventListener("keydown", onKeyDown, true);

    // initial sync
    syncSliderStates(modal);

    // keep in sync if Klaro updates DOM/classes later
    const obs = new MutationObserver(() => syncSliderStates(modal));
    obs.observe(modal, {subtree: true, attributes: true, childList: true});
    modal.dataset.klaroSyncObserver = "1";
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

        if (window.__klaro_hooks_inited) return;
        window.__klaro_hooks_inited = true;

        const observer = new MutationObserver(() => {
            const modal = document.querySelector("#cookieScreen .cm-modal.cm-klaro") as HTMLElement | null;
            if (!modal) return;

            enableLabelToggles(modal);

            // (optional) softer entrance without breaking clicks
            if (!prefersReducedMotion() && modal.dataset.klaroAnim === "1") return;
            if (!prefersReducedMotion()) {
                modal.dataset.klaroAnim = "1";
                modal.animate(
                    [
                        {opacity: 0, transform: "translateY(18px) scale(0.98)", filter: "blur(10px)"},
                        {opacity: 1, transform: "translateY(-4px) scale(1.01)", filter: "blur(2px)", offset: 0.6},
                        {opacity: 1, transform: "translateY(0px) scale(1)", filter: "blur(0px)"},
                    ],
                    {duration: 520, easing: "cubic-bezier(0.16, 1, 0.3, 1)", fill: "forwards"}
                );

                const rows = Array.from(
                    modal.querySelectorAll("ul.cm-purposes > li.cm-purpose:not(.cm-toggle-all)")
                ) as HTMLElement[];

                rows.forEach((row, i) => {
                    row.animate(
                        [
                            {opacity: 0, transform: "translateY(10px)", filter: "blur(2px)"},
                            {opacity: 1, transform: "translateY(0px)", filter: "blur(0px)"},
                        ],
                        {duration: 360, delay: 90 + i * 60, easing: "cubic-bezier(0.16, 1, 0.3, 1)", fill: "forwards"}
                    );
                });
            }
        });

        observer.observe(document.documentElement, {childList: true, subtree: true});
        return () => observer.disconnect();
    }, [lang]);

    return <div id="klaro" className="klaro"/>;
}