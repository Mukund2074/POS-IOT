import moment from 'moment';

/**
 * Date formatter utility functions
 * Centralized date formatting using moment.js for consistency
 */

/**
 * Format date to YYYY-MM-DD (ISO date string for API)
 * @param date - Date object, date string, or null
 * @returns Formatted date string (YYYY-MM-DD) or null
 */
export const formatDateToISO = (date: Date | string | null | undefined): string | null => {
    if (!date) return null;
    return moment(date).format('YYYY-MM-DD');
};

/**
 * Parse date string (YYYY-MM-DD) to Date object
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Date object or null if invalid
 */
export const parseDateFromISO = (dateString: string | null | undefined): Date | null => {
    if (!dateString) return null;
    const parsed = moment(dateString, 'YYYY-MM-DD', true);
    return parsed.isValid() ? parsed.toDate() : null;
};

/**
 * Format date for display (DD/MM-YYYY)
 * @param date - Date object, date string, or null
 * @returns Formatted date string (DD/MM-YYYY) or empty string
 */
export const formatDateForDisplay = (date: Date | string | null | undefined): string => {
    if (!date) return '';
    return moment(date).format('DD/MM-YYYY');
};

/**
 * Format date with custom format
 * @param date - Date object, date string, or null
 * @param format - Moment.js format string (e.g., 'DD/MM/YYYY', 'YYYY-MM-DD HH:mm')
 * @returns Formatted date string or empty string
 */
export const formatDate = (date: Date | string | null | undefined, format: string = 'DD/MM-YYYY'): string => {
    if (!date) return '';
    return moment(date).format(format);
};

/**
 * Validate date string format
 * @param dateString - Date string to validate
 * @param format - Expected format (default: 'YYYY-MM-DD')
 * @returns true if valid, false otherwise
 */
export const isValidDate = (dateString: string | null | undefined, format: string = 'YYYY-MM-DD'): boolean => {
    if (!dateString) return false;
    return moment(dateString, format, true).isValid();
};
