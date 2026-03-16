import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { HiDotsVertical } from 'react-icons/hi';
import { t } from 'i18next';
import moment from 'moment';
import { isAxiosError } from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    ColumnType,
    RadixButton,
    RadixDropdown,
    RadixInput,
    RadixSelect,
    RadixSpinner,
    RadixTable,
} from '@/components/radix';
import { toast } from 'sonner';
import { formatMobileNumber } from '@/utils/POS/Functions';
import { useDebounce, useMediaQuery } from '@/hooks/shared';
import { useGetDoctorsList } from '@/hooks/api/doctorPortal';
import DoctorCard from './DoctorCard';
import ChevronRightIcon from '@/assets/Marketing/ChevronRight.svg';
import { api } from '@/utils/Api/POS';
import type {
    GetApiDoctorsPortalDoctors200DoctorsItem,
    GetApiDoctorsPortalDoctorsConnectionStatus,
} from '@/shared/api/models';
import { FILTER_ALL_VALUE, type DoctorsListQueryParams } from './doctorsList.types';
import {
    buildConnectionStatusOptions,
    getConnectionStatusBadgeStyle,
    getConnectionStatusLabel,
    getStatusDateLabel,
    getStatusDateValue,
} from './doctorsList.utils';

const PAGE_SIZE = 25;

const initialQueryParams: DoctorsListQueryParams = {
    search: '',
    page: 1,
    connectionStatusFilter: FILTER_ALL_VALUE,
};

export default function DoctorsList() {
    const queryClient = useQueryClient();
    const isDesktop = useMediaQuery('(min-width: 960px)');
    const [queryParams, setQueryParams] = useState<DoctorsListQueryParams>(initialQueryParams);
    const debouncedSearch = useDebounce(queryParams.search, 400);

    const connectionStatusParam: GetApiDoctorsPortalDoctorsConnectionStatus | undefined =
        queryParams.connectionStatusFilter === FILTER_ALL_VALUE
            ? undefined
            : (queryParams.connectionStatusFilter as GetApiDoctorsPortalDoctorsConnectionStatus);

    const { data, isLoading, isError } = useGetDoctorsList({
        page: queryParams.page,
        limit: PAGE_SIZE,
        keyword: debouncedSearch.trim() || undefined,
        active: true,
        connectionStatus: connectionStatusParam,
    });

    useEffect(() => {
        if (isError) {
            toast.error(t('Doctors.FetchDoctorsFailed'));
        }
    }, [isError]);

    const doctors = (data?.doctors as GetApiDoctorsPortalDoctors200DoctorsItem[]) || [];
    const paginationMeta = data;
    const pagination = paginationMeta && {
        currentPage: paginationMeta.currentPage,
        totalPages: paginationMeta.totalPages,
        total: paginationMeta.total,
        hasNextPage: paginationMeta.currentPage < paginationMeta.totalPages,
        hasPreviousPage: paginationMeta.currentPage > 1,
        onNextPage: () =>
            setQueryParams((prev) => ({ ...prev, page: prev.page + 1 })),
        onPreviousPage: () =>
            setQueryParams((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) })),
    };

    const inviteDoctorMutation = useMutation({
        mutationFn: async (doctorUuid: string) =>
            toast.promise(api.postApiDoctorsPortalInviteDoctorUuid(doctorUuid), {
                loading: t('Doctors.InvitingDoctor'),
                success: (response) => response?.message || t('Doctors.EmailSent'),
                error: (error) =>
                    isAxiosError(error) && error.response?.status === 404
                        ? t('Doctors.InviteDoctorNotFound')
                        : t('Doctors.InviteDoctorFailed'),
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['doctorPortal', 'doctorsList'] });
        },
    });

    const removeDoctorMutation = useMutation({
        mutationFn: async (doctorUuid: string) =>
            toast.promise(api.deleteApiDoctorsPortalDoctorsDoctorUuid(doctorUuid), {
                loading: t('Doctors.RemovingDoctor'),
                success: t('Doctors.RemoveDoctorSuccess'),
                error: (error) =>
                    isAxiosError(error) && error.response?.status === 404
                        ? t('Doctors.RemoveDoctorNotFound')
                        : t('Doctors.RemoveDoctorFailed'),
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['doctorPortal', 'doctorsList'] });
        },
    });

    const handleInviteDoctor = useCallback(
        (doctorUuid: string) => {
            if (!doctorUuid) {
                toast.error(t('Doctors.InviteDoctorFailedNoUuid'));
                return;
            }
            inviteDoctorMutation.mutate(doctorUuid);
        },
        [inviteDoctorMutation],
    );

    const handleRemoveDoctor = useCallback(
        (doctorUuid: string) => {
            if (!doctorUuid) return;
            removeDoctorMutation.mutate(doctorUuid);
        },
        [removeDoctorMutation],
    );

    const columns = useMemo<ColumnType[]>(
        () => [
            {
                id: 'name',
                name: t('Doctors.Name'),
                selector: (row) => (
                    <p className="text-text-primary font-medium m-0">
                        {' '}
                        {row.firstName} {row.lastName}
                    </p>
                ),
                sortable: true,
                sortValue: (row) => `${row.firstName} ${row.lastName}`.toLowerCase(),
            },
            {
                id: 'email',
                name: t('Doctors.Email'),
                selector: (row) => (
                    <a href={`mailto:${row.email}`} className=" m-0 hover:underline text-primary-500">
                        {row.email}
                    </a>
                ),
                sortable: true,
                sortValue: (row) => row.email.toLowerCase(),
            },
            {
                id: 'phone',
                name: t('Doctors.Phone'),
                selector: (row) => (
                    <a
                        href={`tel:${row.phoneCountryCode || '+45'} ${formatMobileNumber(row.phoneNumber || '')}`}
                        className=" text-text-primary m-0"
                    >
                        {row.phoneCountryCode || '+45'} {formatMobileNumber(row.phoneNumber || '') || '-'}
                    </a>
                ),
            },
            {
                id: 'connectionStatus',
                name: t('Doctors.Status'),
                selector: (row) => {
                    const status = row.lastConnectionStatus ?? (row.isLinked ? 'linked' : 'none');
                    const style = getConnectionStatusBadgeStyle(status);
                    return (
                        <span
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium shrink-0"
                            style={{ color: style.color, backgroundColor: style.bg }}
                        >
                            {getConnectionStatusLabel(status)}
                        </span>
                    );
                },
                sortValue: (row) => row.lastConnectionStatus ?? '',
            },
            {
                id: 'statusDate',
                name: t('Doctors.StatusDate'),
                selector: (row) => {
                    const doctorRow = row as GetApiDoctorsPortalDoctors200DoctorsItem;
                    const status = doctorRow.lastConnectionStatus ?? (doctorRow.isLinked ? 'linked' : null);
                    const label = getStatusDateLabel(status ?? undefined);
                    const dateValue = getStatusDateValue(doctorRow);
                    if (!label || !dateValue) {
                        return <span className="text-text-secondary text-sm m-0">–</span>;
                    }
                    return (
                        <span className="text-text-primary text-sm m-0">
                            {moment(dateValue).format('DD/MM/YYYY HH:mm')}
                        </span>
                    );
                },
                sortValue: (row) => getStatusDateValue(row as GetApiDoctorsPortalDoctors200DoctorsItem) ?? '',
            },
            {
                id: 'actions',
                name: '',
                width: '130px',
                selector: (row) => {
                    const isLinked = row.isLinked;
                    const isInviting =
                        !isLinked &&
                        inviteDoctorMutation.isPending &&
                        inviteDoctorMutation.variables === row.uuid;
                    const isRemoving =
                        isLinked &&
                        removeDoctorMutation.isPending &&
                        removeDoctorMutation.variables === row.uuid;
                    const items = isLinked
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
                                  onClick: () => handleRemoveDoctor(row.uuid),
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
                                  onClick: () => handleInviteDoctor(row.uuid),
                                  disabled: isInviting,
                              },
                          ];
                    return (
                        <RadixDropdown
                            trigger={
                                <button
                                    type="button"
                                    className="bg-transparent p-[2px] focus:outline-none focus:ring-0 text-text-secondary border-none cursor-pointer rounded-sm w-full mx-auto"
                                    title={t('Doctors.Actions')}
                                    onClick={(event) => event.stopPropagation()}
                                >
                                    <HiDotsVertical size={18} />
                                </button>
                            }
                            items={items}
                            align="end"
                        />
                    );
                },
            },
        ],
        [
            handleInviteDoctor,
            handleRemoveDoctor,
            inviteDoctorMutation.isPending,
            inviteDoctorMutation.variables,
            removeDoctorMutation.isPending,
            removeDoctorMutation.variables,
        ],
    );

    const connectionStatusSelectOptions = useMemo(() => buildConnectionStatusOptions(), []);

    const paginationComponent = () => {
        if (!pagination) return null;
        return (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-1 pt-4 pb-0 border-t border-border-default mt-4">
                <div className="text-sm text-text-secondary">
                    {t('Common.Showing')} {doctors.length} {t('Common.of')} {pagination.total} {t('Common.items')}
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-text-secondary">
                        {t('Common.Page')} {pagination.currentPage} {t('Common.of')} {pagination.totalPages}
                    </span>
                    <RadixButton
                        variant="outline"
                        size="sm"
                        onClick={pagination.onPreviousPage}
                        iconOnly
                        disabled={!pagination.hasPreviousPage || isLoading}
                    >
                        <img src={ChevronRightIcon} alt="Previous" className="w-4 h-4 rotate-[180deg]" />
                    </RadixButton>
                    <RadixButton
                        variant="outline"
                        size="sm"
                        onClick={pagination.onNextPage}
                        iconOnly
                        disabled={!pagination.hasNextPage || isLoading}
                    >
                        <img src={ChevronRightIcon} alt="Next" className="w-4 h-4" />
                    </RadixButton>
                </div>
            </div>
        );
    };

    return (
        <React.Fragment>
            {/* Page header (aligned with Email Campaigns) */}
            <div className="mb-2 md:mb-6">
                <h1 className="text-xl font-semibold text-text-primary m-0 md:mb-1">{t('Doctors.ModuleTitle')}</h1>
                <p className="text-sm text-text-secondary m-0">{t('Doctors.ModuleDescription')}</p>
            </div>

            {isDesktop && (
                <div className="mt-0 p-0">
                    <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border-default">
                        <h2 className="text-lg font-semibold text-text-primary m-0">{t('Doctors.ListTitle')}</h2>
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="min-w-[160px] max-w-[200px]">
                                <RadixSelect
                                    value={queryParams.connectionStatusFilter}
                                    onValueChange={(value) =>
                                        setQueryParams((prev) => ({ ...prev, connectionStatusFilter: value, page: 1 }))
                                    }
                                    options={connectionStatusSelectOptions}
                                    placeholder={t('Doctors.ConnectionStatusFilter')}
                                />
                            </div>
                            <div className="min-w-[220px] max-w-[280px]">
                                <RadixInput
                                    placeholder={t('Doctors.SearchPlaceholder')}
                                    value={queryParams.search}
                                    onChange={(event) =>
                                        setQueryParams((prev) => ({ ...prev, search: event.target.value, page: 1 }))
                                    }
                                />
                            </div>
                        </div>
                    </div>
                    <div>
                        <RadixTable columns={columns} data={doctors} loading={isLoading} />
                        {pagination && pagination.totalPages > 1 && paginationComponent()}
                    </div>
                </div>
            )}

            {/* Mobile: unchanged layout */}
            {!isDesktop && (
                <section className="space-y-4">
                    <div className="flex flex-col gap-3">
                        <RadixSelect
                            value={queryParams.connectionStatusFilter}
                            onValueChange={(value) =>
                                setQueryParams((prev) => ({ ...prev, connectionStatusFilter: value, page: 1 }))
                            }
                            options={connectionStatusSelectOptions}
                            placeholder={t('Doctors.ConnectionStatusFilter')}
                        />
                        <RadixInput
                            placeholder={t('Doctors.SearchPlaceholder')}
                            value={queryParams.search}
                            onChange={(event) =>
                                setQueryParams((prev) => ({ ...prev, search: event.target.value, page: 1 }))
                            }
                        />
                    </div>
                    <div>
                        {isLoading && doctors.length === 0 && (
                            <div className="flex items-center justify-center py-32 border border-border-default border-solid rounded-md">
                                <RadixSpinner size="md" />
                            </div>
                        )}
                        {!isLoading && doctors.length === 0 && (
                            <div className="text-center py-32 border border-border-default border-solid rounded-md">
                                <p className="text-text-secondary m-0">{t('Customer.NoDataFound')}</p>
                            </div>
                        )}
                        {doctors.length > 0 && (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {doctors.map((doctor) => (
                                        <DoctorCard
                                            key={doctor.uuid}
                                            doctor={doctor}
                                            onInvite={handleInviteDoctor}
                                            onRemove={handleRemoveDoctor}
                                            isInviting={
                                                inviteDoctorMutation.isPending &&
                                                inviteDoctorMutation.variables === doctor.uuid
                                            }
                                            isRemoving={
                                                removeDoctorMutation.isPending &&
                                                removeDoctorMutation.variables === doctor.uuid
                                            }
                                        />
                                    ))}
                                </div>
                                {pagination && pagination.totalPages > 1 && paginationComponent()}
                            </>
                        )}
                    </div>
                </section>
            )}
        </React.Fragment>
    );
}
