/**
 * Doctors list – constants and type definitions
 */

export const FILTER_ALL_VALUE = 'all';

export interface StatusDateRow {
    lastConnectionStatus?: string;
    isLinked?: boolean;
    linkedDate?: string;
    updatedAt?: string | null;
}

export interface ConnectionStatusOption {
    value: string;
    label: string;
}

export interface DoctorsListQueryParams {
    search: string;
    page: number;
    connectionStatusFilter: string;
}
