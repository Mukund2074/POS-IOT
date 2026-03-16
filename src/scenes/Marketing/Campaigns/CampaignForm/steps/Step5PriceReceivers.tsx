import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';
import { t } from 'i18next';
import { invalidateMarketingQueries } from '@/hooks/api/marketing';
import {
    RadixAccordion,
    RadixButton,
    RadixCard,
    RadixCheckbox,
    RadixDialog,
    RadixDropdown,
    RadixInput,
    RadixSpinner,
    RadixTooltip,
} from '@/components/radix';
import { cnMerge } from '@/utils/cnMerge';
import { api } from '@/utils/Api/POS';
// @ts-ignore
import { GetCustomersApi } from '@/utils/Api/Customer';
import { loadCampaignData, setCreatedCampaign } from '@/redux/slices/Marketing/campaigns';
import { mapApiResponseToCampaignData } from '@/redux/slices/Marketing/campaigns/campaignDataMapper';
import type { GetApiCampaignsCampaignIdStatisticsRecipients200Item } from '@/shared/api/models';
import { toast } from '@/utils/toast';
import { formatMobileNumber } from '@/utils/POS/Functions';
import { FiFilter } from 'react-icons/fi';
import { formatCurrency } from '@/scenes/POS/Core/pos.utils';
import { PostApiCampaignsBodyCampaignType } from '@/shared/api/models/postApiCampaignsBodyCampaignType';
import { calculateSmsCampaignPrice } from '@/utils/Marketing/smsPrice';
import InfoDarkIcon from '@/assets/Marketing/infoDark.svg';
import { useMediaQuery } from '@/hooks/shared';

/** Customer from GetCustomersApi (Python store) - id is outlet customer id for campaign API */
type CustomerListItem = { id: number; name?: string; phone_number?: string; email?: string; country_code?: string };

export default function Step5PriceReceivers({
    campaignId,
    canEdit,
}: {
    campaignId?: string | null;
    canEdit?: boolean;
}) {
    const dispatch = useDispatch();
    const queryClient = useQueryClient();
    const createdCampaign = useSelector((state: any) => state.campaigns.createdCampaign);
    const campaignData = useSelector((state: any) => state.campaigns.campaignData);
    const recipientCount = campaignData?.step5?.recipientCount ?? 0;

    const [recipientModalOpen, setRecipientModalOpen] = useState(false);
    const [customers, setCustomers] = useState<CustomerListItem[]>([]);
    const [recipientList, setRecipientList] = useState<GetApiCampaignsCampaignIdStatisticsRecipients200Item[]>([]);
    const [enabledIds, setEnabledIds] = useState<number[]>([]);
    const [searchFilter, setSearchFilter] = useState('');
    const [filterSelection, setFilterSelection] = useState<'ALL' | 'SELECTED' | 'NOT_SELECTED'>('ALL');
    const [loadingRecipients, setLoadingRecipients] = useState(false);
    const [loadingSearch, setLoadingSearch] = useState(false);
    const [savingRecipients, setSavingRecipients] = useState(false);
    const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isTablet = useMediaQuery('(min-width: 600px)');

    const campaignPrice =
        createdCampaign?.campaignType === PostApiCampaignsBodyCampaignType.SMS
            ? formatCurrency(
                  calculateSmsCampaignPrice({
                      content: campaignData?.step3?.content ?? '',
                      receivers: recipientCount,
                      pricePerSms: createdCampaign?.perSmsCharge ?? 0,
                  }),
              )
            : t('Marketing.EmailCampaignsFree');
    const displayCount = createdCampaign?.recipientCount ?? recipientCount;

    const openModal = useCallback(() => {
        if (!campaignId) return;
        setRecipientModalOpen(true);
    }, [campaignId]);

    const CUSTOMER_LIMIT = 10000;

    const fetchRecipients = useCallback(
        async (campaignId?: string | null) => {
            if (!campaignId) return;
            try {
                setLoadingRecipients(true);
                const recipients = await api.getApiCampaignsCampaignIdStatisticsRecipients(campaignId);
                const filteredRecipients = recipients.filter((r) => r.status !== 'SKIPPED');
                setRecipientList(recipients);
                setEnabledIds(filteredRecipients.map((r) => r.outletCustomerId));
            } catch (error) {
                console.error(error);
            } finally {
                setLoadingRecipients(false);
            }
        },
        [setRecipientList, setEnabledIds],
    );

    // When modal opens: fetch campaign initial receivers only (for enabledIds)
    useEffect(() => {
        if (!recipientModalOpen || !campaignId || !canEdit) return;
        setLoadingRecipients(true);
        fetchRecipients(campaignId);
        setCustomers([]);
        setEnabledIds([]);
        setSearchFilter('');
        setFilterSelection('ALL');
    }, [recipientModalOpen, campaignId, fetchRecipients, canEdit]);

    // API search: debounced when user types; immediate when modal opens (searchFilter "")
    useEffect(() => {
        if (searchDebounceRef.current) {
            clearTimeout(searchDebounceRef.current);
            searchDebounceRef.current = null;
        }
        const search = searchFilter.trim();
        const fetchCustomers = () => {
            setLoadingSearch(true);
            GetCustomersApi({
                search,
                offset: 0,
                limit: CUSTOMER_LIMIT,
                employees: '',
                sort_by: '',
                sort: '',
            })
                .then((res: { data?: { data?: { data?: CustomerListItem[] } } }) => {
                    setCustomers((res?.data?.data?.data ?? []) as CustomerListItem[]);
                })
                .catch(() => setCustomers([]))
                .finally(() => setLoadingSearch(false));
        };
        if (search === '') {
            fetchCustomers();
        } else {
            searchDebounceRef.current = setTimeout(fetchCustomers, 300);
        }
        return () => {
            if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
        };
    }, [recipientModalOpen, campaignId, searchFilter]);

    const toggleId = useCallback((id: number, checked: boolean) => {
        setEnabledIds((prev) => (checked ? (prev.includes(id) ? prev : [...prev, id]) : prev.filter((x) => x !== id)));
    }, []);

    const filteredCustomers =
        filterSelection === 'SELECTED'
            ? customers.filter((c) => enabledIds.includes(c.id))
            : filterSelection === 'NOT_SELECTED'
              ? customers.filter((c) => !enabledIds.includes(c.id))
              : customers;

    const allSelected = filteredCustomers.length > 0 && filteredCustomers.every((c) => enabledIds.includes(c.id));
    const handleSelectAll = useCallback(
        (checked: boolean) => {
            if (checked) {
                setEnabledIds((prev) => [...new Set([...prev, ...filteredCustomers.map((c) => c.id)])]);
            } else {
                setEnabledIds((prev) => prev.filter((id) => !filteredCustomers.some((c) => c.id === id)));
            }
        },
        [filteredCustomers],
    );

    const handleSaveRecipients = useCallback(async () => {
        if (!campaignId) return;
        setSavingRecipients(true);
        try {
            await api.putApiCampaignsCampaignIdStatisticsRecipients(campaignId, { recipients: enabledIds });
            const data = await api.getApiCampaignsId(campaignId);
            dispatch(loadCampaignData(mapApiResponseToCampaignData(data)));
            dispatch(setCreatedCampaign(data as any));
            invalidateMarketingQueries(queryClient);
            setRecipientModalOpen(false);
            toast.success(t('Marketing.EmailCampaignsRecipientListSaveSuccess'));
        } catch {
            toast.error(t('Marketing.EmailCampaignsRecipientListSaveError'));
        } finally {
            setSavingRecipients(false);
        }
    }, [campaignId, enabledIds, dispatch, queryClient]);

    const handleCancelModal = useCallback(() => {
        setRecipientModalOpen(false);
    }, []);

    const getManualLabelTextByCustomerId = useCallback(
        (customerId: number): string | null => {
            const r = recipientList.find((r) => r.outletCustomerId === customerId);
            if (!r?.isManuallyUpdated) return null;
            const isSkipped = String(r.deliveryStatus || r.status || '').toUpperCase() === 'SKIPPED';
            return isSkipped
                ? t('Marketing.EmailCampaignsManuallyRemoved')
                : t('Marketing.EmailCampaignsManuallyAdded');
        },
        [recipientList],
    );

    const filterMap = {
        ALL: t('Common.All'),
        SELECTED: t('Marketing.EmailCampaignsFilterSelected'),
        NOT_SELECTED: t('Marketing.EmailCampaignsFilterNotSelected'),
    };

    return (
        <React.Fragment>
            <RadixAccordion
                hideIcon={true}
                value="price"
                defaultOpen={true}
                disabled={true}
                triggerClassName={cnMerge('!opacity-100 cursor-default')}
                title={<p className="m-0 text-lg text-text-primary font-medium">{t('Common.Price')}</p>}
            >
                <div className="flex flex-col items-start justify-start gap-2 mt-2 md:p-2">
                    <span className="flex items-center justify-between md:justify-start gap-2 m-0 h-0 w-full p-0">
                        <p className="font-medium text-text-secondary m-0">
                            {t('Marketing.EmailCampaignsPriceForBroadcasting')}
                        </p>
                        <span className="flex items-center gap-1">
                            <p className="font-semibold text-text-primary p-0 m-0">{campaignPrice}</p>
                            {createdCampaign?.campaignType === PostApiCampaignsBodyCampaignType.SMS && (
                                <RadixTooltip
                                    title={
                                        <p className="text-xs text-text-secondary whitespace-pre-line">
                                            {t('Marketing.ThisIsApproximatedPrice')}
                                        </p>
                                    }
                                >
                                    <img src={InfoDarkIcon} alt="Info" className="w-4 h-4" />
                                </RadixTooltip>
                            )}
                        </span>
                    </span>
                    <span
                        className={cnMerge(
                            'flex items-center justify-between md:justify-start gap-2 font-semibold p-0 m-0 md:w-fit w-full',
                            canEdit ? 'text-primary-500  ' : 'text-text-secondary',
                        )}
                    >
                        <p
                            onClick={canEdit ? openModal : undefined}
                            className={cnMerge('font-medium m-0 p-0', canEdit ? 'cursor-pointer underline' : '')}
                        >
                            {t('Marketing.EmailCampaignsTotalReceivers')}
                        </p>
                        <p>{displayCount}</p>
                    </span>
                </div>
            </RadixAccordion>

            <RadixDialog
                open={recipientModalOpen}
                onOpenChange={setRecipientModalOpen}
                title={t('Marketing.EmailCampaignsRecipientList')}
                description={
                    <div className="flex flex-col gap-2 flex-shrink-0">
                        <div className="flex items-center gap-2">
                            <RadixInput
                                type="text"
                                value={searchFilter}
                                onChange={(e) => setSearchFilter(e.target.value)}
                                placeholder={t('Marketing.EmailCampaignsRecipientSearchPlaceholder')}
                                className="flex-1"
                            />
                            {loadingSearch && <RadixSpinner size="sm" className="flex-shrink-0" />}
                            <RadixDropdown
                                trigger={
                                    <button
                                        type="button"
                                        className={cnMerge(
                                            'h-10 w-10 min-w-[2.5rem] flex-shrink-0 inline-flex items-center justify-center rounded-md',
                                            'border border-border-default bg-background-paper',
                                            'text-text-primary hover:bg-grey-50 focus:outline-none',
                                            'dark:bg-background-paper dark:hover:bg-grey-800',
                                        )}
                                        aria-label="Filter"
                                    >
                                        <FiFilter className="w-5 h-5 text-text-primary" />
                                    </button>
                                }
                                items={['ALL', 'SELECTED', 'NOT_SELECTED'].map((value) => ({
                                    label: filterMap[value as keyof typeof filterMap],
                                    value,
                                    onClick: () => setFilterSelection(value as 'ALL' | 'SELECTED' | 'NOT_SELECTED'),
                                }))}
                                align="end"
                                side="bottom"
                            />
                        </div>
                        <div className="flex items-center gap-2 w-full p-2">
                            <RadixCheckbox
                                checked={allSelected}
                                onChange={handleSelectAll}
                                label={t('Marketing.EmailCampaignsSelectAll')}
                            />
                        </div>
                    </div>
                }
                descriptionClassName="border-0 border-b-[1px] border-border-default border-solid"
                className="max-h-[90vh] sm:max-h-[70vh] flex flex-col max-w-full"
                footer={
                    <span className="flex justify-end gap-2 ml-auto">
                        <RadixButton variant="ghost" onClick={handleCancelModal} disabled={savingRecipients}>
                            {t('Marketing.Cancel')}
                        </RadixButton>
                        <RadixButton onClick={handleSaveRecipients} disabled={savingRecipients}>
                            {savingRecipients ? (
                                <>
                                    <RadixSpinner className="w-4 h-4" />
                                    <span className="ml-2">{t('POS.Processing')}</span>
                                </>
                            ) : (
                                t('Common.Save')
                            )}
                        </RadixButton>
                    </span>
                }
                position={isTablet ? 'center' : 'bottom'}
            >
                <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
                    {loadingRecipients ? (
                        <div className="flex items-center justify-center py-8">
                            <RadixSpinner />
                            <span className="ml-2 text-text-secondary">
                                {t('Marketing.EmailCampaignsRecipientListLoading')}
                            </span>
                        </div>
                    ) : (
                        <>
                            <div className="flex-1 overflow-auto min-h-0 mb-4 space-y-2">
                                {filteredCustomers.map((customer) => {
                                    const manualLabelText = getManualLabelTextByCustomerId(customer.id);
                                    return (
                                        <RadixCard
                                            key={customer.id}
                                            className={cnMerge(
                                                'p-3 flex items-start gap-3',
                                                'hover:!bg-background-subtle hover:shadow-none',
                                            )}
                                            onClick={() => toggleId(customer.id, !enabledIds.includes(customer.id))}
                                        >
                                            <div className="flex-shrink-0 pt-0.5" onClick={(e) => e.stopPropagation()}>
                                                <RadixCheckbox
                                                    checked={enabledIds.includes(customer.id)}
                                                    onChange={(checked) => toggleId(customer.id, checked)}
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                                                <span className="text-text-primary font-medium block">
                                                    {customer.name ?? '-'}
                                                </span>
                                                <span className="text-text-secondary text-sm block">
                                                    {[
                                                        customer?.email,
                                                        `${customer?.country_code ?? ''} ${formatMobileNumber(customer?.phone_number ?? '')}`.trim(),
                                                    ]
                                                        .filter(Boolean)
                                                        .join(' · ')}
                                                    {!customer?.email && !customer?.phone_number && '-'}
                                                </span>
                                                {manualLabelText ? (
                                                    <span className="text-red-500 text-sm font-medium mt-0.5">
                                                        {manualLabelText}
                                                    </span>
                                                ) : null}
                                            </div>
                                        </RadixCard>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>
            </RadixDialog>
        </React.Fragment>
    );
}
