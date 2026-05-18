import { ColumnType, POSTable, RowType } from '@/components/POS/Common';
import POSButton from '@/components/POS/Common/POSButton';
import POSDeleteModal from '@/components/POS/Common/POSDeleteModal';
import POSHeading from '@/components/POS/Common/POSHeading';
import POSMenu from '@/components/POS/Common/POSMenu';
import POSSwitch from '@/components/POS/Common/POSSwitch';
import { PosSettingsApi } from '@/scenes/POS/UI/Pos-settings/Core/pos-settings.api';
import { PosSetting } from '@/scenes/POS/UI/Pos-settings/Types/pos-settings.types';
import { GetApiGiftCardsOnlineType200ItemsItem } from '@/shared/api/models';
import { api } from '@/utils/Api/POS';
import { Edit } from '@mui/icons-material';
import { Box, Stack, Typography } from '@mui/material';
import { t } from 'i18next';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
// @ts-expect-error: JS module, no types
import { useData } from '@/context/DataContext';
const DeleteIcon = require('@/assets/Delete.svg').default;

const OnlineGiftCards = () => {
    const navigate = useNavigate();
    const [isLoading, setLoading] = useState(false);
    const [giftCardData, setGiftCardData] = useState<GetApiGiftCardsOnlineType200ItemsItem[]>([]);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [selectedOnlineGiftCard, setSelectedOnlineGiftCard] = useState<
        GetApiGiftCardsOnlineType200ItemsItem | null | string
    >(null);
    const settingFromStore = useSelector((state: any) => state?.settings?.data);
    const [sellOnlineGiftCard, setSellOnlineGiftCard] = useState(
        settingFromStore?.posSetting?.value?.sell_online_gift_card,
    );
    const [openGiftCardModal, setOpenGiftCardModal] = useState(false);
    const posSettingsApi = new PosSettingsApi();
    const { refreshSettings } = useData();

    const sellOnlineGiftCardApiCall = async (newValue: boolean) => {
        setLoading(true);

        const updatedValue = {
            ...settingFromStore?.posSetting?.value,
            sell_online_gift_card: newValue,
        };

        try {
            const payload = {
                settings: [
                    {
                        settingCategory: 'pos_settings',
                        settingName: 'pos_general_settings',
                        value: JSON.stringify(updatedValue),
                        type: 'JSON',
                    },
                ],
            };

            const response = await posSettingsApi.updatePosSetting(payload as unknown as PosSetting);

            if (response) {
                toast.success(t('GiftCard.ToastUpdateSettings'));
                await refreshSettings();
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error(t('POS.ToastErrSettingsUp'));
        } finally {
            setLoading(false);
        }
    };

    const handleToggleGiftCard = async (value: boolean) => {
        if (value === false) {
            setOpenGiftCardModal(true);
        } else {
            setSellOnlineGiftCard(true);
            await sellOnlineGiftCardApiCall(true);
        }
    };

    const renderAction = (row: RowType) => {
        const actionColumns = [];

        actionColumns.push({
            label: 'Edit',
            icon: <Edit fontSize="small" />,
            onClick: () => {
                navigate(`/gift-card/online/${row.id}`);
            },
        });

        actionColumns.push({
            label: 'Delete',
            icon: <img src={DeleteIcon} alt="delete" />,
            onClick: () => {
                setSelectedOnlineGiftCard(row?.id as string);
                setShowDeleteConfirmation(true);
            },
        });

        return actionColumns;
    };

    const handleDelete = async (row: any) => {
        try {
            await api.deleteApiGiftCardsOnlineId(row?.id as string);
            toast.success(t('GiftCard.OnlineGiftCardDeleteSuccess'));
            fetchData();
            setShowDeleteConfirmation(false);
        } catch (error) {
            console.error('Error : ', error);
        }
    };

    function getExpiryLabel(obj: RowType) {
        if (!obj?.createdAt || !obj?.expiryDays) return t('giftCard.InvalidData');
        const createdAt = moment(obj.createdAt).startOf('day');
        const expiryDate = createdAt.clone().add(obj.expiryDays, 'days').startOf('day');
        const today = moment().startOf('day');

        const remainingDays = expiryDate.diff(today, 'days');

        if (remainingDays <= 0) return t('PunchCard.Expired');

        const months = Math.floor(remainingDays / 30);
        const days = remainingDays % 30;

        if (days === 0) return `${months} month${months > 1 ? 's' : ''}`;
        if (months === 0) return `${days} days`;
        return `${months} month${months > 1 ? 's' : ''} ${days} days`;
    }

    const columns: ColumnType[] = [
        {
            id: 'name',
            name: t('Common.Name'),
            selector: (row: RowType) => row.name,
            sortable: false,
        },
        {
            id: 'expiryDays',
            name: t('GiftCard.Expire'),
            selector: (row: RowType) => getExpiryLabel(row),
            sortable: false,
        },
        {
            id: 'description',
            name: t('Calendar.Description'),
            selector: (row: RowType) => row.description,
            sortable: false,
        },
        {
            id: 'sellOnline',
            name: t('PunchCard.SellOnline'),
            selector: (row: RowType) =>
                row.sellOnline === true ? t('Customer.ButtonTitleYes') : t('Customer.ButtonTitleNo'),
        },
        {
            id: 'action',
            name: '',
            selector: (row: RowType) => (
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <POSMenu menuSx={{ borderRadius: 2 }} stopPropagation items={renderAction(row)} />
                </Box>
            ),
            sortable: false,
        },
    ];

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await api.getApiGiftCardsOnlineType('json');
            setGiftCardData(response?.items as GetApiGiftCardsOnlineType200ItemsItem[]);
        } catch (error) {
            console.error('Error : ', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <Stack gap={2}>
            <Stack
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    justifyContent: { md: 'space-between' },
                    alignItems: { md: 'center' },
                    pb: 2,
                }}
            >
                <POSHeading text={t('GiftCard.OnlineGiftCard')} />
                <Stack sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                    <Stack
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            ml: { xs: '0', md: 'auto' },
                            justifyContent: 'center',
                            mb: { xs: 0, md: 2 },
                        }}
                    >
                        <Typography>{t('GiftCard.SellOnlineGiftCard')}</Typography>

                        <POSSwitch
                            sx={{ ml: { xs: 0, md: 'auto' } }}
                            checked={sellOnlineGiftCard}
                            onChange={(e, check) => handleToggleGiftCard(check)}
                        />
                    </Stack>

                    <POSButton
                        variant="save"
                        title={`+ ${t('GiftCard.CreateOnlineGiftCard')}`}
                        width={{ xs: '100%', md: 'fit-content' }}
                        onClick={() => navigate('create')}
                    />
                </Stack>
            </Stack>

            <POSTable data={giftCardData} columns={columns} loading={isLoading} />

            {/* Delete Online Gift Card Modal */}
            {showDeleteConfirmation && (
                <POSDeleteModal
                    open={showDeleteConfirmation}
                    handleClose={() => setShowDeleteConfirmation(false)}
                    title={t('GiftCard.OnlineGiftCardDelteTitle')}
                    description={t('GiftCard.OnlineGiftCardDeleteDescription')}
                    onClickConfirm={() => {
                        if (selectedOnlineGiftCard) {
                            handleDelete({
                                id: selectedOnlineGiftCard,
                            });
                        } else {
                            toast(t('GiftCard.OnlineGiftCardDeleteFailed'));
                        }
                    }}
                    onClickDismiss={() => setShowDeleteConfirmation(false)}
                />
            )}

            {/* Disable Selling Online Gift Card Modal */}
            {openGiftCardModal && (
                <POSDeleteModal
                    open={openGiftCardModal}
                    handleClose={() => {
                        setOpenGiftCardModal(false);
                        setSellOnlineGiftCard(true);
                    }}
                    title={t('GiftCard.OnlineGiftCard')}
                    description={t('GiftCard.SellOnlineGiftCardDescription')}
                    onClickConfirm={async () => {
                        await sellOnlineGiftCardApiCall(false);
                        setSellOnlineGiftCard(false);
                        setOpenGiftCardModal(false);
                    }}
                    onClickDismiss={() => {
                        setOpenGiftCardModal(false);
                        setSellOnlineGiftCard(true);
                    }}
                />
            )}
        </Stack>
    );
};

export default OnlineGiftCards;
