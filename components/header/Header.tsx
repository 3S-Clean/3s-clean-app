"use client";

import "@/components/header/header.css";
import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/ui/logo/Logo";
import { mainNav } from "@/lib/navigation/navigation";
import { UserIcon } from "@/components/ui/icons/UserIcon";
import { UserCheckIcon } from "@/components/ui/icons/UserCheckIcon";
import { MenuIcon } from "@/components/ui/icons/MenuIcon";

export default function Header() {
    const pathname = usePathname();

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    const savedScrollYRef = useRef(0);
    const prevPathnameRef = useRef(pathname);

    // ✅ Scroll detection for glass effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        // Check initial scroll position
        handleScroll();

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

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
    const toggleMenu = useCallback(() => setIsMenuOpen((v) => !v), []);

    // ✅ scroll lock (fixed body)
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

    // ✅ close menu on route change
    useEffect(() => {
        if (prevPathnameRef.current === pathname) return;

        prevPathnameRef.current = pathname;

        if (!isMenuOpen) return;

        queueMicrotask(() => {
            setIsMenuOpen(false);
        });
    }, [pathname, isMenuOpen]);

    // ✅ close menu on resize above breakpoint
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 568) closeMenu();
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [closeMenu]);

    const accountHref = isAuthenticated ? "/account" : "/signup";

    // ✅ helper: highlight active for nested routes too
    const isActive = (href: string) => {
        if (href === "/") return pathname === "/";
        return pathname === href || pathname.startsWith(href + "/");
    };

    return (
        <>
            <header className={`header ${isScrolled ? "scrolled" : ""}`}>
                {/* Desktop Header */}
                <div className="header-desktop">
                    <div className="header-left">
                        <Link href="/" aria-label="Go to home" className="logo-link">
                            <Logo className="logo" />
                        </Link>

                        <nav className="nav-desktop" aria-label="Main navigation">
                            {mainNav.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`nav-link ${isActive(item.href) ? "active" : ""}`}
                                >
                                    {item.label}
                                </Link>
                            ))}
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
                        aria-expanded={isMenuOpen}
                    >
                        <MenuIcon className="menu-icon" />
                    </button>

                    <Link href="/" className="logo-link-mobile" aria-label="Go to home">
                        <Logo className="logo-mobile" />
                    </Link>

                    <Link href="/booking" className="book-button-mobile">
                        Book Now
                    </Link>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            <div className={`mob-menu ${isMenuOpen ? "open" : ""}`} onClick={closeMenu}>
                <div className="mob-menu-panel" onClick={(e) => e.stopPropagation()}>
                    {mainNav.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`mob-menu-link ${isActive(item.href) ? "current" : ""}`}
                            onClick={closeMenu}
                        >
                            {item.label}
                        </Link>
                    ))}

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
