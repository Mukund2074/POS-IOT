/**
 * Returns true when markCriticalWhen is a non-empty array and the answer value is in it.
 * Used for health declaration critical icon/display in calendar, booking modal, and form.
 */
export function isAnswerValueInMarkCriticalWhen(
    value: string | number | boolean | string[] | null | undefined,
    markCriticalWhen: (boolean | string)[] | null | undefined,
): boolean {
    if (!Array.isArray(markCriticalWhen) || markCriticalWhen.length === 0) return false;
    if (value == null) return false;
    if (Array.isArray(value)) return value.some((v) => markCriticalWhen.some((c) => c === v));
    return markCriticalWhen.some((c) => c === value);
}
