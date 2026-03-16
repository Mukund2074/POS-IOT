import POSButton from '@/components/POS/Common/POSButton';
import POSHeading from '@/components/POS/Common/POSHeading';
import POSSelect from '@/components/POS/Common/POSSelect';
import { Stack, SelectChangeEvent, Typography, CircularProgress } from '@mui/material';
import { t } from 'i18next';

import React from 'react';
import { FileDownload } from '@mui/icons-material';
import moment, { Moment } from 'moment';
import { DateValidationError } from '@mui/x-date-pickers/models';
import { PickerChangeHandlerContext } from '@mui/x-date-pickers/models';
import { POSDateRangePicker } from '@/components/POS/Common/POSDateRangePicker';

const statusOptions = [
    { value: 'ALL', label: t('Common.All') },
    { value: 'NOSHOW', label: t('Statistics.NoShow') },
];

const createdByOptions = [
    { value: 'ALL', label: t('Statistics.All') },
    { value: 'STOREAPP', label: t('Statistics.Employee') },
    { value: 'DIRECTWEBSTORE', label: t('Statistics.Customer') },
];

interface StatisticsHeaderProps {
    startDate: Moment | null;
    endDate: Moment | null;
    selectedGrouping?: string | undefined;
    selectedStatus?: string | undefined;
    selectedService?: number | null;
    selectedCreatedBy?: string | undefined;
    services?: Array<{ value: string; label: string }>;
    onStartDateChange?: (date: Moment | null, context: PickerChangeHandlerContext<DateValidationError>) => void;
    onEndDateChange?: (date: Moment | null, context: PickerChangeHandlerContext<DateValidationError>) => void;
    onGroupingChange?: (event: SelectChangeEvent<string | number | (string | number)[] | null>) => void;
    onStatusChange?: (event: SelectChangeEvent<string | number | (string | number)[] | null>) => void;
    onServiceChange?: (event: SelectChangeEvent<string | number | (string | number)[] | null>) => void;
    onCreatedByChange?: (event: SelectChangeEvent<string | number | (string | number)[] | null>) => void;
    onExportCSV?: () => void;
    exportButton?: boolean;
    label?: string | undefined;
    loadingButton?: boolean;
    groupingOptions?: Array<{ value: string; label: string }>;
}

const StatisticsHeader = ({
    startDate,
    endDate,
    selectedGrouping,
    selectedStatus,
    selectedService,
    selectedCreatedBy,
    services,
    onStartDateChange,
    onEndDateChange,
    onGroupingChange,
    onStatusChange,
    onServiceChange,
    onCreatedByChange,
    onExportCSV,
    exportButton = true,
    label,
    loadingButton,
    groupingOptions,
}: StatisticsHeaderProps) => {
    const renderBtnText = () => {
        if (loadingButton) {
            return (
                <Stack
                    sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1,
                    }}
                >
                    <CircularProgress size={20} sx={{ color: 'inherit' }} />
                    <Typography variant={'h6'} sx={{ fontSize: 16, fontWeight: 700 }}>
                        {t('Setting.Exporting')}
                    </Typography>
                </Stack>
            );
        }
        return (
            <Stack direction="row" spacing={1} alignItems="center">
                <FileDownload />
                {t('Statistics.ExportCSV')}
            </Stack>
        );
    };

    return (
        <Stack spacing={2}>
            {/* Header Title */}
            <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ pt: { xs: 4, sm: 2 } }}
                flexWrap={'wrap'}
            >
                <POSHeading
                    sx={{ whiteSpace: 'nowrap' }}
                    text={label ?? `${t('Statistics.Appointments')}: ${t('Statistics.AppointmentsList')}`}
                />
                {exportButton && (
                    <POSButton
                        title={renderBtnText()}
                        disabled={loadingButton}
                        // loading={loadingButton}
                        variant="save"
                        width={{ xs: '100%', sm: '200px' }}
                        onClick={onExportCSV}
                        sx={{ borderRadius: 50, py: 1, mt: { xs: 2, mb: 0 } }}
                    />
                )}
            </Stack>

            <Stack
                direction={'row'}
                flex={1}
                sx={{ mt: { xs: 0, mb: 0 }, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}
                // spacing={1}
                alignItems={'center'}
                // alignItems={{ xs: 'stretch', md: 'flex-end' }}
                justifyContent={'flex-end'}
                gap={1}
                // sx={{ flexWrap: 'wrap' }}
            >
                {selectedService !== undefined && (
                    <POSSelect
                        id="service-select"
                        backgroundColor="#fff"
                        isMultiSelect={false}
                        value={selectedService}
                        onChange={onServiceChange || (() => {})}
                        placeholderText={t('Statistics.SelectService')}
                        options={services ?? []}
                        borderRadius={50}
                        padding={1}
                        wrapperSx={{ width: 'fit-content', minWidth: '200px' }}
                    />
                )}
                {selectedGrouping && (
                    <POSSelect
                        id="grouping-select"
                        backgroundColor="#fff"
                        isMultiSelect={false}
                        value={selectedGrouping}
                        onChange={onGroupingChange || (() => {})}
                        placeholderText={t('Statistics.SelectGrouping')}
                        options={groupingOptions ?? []}
                        borderRadius={50}
                        padding={1}
                        wrapperSx={{ width: 'fit-content', minWidth: '150px' }}
                    />
                )}

                {selectedStatus && (
                    <POSSelect
                        id="status-select"
                        backgroundColor="#fff"
                        isMultiSelect={false}
                        value={selectedStatus}
                        onChange={onStatusChange || (() => {})}
                        placeholderText={t('Statistics.SelectStatus')}
                        options={statusOptions}
                        borderRadius={50}
                        padding={1}
                        wrapperSx={{ width: 'fit-content', minWidth: '200px' }}
                    />
                )}

                {selectedCreatedBy && (
                    <POSSelect
                        id="created-by-select"
                        backgroundColor="#fff"
                        isMultiSelect={false}
                        value={selectedCreatedBy}
                        onChange={onCreatedByChange || (() => {})}
                        placeholderText={t('Statistics.CreatedBy')}
                        options={createdByOptions}
                        borderRadius={50}
                        padding={1}
                        wrapperSx={{ width: 'fit-content', minWidth: '200px' }}
                    />
                )}
                <Stack sx={{ width: { xs: '100%', sm: 'auto' } }}>
                    <POSDateRangePicker
                        disableMonths={1200}
                        startdate={
                            startDate
                                ? startDate.format('YYYY-MM-DD')
                                : moment().subtract(1, 'month').format('YYYY-MM-DD')
                        }
                        endDate={endDate ? endDate.format('YYYY-MM-DD') : moment().format('YYYY-MM-DD')}
                        setStartDate={(date) => onStartDateChange?.(date, { validationError: null })}
                        setEndDate={(date) => onEndDateChange?.(date, { validationError: null })}
                    />
                </Stack>
            </Stack>
        </Stack>
    );
};

export default StatisticsHeader;
