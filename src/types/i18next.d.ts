declare module 'i18next' {
    export type SimplifiedTFunction = {
        (key: string, options?: any): string;
        (key: string, defaultValue: string, options?: any): string;
    };

    export interface SimplifiedI18n {
        t: SimplifiedTFunction;
        language: string;
        [key: string]: any;
    }

    export const t: SimplifiedTFunction;
    const i18next: SimplifiedI18n;
    export default i18next;
}
