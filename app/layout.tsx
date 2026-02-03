import type { Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { DeviceDetector } from "@/components/ui/devicedetector/DeviceDetector";

const inter = localFont({
    src: [
        { path: "../public/fonts/inter/Inter-Regular.woff2", weight: "400", style: "normal" },
        { path: "../public/fonts/inter/Inter-SemiBold.woff2", weight: "600", style: "normal" },
        { path: "../public/fonts/inter/Inter-Bold.woff2", weight: "700", style: "normal" },

        // если нужен курсив — раскомментируй:
        // { path: "../public/fonts/inter/Inter-Italic.woff2", weight: "400", style: "italic" },
        // { path: "../public/fonts/inter/Inter-SemiBoldItalic.woff2", weight: "600", style: "italic" },
        // { path: "../public/fonts/inter/Inter-BoldItalic.woff2", weight: "700", style: "italic" },
    ],
    variable: "--font-inter",
    display: "swap",
});

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#fcfcfd" },
        { media: "(prefers-color-scheme: dark)", color: "#070A0D" },
    ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className={inter.variable} suppressHydrationWarning>
        <body className="antialiased">
        <DeviceDetector />
        {children}
        </body>
        </html>
    );
}