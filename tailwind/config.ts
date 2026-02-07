import type {Config} from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./lib/**/*.{js,ts,jsx,tsx,mdx}",
        "./content/**/*.{md,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
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
                    "0%": {opacity: "0", transform: "translateY(10px)"},
                    "100%": {opacity: "1", transform: "translateY(0)"},
                },
                slideIn: {
                    "0%": {opacity: "0", transform: "translateX(20px)"},
                    "100%": {opacity: "1", transform: "translateX(0)"},
                },
            },
        },
    },
    plugins: [typography],
};

export default config;