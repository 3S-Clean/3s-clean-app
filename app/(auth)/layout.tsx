import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
});

export const metadata: Metadata = {
    title: "3S Clean",
    description: "Premium cleaning service",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <head>
            <meta name="color-scheme" content="dark light" />
        </head>
        <body
            className={`${inter.variable} antialiased`}
        >
        {children}
        </body>
        </html>
    );
}