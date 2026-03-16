/**
 * Simple className merge utility
 * Merges class names, filtering out falsy values
 * @param classes - Array of class names (strings, undefined, null, or false)
 * @returns Merged class name string
 */
export declare const cnMerge: (...classes: (string | undefined | null | false)[]) => string;
