export const normalizeInternationalMobile = (mobile) => {
    let normalized = String(mobile || "").trim();
    normalized = normalized.replace(/[\s\-().]/g, "");
    if (normalized.startsWith("00")) {
        normalized = `+${normalized.slice(2)}`;
    }
    if (!normalized.startsWith("+")) {
        throw new Error("Mobile number must include international country code (e.g. +14155550123).");
    }
    if (!/^\+[1-9]\d{7,14}$/.test(normalized)) {
        throw new Error("Invalid international mobile format. Use E.164 format like +14155550123.");
    }
    return normalized;
};
//# sourceMappingURL=phone.js.map