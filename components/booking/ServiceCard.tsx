"use client";

import type React from "react";
import Link from "next/link";
import {Check} from "lucide-react";
import type {ServiceId} from "@/lib/booking/config";
import {CARD_FRAME_BASE, CARD_FRAME_HOVER_LIFT, CARD_FRAME_INTERACTIVE} from "@/components/ui/card/CardFrame";
import SectionTitle from "@/components/ui/typography/SectionTitle";
import BodyText from "@/components/ui/typography/BodyText";

type IncludeUI = { name: string; desc?: string };
type TooltipComp = (p: { text: string; title?: string; dark?: boolean }) => React.ReactElement;

type BaseService = {
    id: ServiceId;
    startingPrice: number;
};

type BaseProps = {
    service: BaseService;
    title: string;
    desc: string;
    includes: IncludeUI[];

    fromLabel: string;
    incVatLabel: string;
    includesHeading: string;

    ctaLabel: string;
    showCta?: boolean;
    Tooltip?: TooltipComp;
};

type LinkModeProps = BaseProps & {
    mode: "link";
    href: string;
};

type SelectModeProps = BaseProps & {
    mode: "select";
    selected: boolean;
    onSelect: () => void;
};

export type ServiceCardProps = LinkModeProps | SelectModeProps;

export default function ServiceCard(props: ServiceCardProps) {
    const {
        service,
        title,
        desc,
        includes,
        fromLabel,
        incVatLabel,
        includesHeading,
        ctaLabel,
        Tooltip,
        showCta = true,
    } = props;

    const isSelect = props.mode === "select";
    const selected = isSelect ? props.selected : false;

    return (
        <div
            id={service.id}
            role={isSelect ? "button" : undefined}
            tabIndex={isSelect ? 0 : undefined}
            aria-pressed={isSelect ? selected : undefined}
            onClick={isSelect ? props.onSelect : undefined}
            onKeyDown={
                isSelect
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            props.onSelect();
                        }
                    }
                    : undefined
            }
            className={[
                CARD_FRAME_BASE,
                "overflow-hidden",
                props.mode === "select" || props.mode === "link" ? CARD_FRAME_INTERACTIVE : "",
                props.mode === "link" ? CARD_FRAME_HOVER_LIFT : "",
                isSelect && !selected ? CARD_FRAME_HOVER_LIFT : "",
            ].join(" ")}
        >
            {/* ✅ check badge */}
            {isSelect && selected && (
                <div
                    className={[
                        "absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center",
                        "bg-gray-900 border border-white/10",
                    ].join(" ")}
                    aria-hidden="true"
                >
                    <Check className="w-5 h-5 text-white"/>
                </div>
            )}
            <div className="px-6 md:px-8 py-7 md:py-8">
                <SectionTitle className="mb-2">
                    {title}
                </SectionTitle>
                <BodyText className="text-sm text-gray-600 dark:text-white/70 mb-5">
                    {desc}
                </BodyText>
                <p className="text-lg md:text-xl font-semibold text-[var(--text)]">
                    {fromLabel} € {service.startingPrice}{" "}
                    <span className="text-sm font-normal text-gray-500 dark:text-white/60">
            {incVatLabel}
          </span>
                </p>
                <div className="mt-5 h-px w-full bg-gray-900/15 dark:bg-white/15"/>
                {/* CTA */}
                {showCta && props.mode === "link" ? (
                    <Link
                        href={props.href}
                        className={[
                            "mt-5 block w-full text-center font-semibold rounded-full",
                            "py-2.5",
                            "transition-all border",
                            "bg-gray-900 text-white border-gray-900",
                            "hover:bg-white hover:text-gray-900 hover:border-gray-900",
                            "dark:bg-white dark:text-gray-900 dark:border-white/20",
                            "dark:hover:bg-gray-900 dark:hover:text-white dark:hover:border-white/20",
                        ].join(" ")}
                    >
                        {ctaLabel}
                    </Link>
                ) : showCta && props.mode === "select" ? (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            props.onSelect();
                        }}
                        className={[
                            "mt-5 w-full text-center font-semibold rounded-full",
                            "py-2.5",
                            "transition-all border",
                            "bg-gray-900 text-white border-gray-900",
                            "hover:bg-white hover:text-gray-900 hover:border-gray-900",
                            "dark:bg-white dark:text-gray-900 dark:border-white/20",
                            "dark:hover:bg-gray-900 dark:hover:text-white dark:hover:border-white/20",
                        ].join(" ")}
                    >
                        {ctaLabel}
                    </button>
                ) : null}
                <p className="text-sm font-semibold mt-6 mb-4 text-gray-600 dark:text-white/70">
                    {includesHeading}
                </p>
                <ul className="space-y-3">
                    {includes.map((it, i) => (
                        <li key={i} className="flex items-start">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-900/60 dark:bg-white/60 mt-2 mr-3"/>
                            <span className="flex items-center flex-wrap gap-2">
                <span className="text-[15px] text-gray-700 dark:text-white/80">{it.name}</span>
                                {it.desc && Tooltip ? <Tooltip text={it.desc} title={it.name}/> : null}
              </span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}