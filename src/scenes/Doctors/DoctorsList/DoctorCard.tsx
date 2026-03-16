import React from 'react';
import { HiDotsVertical } from 'react-icons/hi';
import { t } from 'i18next';
import moment from 'moment';
import { RadixCard, RadixDropdown, RadixSpinner } from '@/components/radix';
import { formatMobileNumber } from '@/utils/POS/Functions';
import type { GetApiDoctorsPortalDoctors200DoctorsItem } from '@/shared/api/models';
import { getConnectionStatusBadgeStyle, getConnectionStatusLabel, getStatusDateLabel } from './doctorsList.utils';

interface DoctorCardProps {
    doctor: GetApiDoctorsPortalDoctors200DoctorsItem;
    onInvite: (doctorUuid: string) => void;
    onRemove?: (doctorUuid: string) => void;
    isInviting: boolean;
    isRemoving?: boolean;
}

export default function DoctorCard({ doctor, onInvite, onRemove, isInviting, isRemoving = false }: DoctorCardProps) {
    const status = doctor.lastConnectionStatus ?? (doctor.isLinked ? 'linked' : 'none');
    const style = getConnectionStatusBadgeStyle(status);

    return (
        <RadixCard className="border border-solid border-border-default rounded-md p-4">
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-base font-semibold m-0 text-text-primary truncate">
                            {doctor.firstName} {doctor.lastName}
                        </p>
                        <span
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium shrink-0"
                            style={{ color: style.color, backgroundColor: style.bg }}
                        >
                            {getConnectionStatusLabel(status)}
                        </span>
                    </div>
                </div>
                {(!doctor.isLinked || onRemove) && (
                    <RadixDropdown
                        trigger={
                            <button
                                type="button"
                                className="bg-transparent p-[2px] focus:outline-none focus:ring-0 cursor-pointer text-text-secondary border-solid border-0 rounded-sm"
                                title={t('Doctors.Actions')}
                            >
                                <HiDotsVertical size={20} />
                            </button>
                        }
                        items={
                            doctor.isLinked && onRemove
                                ? [
                                      {
                                          label: isRemoving ? (
                                              <span className="flex items-center gap-2">
                                                  <RadixSpinner size="sm" variant="primary" />
                                                  {t('Doctors.RemovingDoctor')}
                                              </span>
                                          ) : (
                                              t('Doctors.RemoveDoctor')
                                          ),
                                          onClick: () => onRemove(doctor.uuid),
                                          disabled: isRemoving,
                                      },
                                  ]
                                : [
                                      {
                                          label: isInviting ? (
                                              <span className="flex items-center gap-2">
                                                  <RadixSpinner size="sm" variant="primary" />
                                                  {t('Doctors.InvitingDoctor')}
                                              </span>
                                          ) : (
                                              t('Doctors.InviteDoctor')
                                          ),
                                          onClick: () => onInvite(doctor.uuid),
                                          disabled: isInviting,
                                      },
                                  ]
                        }
                        align="end"
                    />
                )}
            </div>

            <div className="space-y-2 border-border-default border-0 border-t border-dashed pt-2">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary">{t('Doctors.Phone')}</span>
                    <span className="text-text-primary font-medium">
                        {doctor.phoneCountryCode || '+45'} {formatMobileNumber(doctor.phoneNumber || '') || '-'}
                    </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary">{t('Doctors.Email')}</span>
                    <a
                        href={`mailto:${doctor.email}`}
                        className="text-sm m-0 truncate hover:underline text-primary-500"
                    >
                        {doctor.email}
                    </a>
                </div>
                {(() => {
                    const status = doctor.lastConnectionStatus ?? (doctor.isLinked ? 'linked' : null);
                    const dateLabel = status ? getStatusDateLabel(status) : null;
                    const dateValue =
                        status === 'linked' && doctor.linkedDate
                            ? doctor.linkedDate
                            : (status === 'removed' || status === 'self_unlinked' || status === 'rejected') &&
                                doctor.updatedAt
                              ? typeof doctor.updatedAt === 'string'
                                  ? doctor.updatedAt
                                  : null
                              : null;
                    if (!dateLabel || !dateValue) return null;
                    return (
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-text-secondary">{t(dateLabel)}</span>
                            <span className="text-text-primary font-medium">
                                {moment(dateValue).format('DD/MM/YYYY HH:mm')}
                            </span>
                        </div>
                    );
                })()}
            </div>
        </RadixCard>
    );
}
