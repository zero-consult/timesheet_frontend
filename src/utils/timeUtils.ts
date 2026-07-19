export function calcHours(start: string, end: string): number {
    if (!start || !end) return 0;
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    const diff = (eh * 60 + em) - (sh * 60 + sm);
    return Math.max(0, Math.round(diff / 60 * 10) / 10);
}

export function formatHours(h: number, locale?: string) {
    const whole = Math.floor(h);
    const mins = Math.round((h - whole) * 60);
    let hourText = "h"
    let minText = "m"
    if (locale === "nl") {
        hourText = "u";
    }
    if (locale === "jp") {
        hourText = "時間";
        minText = "分";
    }
    return mins > 0 ? `${whole}${hourText} ${mins}${minText}` : `${whole}${hourText}`;
}