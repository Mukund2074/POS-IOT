/**
 * Doctors list – helper functions (use i18n at runtime)
 */

import { t } from 'i18next';
import { GetApiDoctorsPortalDoctorsConnectionStatus as ConnectionStatusEnum } from '@/shared/api/models/getApiDoctorsPortalDoctorsConnectionStatus';
import type { ConnectionStatusOption, StatusDateRow } from './doctorsList.types';
import { FILTER_ALL_VALUE } from './doctorsList.types';

export function buildConnectionStatusOptions(): ConnectionStatusOption[] {
    return [
        { value: FILTER_ALL_VALUE, label: t('Doctors.FilterAll') },
        { value: ConnectionStatusEnum.linked, label: t('Doctors.FilterLinked') },
        { value: ConnectionStatusEnum.invited, label: t('Doctors.FilterInvited') },
        { value: ConnectionStatusEnum.none, label: t('Doctors.FilterNone') },
        { value: ConnectionStatusEnum.removed, label: t('Doctors.FilterRemoved') },
        { value: ConnectionStatusEnum.rejected, label: t('Doctors.FilterRejected') },
        { value: ConnectionStatusEnum.self_unlinked, label: t('Doctors.FilterSelfUnlinked') },
    ];
}

export function getConnectionStatusLabel(status: string | undefined): string {
    if (!status) return t('Doctors.StatusNone');
    const map: Record<string, string> = {
        linked: t('Doctors.StatusLinked'),
        invited: t('Doctors.StatusInvited'),
        none: t('Doctors.StatusNone'),
        removed: t('Doctors.StatusRemoved'),
        rejected: t('Doctors.StatusRejected'),
        self_unlinked: t('Doctors.StatusSelfUnlinked'),
    };
    return map[status] ?? status;
}

export function getConnectionStatusBadgeStyle(status: string | undefined): { color: string; bg: string } {
    switch (status) {
        case 'linked':
            return { color: '#3b9a45', bg: '#ecf5ed' };
        case 'invited':
            return { color: '#b45309', bg: '#fff2e8' };
        case 'removed':
        case 'rejected':
            return { color: '#991b1b', bg: '#ffe5e5' };
        case 'self_unlinked':
            return { color: '#6b7280', bg: '#f3f4f6' };
        default:
            return { color: '#6b7280', bg: '#f3f4f6' };
    }
}

export function getStatusDateLabel(status: string | undefined): string | null {
    switch (status) {
        case 'linked':
            return t('Doctors.LinkedDate');
        case 'removed':
            return t('Doctors.RemovedAt');
        case 'self_unlinked':
            return t('Doctors.SelfUnlinkedAt');
        case 'rejected':
            return t('Doctors.RejectedAt');
        default:
            return null;
    }
}

export function getStatusDateValue(row: StatusDateRow): string | null {
    const status = row.lastConnectionStatus ?? (row.isLinked ? 'linked' : null);
    if (status === 'linked' && row.linkedDate) return row.linkedDate;
    if ((status === 'removed' || status === 'self_unlinked' || status === 'rejected') && row.updatedAt)
        return typeof row.updatedAt === 'string' ? row.updatedAt : null;
    return null;
}
