"use client";

import {useEffect} from "react";

export default function HashAnchorScroll() {
    useEffect(() => {
        const hash = window.location.hash;
        if (!hash) return;

        const id = hash.slice(1);
        if (!id) return;

        // дождаться, пока DOM точно есть (после гидрации)
        requestAnimationFrame(() => {
            const el = document.getElementById(id);
            if (!el) return;
            el.scrollIntoView({block: "start"});
        });
    }, []);

    return null;
}