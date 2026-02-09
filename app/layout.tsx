import type {Viewport} from "next";
import localFont from "next/font/local";
import "./globals.css";
import {DeviceDetector} from "@/shared/ui/device-detector/DeviceDetector";

const inter = localFont({
    src: [
        {path: "../public/fonts/inter/Inter-Regular.woff2", weight: "400", style: "normal"},
        {path: "../public/fonts/inter/Inter-SemiBold.woff2", weight: "600", style: "normal"},
        {path: "../public/fonts/inter/Inter-Bold.woff2", weight: "700", style: "normal"},
    ],
    variable: "--font-inter",
    display: "swap",
});

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    themeColor: [
        {media: "(prefers-color-scheme: light)", color: "#fcfcfd"},
        {media: "(prefers-color-scheme: dark)", color: "#070A0D"},
    ],
};

export default function RootLayout({children}: { children: React.ReactNode }) {
    return (
        <html lang="en" className={inter.variable} suppressHydrationWarning>
        <body className="antialiased">
        <DeviceDetector/>
        {children}
        </body>
        </html>
    );
}