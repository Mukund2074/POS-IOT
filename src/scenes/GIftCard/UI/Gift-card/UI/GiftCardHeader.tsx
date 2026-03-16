import POSButton from '@/components/POS/Common/POSButton';
import POSHeading from '@/components/POS/Common/POSHeading';
import POSInput from '@/components/POS/Common/POSInput';
import POSSelect from '@/components/POS/Common/POSSelect';
import { Stack } from '@mui/material';
import { t } from 'i18next';
import { GiftCardHeaderProps } from '../Types/GiftCard.types';
import { useNavigate } from 'react-router-dom';
import Permission from '@/utils/POS/Permission';
import React, { useState } from 'react';
import { Print } from '@mui/icons-material';
import ExportGiftCard from '../../shared/Modals/ExportGiftCard';

const giftCardObjectForSelection = [
    { value: 'ALL', label: 'All gift cards' },
    { value: 'UNUSED', label: 'Not used gift cards' },
    { value: 'USED', label: 'Used gift cards' },
    { value: 'PURCHASED_ONLINE', label: 'Online purchased gift cards' },
];

const GiftCardHeader = ({
    handleSelectGiftCard,
    selectedGiftCard,
    handleSearchChange,
    searchTerm,
    setSelectedSources,
    selectedSources,
}: GiftCardHeaderProps) => {
    const [exportModal, setExportModal] = useState(false);
    const navigate = useNavigate();
    const { isAllowed } = Permission();
    const sources = [
        { label: 'All', value: 'ALL' },
        { label: 'Manuel', value: 'MANUAL' },
        { label: 'Online', value: 'ONLINE' },
    ];
    return (
        <Stack>
            <Stack
                sx={{
                    display: {xs : 'block', sm : 'flex'},
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2,
                    py: 2,
                }}
            >
                {/* Left: Heading */}
                <POSHeading sx={{ whiteSpace: 'nowrap' }} text={t('GiftCard.GiftCards')} />

                {/* Right: Controls */}
                <Stack
                    sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', gap: 2 }}
                >
                    {isAllowed('GiftCard', 'read') && (
                        <React.Fragment>
                            <POSInput
                                bgColor="#fff"
                                borderRadius={50}
                                mt={0}
                                sx={{
                                    width: { xs: '100%', md: 'auto' },
                                    minWidth: '200px',
                                    px: 1,
                                    mb: { xs: 2, md: 0 },
                                }}
                                placeholder={`${t('Common.Search')}...`}
                                onChange={handleSearchChange}
                                value={searchTerm}
                            />
                            <POSSelect
                                id="gift-card-select"
                                backgroundColor="#fff"
                                isMultiSelect={false}
                                value={selectedGiftCard}
                                sx={{ width: { xs: '100%', md: 'auto' }, minWidth: '200px' }}
                                onChange={handleSelectGiftCard}
                                placeholderText={t('Common.View') + ': ' + t('GiftCard.AllGiftCards')}
                                selectAllRenderCheckBoxText={t('GiftCard.AllGiftCards')}
                                options={giftCardObjectForSelection.map((item: any) => ({
                                    label: item.label,
                                    value: item.value,
                                }))}
                                borderRadius={50}
                                padding={1}
                            />
                            <POSSelect
                                value={selectedSources}
                                options={sources}
                                onChange={(e) => {
                                    setSelectedSources(e.target.value as string);
                                }}
                                sx={{ background: '#fff', width: { xs: '100%', md: 'auto' }, minWidth: '200px' }}
                            />
                        </React.Fragment>
                    )}
                    {isAllowed('Sales', 'create') && (
                        <POSButton
                            height={40}
                            variant={'save'}
                            title={`+ ${t('GiftCard.SellGiftCard')}`}
                            width={{ xs: '100%', md: 'auto' }}
                            onClick={() => {
                                navigate('/pos/sales?sellGiftCard=true');
                            }}
                            sx={{ borderRadius: 50, py: 1 }}
                        />
                    )}
                </Stack>
            </Stack>

            {isAllowed('GiftCard', 'read') && (
                <POSButton
                    title={
                        <Stack
                            sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 1,
                            }}
                        >
                            <Print />
                            {t('GiftCard.ExportGiftCards')}
                        </Stack>
                    }
                    variant="save"
                    width={{ xs: '100%', md: 'auto' }}
                    sx={{ ml: 'auto', mb: 2 }}
                    onClick={() => {
                        setExportModal(true);
                        // setShowPrintModal(true);
                    }}
                />
            )}

            {exportModal && (
                <ExportGiftCard
                    open={exportModal}
                    onClose={() => setExportModal(false)}
                    giftCardFilters={giftCardObjectForSelection}
                />
            )}
        </Stack>
    );
};

export default GiftCardHeader;
