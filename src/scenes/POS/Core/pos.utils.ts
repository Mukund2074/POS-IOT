import i18next from 'i18next';

export const formatCurrency = (amount: number | string | null | undefined): string => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR', // Indian Rupee
        maximumFractionDigits: 2
    }).format(Number(amount));
};

export const formatPrice = (price: string): string => {
    const numericValue = price.replace(/[^0-9.]/g, '');

    // Ensure only one decimal point
    const parts = numericValue.split('.');
    let formattedValue =
        parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : numericValue;

    // Limit to 2 decimal places
    if (parts.length === 2 && parts[1].length > 2) {
        formattedValue = parts[0] + '.' + parts[1].substring(0, 2);
    }

    return formattedValue;
};

export const formatDurationToHours = (minutes: number): string => {
    const hours = minutes / 60;
    const formattedHours = hours.toFixed(2);
    const currentLang = i18next.language;

    // India generally uses decimal point
    return currentLang === 'hi' ? formattedHours : formattedHours;
};