export const PAYMENT_HOLD_MINUTES = 30;
export const PAYMENT_HOLD_MS = PAYMENT_HOLD_MINUTES * 60 * 1000;

export type OrderLifecycleLike = {
    status: string | null;
    created_at: string | null;
    payment_due_at?: string | null;
};

const ALWAYS_BLOCKING_STATUSES = new Set([
    "reserved",
    "payment_pending",
    "paid",
    "in_progress",
    // legacy compatibility
    "confirmed",
]);

function toMs(v: string | null | undefined) {
    if (!v) return NaN;
    return Date.parse(v);
}

export function computePaymentDueAt(order: {
    created_at: string | null;
    payment_due_at?: string | null;
}) {
    if (typeof order.payment_due_at === "string" && order.payment_due_at.trim()) {
        return order.payment_due_at;
    }
    const createdMs = toMs(order.created_at);
    if (Number.isNaN(createdMs)) return null;
    return new Date(createdMs + PAYMENT_HOLD_MS).toISOString();
}

export function isAwaitingPaymentStatus(status: string | null | undefined) {
    return status === "awaiting_payment" || status === "pending";
}

export function isAwaitingPaymentExpired(order: OrderLifecycleLike, nowMs = Date.now()) {
    if (!isAwaitingPaymentStatus(order.status)) return false;
    const dueIso = computePaymentDueAt(order);
    const dueMs = toMs(dueIso);
    if (Number.isNaN(dueMs)) return false;
    return dueMs <= nowMs;
}

export function isBlockingForSchedule(order: OrderLifecycleLike, nowMs = Date.now()) {
    const status = String(order.status ?? "");
    if (ALWAYS_BLOCKING_STATUSES.has(status)) return true;
    if (isAwaitingPaymentStatus(status)) return !isAwaitingPaymentExpired(order, nowMs);
    return false;
}

export function normalizeDisplayStatus(order: OrderLifecycleLike, nowMs = Date.now()) {
    const status = String(order.status ?? "");
    if (isAwaitingPaymentExpired(order, nowMs)) return "expired";
    if (status === "pending") return "awaiting_payment";
    if (status === "confirmed") return "reserved";
    return status || "unknown";
}

export function paymentDueAtFromNow(now = new Date()) {
    return new Date(now.getTime() + PAYMENT_HOLD_MS).toISOString();
}
