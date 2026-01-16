export function UserCheckIcon({ className = "" }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <circle cx="9" cy="8" r="4" />
            <path d="M1 21v-1a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v1" />
            <polyline points="16 11 18 13 22 9" />
        </svg>
    );
}