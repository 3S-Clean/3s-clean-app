"use client";

import {useEffect} from "react";
import type {KlaroLang} from "@/lib/consent/klaroConfig";
import {getKlaroConfig} from "@/lib/consent/klaroConfig";

declare global {
    interface Window {
        klaroConfig?: unknown;
        __klaro_inited?: boolean;
        __klaro_hooks_inited?: boolean;
        __klaro_lang?: KlaroLang;
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

function syncSliderStates(root: HTMLElement) {
    const inputs = root.querySelectorAll("input.cm-list-input") as NodeListOf<HTMLInputElement>;
    inputs.forEach((input) => {
        const label = root.querySelector(`label[for="${input.id}"]`);
        const slider = label?.querySelector(".cm-switch .slider");
        if (!slider) return;
        slider.classList.toggle("active", !!input.checked);
    });
}

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
    syncSliderStates(modal);

    const obs = new MutationObserver(() => syncSliderStates(modal));
    obs.observe(modal, {subtree: true, attributes: true, childList: true});
    modal.dataset.klaroSyncObserver = "1";
}

/**
 * Hide "required" badge from title row.
 */
function relocateRequiredBadges(modal: HTMLElement) {
    if (modal.dataset.klaroRequiredMoved === "1") return;
    modal.dataset.klaroRequiredMoved = "1";

    const purposes = modal.querySelectorAll("li.cm-purpose") as NodeListOf<HTMLElement>;
    purposes.forEach((li) => {
        const badge = li.querySelector(".cm-required") as HTMLElement | null;
        if (!badge) return;
        badge.style.display = "none";
    });
}

/**
 * Inject a short subtitle line under each purpose title inside the label.
 * Visible always (no need to expand caret).
 */
function injectPurposeSubtitles(modal: HTMLElement, lang: KlaroLang) {
    if (modal.dataset.klaroSubtitles === "1") return;
    modal.dataset.klaroSubtitles = "1";

    const isDE = lang === "de";

    const subtitles: Record<string, { en: string; de: string }> = {
        necessary: {
            en: "Session, security & consent storage · always on",
            de: "Sitzung, Sicherheit & Einwilligung · immer aktiv",
        },
        external: {
            en: "YouTube videos & embedded content",
            de: "YouTube-Videos & eingebettete Inhalte",
        },
        analytics: {
            en: "Anonymous usage stats to improve the site",
            de: "Anonyme Nutzungsstatistik zur Verbesserung",
        },
    };

    const purposes = modal.querySelectorAll("li.cm-purpose:not(.cm-toggle-all)") as NodeListOf<HTMLElement>;
    purposes.forEach((li) => {
        const input = li.querySelector("input.cm-list-input") as HTMLInputElement | null;
        if (!input) return;

        // Extract purpose key from id: "purpose-item-necessary" → "necessary"
        const purposeKey = input.id?.replace("purpose-item-", "") ?? "";
        const texts = subtitles[purposeKey];
        if (!texts) return;

        const titleSpan = li.querySelector(".cm-list-title") as HTMLElement | null;
        if (!titleSpan) return;

        // Don't inject twice
        if (titleSpan.querySelector(".cm-list-subtitle")) return;

        const sub = document.createElement("span");
        sub.className = "cm-list-subtitle";
        sub.textContent = isDE ? texts.de : texts.en;
        titleSpan.appendChild(sub);
    });
}

function enablePurposeCaretToggle(modal: HTMLElement) {
    if (modal.dataset.klaroCaretToggle === "1") return;
    modal.dataset.klaroCaretToggle = "1";

    // Hide the native Klaro caret elements (no longer needed — subtitle shows description)
    const purposes = modal.querySelectorAll("li.cm-purpose:not(.cm-toggle-all)") as NodeListOf<HTMLElement>;
    purposes.forEach((li) => {
        const caretEl = li.querySelector(".cm-services .cm-caret") as HTMLElement | null;
        if (caretEl) caretEl.style.display = "none";
    });
}

export default function CookieBanner({lang}: { lang: KlaroLang }) {
    useEffect(() => {
        window.klaroConfig = getKlaroConfig(lang);

        void (async () => {
            const mod = (await import("klaro/dist/klaro-no-css")) as unknown as {
                default: { setup: (cfg: unknown) => void };
            };

            // ✅ Run setup on first init OR when lang changed
            if (!window.__klaro_inited || window.__klaro_lang !== lang) {
                mod.default.setup(window.klaroConfig);
                window.__klaro_inited = true;
                window.__klaro_lang = lang;
            }
        })();

        const observer = new MutationObserver(() => {
            const modal = document.querySelector("#cookieScreen .cm-modal.cm-klaro") as HTMLElement | null;
            if (!modal) return;

            enableLabelToggles(modal);
            enablePurposeCaretToggle(modal);
            relocateRequiredBadges(modal);
            injectPurposeSubtitles(modal, lang);

            // ✅ Animation
            if (!prefersReducedMotion() && modal.dataset.klaroAnim === "1") return;
            if (!prefersReducedMotion()) {
                modal.dataset.klaroAnim = "1";

                modal.animate(
                    [
                        {opacity: 0, transform: "translateY(18px) scale(0.98)", filter: "blur(10px)"},
                        {opacity: 1, transform: "translateY(-4px) scale(1.01)", filter: "blur(2px)", offset: 0.6},
                        {opacity: 1, transform: "translateY(0px) scale(1)", filter: "blur(0px)"},
                    ],
                    {
                        duration: 820,
                        easing: "cubic-bezier(0.16, 1, 0.3, 1)",
                        fill: "forwards",
                    }
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
                        {
                            duration: 520,
                            delay: 140 + i * 90,
                            easing: "cubic-bezier(0.16, 1, 0.3, 1)",
                            fill: "forwards",
                        }
                    );
                });
            }
        });

        observer.observe(document.documentElement, {childList: true, subtree: true});
        return () => observer.disconnect();
    }, [lang]);

    return <div id="klaro" className="klaro"/>;
}
