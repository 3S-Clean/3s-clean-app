import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                // next/font -> variable: "--font-inter"
                // globals.css -> --font-ui: var(--font-inter), ...
                // поэтому sans указывает на --font-ui (самый верхний “источник истины”)
                sans: [
                    "var(--font-ui)",
                    "-apple-system",
                    "BlinkMacSystemFont",
                    "system-ui",
                    "sans-serif",
                ],
            },
            animation: {
                fadeIn: "fadeIn 0.4s ease-out",
                slideIn: "slideIn 0.3s ease-out",
            },
            keyframes: {
                fadeIn: {
                    "0%": { opacity: "0", transform: "translateY(10px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                slideIn: {
                    "0%": { opacity: "0", transform: "translateX(20px)" },
                    "100%": { opacity: "1", transform: "translateX(0)" },
                },
            },
        },
    },
    plugins: [],
};

export default config;