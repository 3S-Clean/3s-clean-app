'use client';

import { useEffect } from 'react';

export function useDeviceClass() {
    useEffect(() => {
        const ua = navigator.userAgent.toLowerCase();

        if (/android/i.test(ua)) {
            document.documentElement.classList.add('is-android');
        } else if (/iphone|ipad|ipod/i.test(ua)) {
            document.documentElement.classList.add('is-ios');
        }
    }, []);
}
