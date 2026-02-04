"use client";

import "@/components/header/header.css";
import {useCallback, useEffect, useRef, useState} from "react";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {createClient} from "@/lib/supabase/client";
import {Logo} from "@/components/ui/logo/Logo";
import {mainNav} from "@/lib/navigation/navigation";
import {UserIcon} from "@/components/ui/icons/UserIcon";
import {UserCheckIcon} from "@/components/ui/icons/UserCheckIcon";
import {MenuIcon} from "@/components/ui/icons/MenuIcon";
import {PAGE_CONTAINER} from "@/components/ui/layout";

export default function Header() {
    const pathname = usePathname();

    // ✅ locale helpers
    const locale = pathname.split("/")[1];
    const hasLocale = locale === "en" || locale === "de";
    const pathnameNoLocale = hasLocale ? pathname.replace(`/${locale}`, "") || "/" : pathname;
    const withLocale = (href: string) => (hasLocale ? `/${locale}${href}` : href);

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    // ✅ fast open + block interactions during animation
    const [isMenuAnimating, setIsMenuAnimating] = useState(false);
    const menuToggleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const savedScrollYRef = useRef(0);
    const prevPathnameRef = useRef(pathname);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 10);
        handleScroll();
        window.addEventListener("scroll", handleScroll, {passive: true});
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const supabase = createClient();

        supabase.auth.getSession().then(({data}) => setIsAuthenticated(!!data.session));

        const {data: sub} = supabase.auth.onAuthStateChange((_event, session) => {
            setIsAuthenticated(!!session);
        });

        return () => sub.subscription.unsubscribe();
    }, []);

    const closeMenu = useCallback(() => {
        if (isMenuAnimating) return;
        setIsMenuAnimating(true);
        setIsMenuOpen(false);

        // оставляем короткую блокировку на время закрывающей анимации
        menuToggleTimeoutRef.current = setTimeout(() => {
            setIsMenuAnimating(false);
        }, 150);
    }, [isMenuAnimating]);

    const toggleMenu = useCallback(() => {
        if (isMenuAnimating) return;

        if (isMenuOpen) {
            closeMenu();
        } else {
            // ✅ максимально быстрое открытие
            setIsMenuAnimating(true);
            setIsMenuOpen(true);
            menuToggleTimeoutRef.current = setTimeout(() => {
                setIsMenuAnimating(false);
            }, 10);
        }
    }, [isMenuOpen, isMenuAnimating, closeMenu]);

    useEffect(() => {
        return () => {
            if (menuToggleTimeoutRef.current) clearTimeout(menuToggleTimeoutRef.current);
        };
    }, []);

    // ✅ lock scroll + prevent click-through below (сохраняем прозрачность/blur)
    useEffect(() => {
        if (isMenuOpen) {
            savedScrollYRef.current = window.scrollY;
            document.body.style.position = "fixed";
            document.body.style.top = `-${savedScrollYRef.current}px`;
            document.body.style.width = "100%";
            document.body.style.overflow = "hidden";
        } else if (!isMenuAnimating) {
            document.body.style.position = "";
            document.body.style.top = "";
            document.body.style.width = "";
            document.body.style.overflow = "";
            window.scrollTo(0, savedScrollYRef.current);
        }

        return () => {
            if (!isMenuOpen) {
                document.body.style.position = "";
                document.body.style.top = "";
                document.body.style.width = "";
                document.body.style.overflow = "";
            }
        };
    }, [isMenuOpen, isMenuAnimating]);

    useEffect(() => {
        if (prevPathnameRef.current === pathname) return;
        prevPathnameRef.current = pathname;
        if (!isMenuOpen) return;
        queueMicrotask(() => closeMenu());
    }, [pathname, isMenuOpen, closeMenu]);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 568) closeMenu();
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [closeMenu]);

    const isActive = (href: string) => {
        if (href === "/") return pathnameNoLocale === "/";
        return pathnameNoLocale === href || pathnameNoLocale.startsWith(href + "/");
    };

    const accountHref = withLocale(isAuthenticated ? "/account" : "/signup");

    // ✅ overlay кликабелен только когда полностью открыт
    const overlayIsInteractive = isMenuOpen && !isMenuAnimating;

    return (
        <>
            <header className="fixed top-0 left-0 right-0 z-[1000] flex items-center justify-center">
                {/* Desktop Header (md+) */}
                <div className={["hidden md:flex", PAGE_CONTAINER, "items-center justify-between"].join(" ")}>
                    {/* Left */}
                    <div
                        className={[
                            "flex items-center",
                            "mt-[2px] rounded-[10px]",
                            "gap-6",
                            isScrolled
                                ? [
                                    "bg-[rgba(252,252,253,0.75)] dark:bg-[rgba(0,0,0,0.5)]",
                                    "backdrop-blur-[20px] backdrop-saturate-[180%]",
                                    "webkit-backdrop",
                                ].join(" ")
                                : "bg-transparent",
                            "px-[24px] pr-[15px] pt-[12px] pb-[9px]",
                            "lg:pt-[15px] lg:pb-[14px]",
                        ].join(" ")}
                    >
                        <Link href={withLocale("/")} aria-label="Go to home" className="flex items-center leading-none">
                            <Logo
                                className="w-[48px] h-[48px] md:w-[48px] md:h-[48px] lg:w-[38px] lg:h-[38px] text-[rgb(26,26,26)] dark:text-[rgba(255,255,255,0.92)]"/>
                        </Link>
                        <nav className="flex gap-6" aria-label="Main navigation">
                            {mainNav.map((item) => (
                                <Link
                                    key={item.href}
                                    href={withLocale(item.href)}
                                    className={[
                                        "text-[14px] font-normal leading-[8px] tracking-[0.05rem] no-underline",
                                        "text-[rgb(26,26,26)] dark:text-[rgba(255,255,255,0.92)]",
                                        "transition-opacity duration-200 hover:opacity-70",
                                        isActive(item.href) ? "font-medium" : "",
                                    ].join(" ")}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* Right */}
                    <div
                        className={[
                            "flex items-center",
                            "mt-[2px] rounded-[10px]",
                            "gap-6",
                            isScrolled
                                ? [
                                    "bg-[rgba(252,252,253,0.75)] dark:bg-[rgba(0,0,0,0.5)]",
                                    "backdrop-blur-[20px] backdrop-saturate-[180%]",
                                    "webkit-backdrop",
                                ].join(" ")
                                : "bg-transparent",
                            "pl-[15px] pr-[24px] pt-[22px] pb-[22px]",
                        ].join(" ")}
                    >
                        <Link href={accountHref} className="flex items-center justify-center" aria-label="Account">
                            {isAuthenticated ? (
                                <UserCheckIcon
                                    className="w-[22px] h-[22px] text-[rgb(26,26,26)] dark:text-[rgba(255,255,255,0.92)] transition-opacity duration-200 hover:opacity-70"/>
                            ) : (
                                <UserIcon
                                    className="w-[22px] h-[22px] text-[rgb(26,26,26)] dark:text-[rgba(255,255,255,0.92)] transition-opacity duration-200 hover:opacity-70"/>
                            )}
                        </Link>

                        <Link
                            href={withLocale("/booking")}
                            className={[
                                "px-[10px] py-[2px] rounded-[12px] border",
                                "border-[rgba(0,0,0,0.32)] dark:border-[rgba(255,255,255,0.28)]",
                                "bg-transparent",
                                "text-[14px] font-semibold tracking-[0.05rem] no-underline",
                                "text-[rgb(26,26,26)] dark:text-[rgba(255,255,255,0.92)]",
                                "transition-all duration-200",
                                "hover:bg-[rgba(0,0,0,0.05)] dark:hover:bg-[rgba(255,255,255,0.06)]",
                                "active:border-transparent active:bg-[rgba(189,175,162,0.18)] dark:active:bg-[rgba(255,255,255,0.1)]",
                            ].join(" ")}
                        >
                            Book Now
                        </Link>
                    </div>
                </div>

                {/* Mobile Header (base) */}
                <div
                    className={[
                        "relative z-[10000] md:hidden",
                        "grid grid-cols-[1fr_auto_1fr] items-center",
                        PAGE_CONTAINER,
                        "pt-[15px] pb-[10px]",
                        isScrolled
                            ? [
                                "bg-[rgba(255,255,255,0.25)] dark:bg-[rgba(0,0,0,0.3)]",
                                "backdrop-blur-[20px] backdrop-saturate-[180%]",
                                "webkit-backdrop",
                                "android-header-scrolled",
                            ].join(" ")
                            : "",
                    ].join(" ")}
                >
                    <button
                        className="flex items-center justify-center justify-self-start border-0 bg-transparent cursor-pointer pl-4"
                        onClick={toggleMenu}
                        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                        aria-expanded={isMenuOpen}
                        disabled={isMenuAnimating}
                    >
                        <MenuIcon className="w-6 h-6 text-[rgb(26,26,26)] dark:text-[rgba(255,255,255,0.92)]"/>
                    </button>

                    <Link href={withLocale("/")} className="flex items-center justify-center justify-self-center"
                          aria-label="Go to home">
                        <Logo className="w-[46px] h-[46px] text-[rgb(26,26,26)] dark:text-[rgba(255,255,255,0.92)]"/>
                    </Link>

                    <Link
                        href={withLocale("/booking")}
                        className={[
                            "justify-self-end",
                            "px-2 py-[3px] rounded-[12px] border pr-4",
                            "border-[rgba(0,0,0,0.32)] dark:border-[rgba(255,255,255,0.28)]",
                            "bg-transparent",
                            "text-[12px] font-normal tracking-[0.05rem] no-underline",
                            "text-[rgb(26,26,26)] dark:text-[rgba(255,255,255,0.92)]",
                            "transition-all duration-200",
                            "active:border-transparent active:bg-[rgba(189,175,162,0.18)] dark:active:bg-[rgba(255,255,255,0.1)]",
                        ].join(" ")}
                    >
                        Book Now
                    </Link>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            <div
                className={[
                    "fixed inset-0 z-[999] flex flex-col items-center",
                    "opacity-0 invisible pointer-events-none",
                    "transition-[opacity,visibility] duration-[150ms]",
                    isMenuOpen ? "opacity-100 visible pointer-events-auto" : "",
                    // ✅ сохраняем прозрачность + blur, но блокируем клики по странице снизу
                    "bg-[rgba(255,255,255,0)] dark:bg-[rgba(0,0,0,0.1)]",
                    "backdrop-blur-[50px] backdrop-saturate-[180%]",
                    "webkit-backdrop-strong",
                    "android-menu",
                    // ✅ во время анимации не даём клики вообще (ни по overlay, ни “сквозь”)
                    !overlayIsInteractive ? "pointer-events-none" : "",
                ].join(" ")}
                onClick={overlayIsInteractive ? closeMenu : undefined}
                aria-hidden={!isMenuOpen}
            >
                <div
                    className={[
                        "relative z-[100] flex flex-col items-start pointer-events-auto",
                        "w-[90%] max-w-[360px]",
                        "mt-[180px] sm:mt-[220px]",
                        "px-6 py-4 gap-4 rounded-[12px]",
                        "bg-[rgba(255,255,255,0.2)] dark:bg-[rgba(255,255,255,0.06)]",
                        "backdrop-blur-[15px]",
                        "webkit-backdrop",
                        "android-panel",
                        "dark:border dark:border-[rgba(255,255,255,0.1)]",
                    ].join(" ")}
                    onClick={(e) => e.stopPropagation()}
                >
                    {mainNav.map((item) =>
                        isActive(item.href) ? null : (
                            <Link
                                key={item.href}
                                href={withLocale(item.href)}
                                onClick={closeMenu}
                                className="
                  pointer-events-auto
                  text-[16px] font-normal tracking-[0.05rem] no-underline
                  text-[rgb(26,26,26)] dark:text-[rgba(255,255,255,0.92)]
                  transition-opacity duration-200 hover:opacity-70
                "
                            >
                                {item.label}
                            </Link>
                        )
                    )}

                    <div
                        className="
              mt-6 pt-4 w-full flex flex-col items-center gap-2
              border-t border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.1)]
              android-auth-border
            "
                    >
                        {isAuthenticated ? (
                            <Link
                                href={withLocale("/account")}
                                onClick={closeMenu}
                                className="
                  pointer-events-auto
                  flex items-center justify-center pt-[5px]
                  opacity-60 hover:opacity-100
                  text-[16px] font-normal no-underline
                  text-[rgb(26,26,26)] dark:text-[rgba(255,255,255,0.92)]
                  transition-opacity duration-200
                "
                            >
                                Account
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={withLocale("/signup")}
                                    onClick={closeMenu}
                                    className="
                    pointer-events-auto
                    flex items-center justify-center pt-[5px]
                    opacity-60 hover:opacity-100
                    text-[16px] font-normal no-underline
                    text-[rgb(26,26,26)] dark:text-[rgba(255,255,255,0.92)]
                    transition-opacity duration-200
                  "
                                >
                                    Sign Up
                                </Link>
                                <Link
                                    href={withLocale("/login")}
                                    onClick={closeMenu}
                                    className="
                    pointer-events-auto
                    flex items-center justify-center pt-[5px]
                    opacity-60 hover:opacity-100
                    text-[16px] font-normal no-underline
                    text-[rgb(26,26,26)] dark:text-[rgba(255,255,255,0.92)]
                    transition-opacity duration-200
                  "
                                >
                                    Log In
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}