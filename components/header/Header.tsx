"use client";

import "@/components/header/header.css";
import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/ui/Logo";
import { mainNav } from "@/lib/navigation/navigation";
import { UserIcon } from "@/components/ui/icons/UserIcon";
import { UserCheckIcon } from "@/components/ui/icons/UserCheckIcon";
import { MenuIcon } from "@/components/ui/icons/MenuIcon";
import { webflowUrl } from "@/lib/navigation/navigation";

export default function Header() {
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const savedScrollYRef = useRef(0);
    const prevPathnameRef = useRef(pathname);

    // ✅ Auth state (Supabase)
    useEffect(() => {
        const supabase = createClient();

        supabase.auth.getSession().then(({ data }) => {
            setIsAuthenticated(!!data.session);
        });

        const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
            setIsAuthenticated(!!session);
        });

        return () => sub.subscription.unsubscribe();
    }, []);

    const closeMenu = useCallback(() => setIsMenuOpen(false), []);

    const toggleMenu = useCallback(() => {
        setIsMenuOpen((v) => !v);
    }, []);

    // ✅ scroll lock
    useEffect(() => {
        if (isMenuOpen) {
            savedScrollYRef.current = window.scrollY;

            document.body.style.position = "fixed";
            document.body.style.top = `-${savedScrollYRef.current}px`;
            document.body.style.width = "100%";
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.position = "";
            document.body.style.top = "";
            document.body.style.width = "";
            document.body.style.overflow = "";
            window.scrollTo(0, savedScrollYRef.current);
        }

        return () => {
            document.body.style.position = "";
            document.body.style.top = "";
            document.body.style.width = "";
            document.body.style.overflow = "";
        };
    }, [isMenuOpen]);

    // ✅ ИСПРАВЛЕНО: close menu on route change (без isMenuOpen в deps)
    useEffect(() => {
        if (prevPathnameRef.current !== pathname) {
            prevPathnameRef.current = pathname;
            // Используем queueMicrotask чтобы не было синхронного setState
            queueMicrotask(closeMenu);
        }
    }, [pathname, closeMenu]);

    // ✅ close menu on resize above breakpoint
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 568) {
                closeMenu();
            }
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [closeMenu]);

    const accountHref = isAuthenticated ? "/account" : "/signup";

    return (
        <>
            <header className="header">
                {/* Desktop Header */}
                <div className="header-desktop">
                    <div className="header-left">
                        <a
                            href={webflowUrl("/")}
                            aria-label="Go to main website"
                            className="logo-link"
                            rel="noopener noreferrer"
                        >
                            <Logo className="logo"  />
                        </a>
                        <nav className="nav-desktop" aria-label="Main navigation">
                            {mainNav.map((item) =>
                                item.external ? (
                                    <a
                                        key={item.href}
                                        href={item.href}
                                        className={`nav-link ${pathname === item.href ? "active" : ""}`}
                                    >
                                        {item.label}
                                    </a>
                                ) : (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`nav-link ${pathname === item.href ? "active" : ""}`}
                                    >
                                        {item.label}
                                    </Link>
                                )
                            )}
                        </nav>
                    </div>

                    <div className="header-right">
                        <Link href={accountHref} className="user-link" aria-label="Account">
                            {isAuthenticated ? (
                                <UserCheckIcon className="user-icon" />
                            ) : (
                                <UserIcon className="user-icon" />
                            )}
                        </Link>

                        <Link href="/booking" className="book-button">
                            Book Now
                        </Link>
                    </div>
                </div>

                {/* Mobile Header */}
                <div className="header-mobile">
                    <button
                        className="menu-toggle"
                        onClick={toggleMenu}
                        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                    >
                        <MenuIcon className="menu-icon" />
                    </button>

                    <a href={webflowUrl("/")} className="logo-link-mobile" aria-label="Go to main website" rel="noopener noreferrer">
                        <Logo className="logo-mobile" />
                    </a>

                    <Link href="/booking" className="book-button-mobile">
                        Book Now
                    </Link>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            <div
                className={`mob-menu ${isMenuOpen ? "open" : ""}`}
                onClick={closeMenu}
            >
                <div className="mob-menu-panel" onClick={(e) => e.stopPropagation()}>
                    {mainNav.map((item) =>
                        item.external ? (
                            <a
                                key={item.href}
                                href={item.href}
                                className={`mob-menu-link ${pathname === item.href ? "current" : ""}`}
                                onClick={closeMenu}
                            >
                                {item.label}
                            </a>
                        ) : (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`mob-menu-link ${pathname === item.href ? "current" : ""}`}
                                onClick={closeMenu}
                            >
                                {item.label}
                            </Link>
                        )
                    )}

                    <div className="mob-menu-auth">
                        {isAuthenticated ? (
                            <Link href="/account" className="mob-menu-auth-link" onClick={closeMenu}>
                                Account
                            </Link>
                        ) : (
                            <>
                                <Link href="/signup" className="mob-menu-auth-link" onClick={closeMenu}>
                                    Sign Up
                                </Link>
                                <Link href="/login" className="mob-menu-auth-link" onClick={closeMenu}>
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

