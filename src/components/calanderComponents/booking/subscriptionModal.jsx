import { Box, Chip, Stack, Typography, useMediaQuery } from '@mui/material';
import FCommonTable from '../../commonComponents/F_commonTable';
import { useTheme } from '@emotion/react';
import { t } from 'i18next';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useEffect, useState } from 'react';
import { api } from '../../../utils/Api/POS';
import FCommonMenu from '../../commonComponents/F_Menu';
import { useLocation } from 'react-router-dom';
import { Edit } from '@mui/icons-material';
import deleteIcon from '../../../assets/Delete.svg';
import CustomDeleteModal from '../../deleteAlertModal';
import { toast } from 'react-toastify';
import moment from 'moment';
import SubscriptionEditModal from './subscriptionEditModal';
import Permission from '@/utils/POS/Permission';
const statusColors = {
    COMPLETED: 'success',
    ACTIVE: 'primary',
    CANCELLED: 'error',
};

const SubscriptionModal = ({ outletCustomerId }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [loading, setLoading] = useState(false);
    const location = useLocation();
    const [data, setData] = useState([]);
    const [openDeleteModel, setOpenDeleteModel] = useState(false);
    const [openEditModel, setOpenEditModel] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [expandedRow, setExpandedRow] = useState(null);

    const { isAllowed } = Permission();
    const haveReadInvoicePermission = isAllowed('Invoice', 'read');

    const toggleExpand = (index) => {
        setExpandedRow((prev) => (prev === index ? null : index));
    };

    const columns = [
        { id: 'serviceName', label: `${t('Calendar.ServiceName')}`, sortable: false },
        { id: 'totalCredit', label: `${t('Calendar.SubscriptionCount')}`, sortable: false },
        { id: 'usedCredit', label: `${t('Calendar.SubscriptionUsed')}`, sortable: false },
        { id: 'SubscriptionStartDate', label: `${t('Calendar.SubscriptionStartDate')}`, sortable: false },
        { id: 'SubscriptionStatus', label: `${t('Calendar.SubscriptionStatus')}`, sortable: false },
        { id: 'otherRow', label: '', sortable: false },
    ];

    const expandColumn = [
        { id: 'date', label: t('Common.Date') },
        { id: 'salesId', label: t('Report.SalesId') },
        { id: 'bookingId', label: t('Calendar.BookingId') },
    ];

    const parentData = data.map((item) => ({
        serviceName: item.subscription.serviceName,
        totalCredit: item.subscription.subscriptionCredit,
        usedCredit: item.subscription.subscriptionCreditUsed,
        SubscriptionStartDate: moment(item.subscription.subscriptionStartDate).format('DD/MM-YY HH:mm'),
        SubscriptionStatus: (
            <Chip
                label={item.subscription.subscriptionStatus}
                color={statusColors[item.subscription.subscriptionStatus] || 'default'}
                variant="outlined"
            />
        ),
        otherRow: (
            <Stack sx={{ display: 'flex', alignItems: 'center', flexDirection: 'row', gap: 3 }}>
                <KeyboardArrowDownIcon style={{ cursor: 'pointer' }} />
                <FCommonMenu
                    menuSx={{
                        display: location.pathname.startsWith('/calendar') ? 'none' : 'block',
                    }}
                    items={[
                        {
                            icon: <Edit fontSize="small" />,
                            label: 'Edit',
                            onClick: () => {
                                setSelectedService(item);
                                setOpenEditModel(true);
                            },
                        },
                        {
                            icon: <img src={deleteIcon} alt="delete_icon" />,
                            label: 'Delete',
                            onClick: () => {
                                setOpenDeleteModel(true);
                                setSelectedService(item);
                            },
                        },
                    ]}
                />
            </Stack>
        ),
    }));

    const expandedData = data.map((item) =>
        item.transactions?.map((transaction) => ({
            date: moment(transaction?.createdAt).format('DD/MM-YYYY HH:mm'),
            salesId: (
                <Typography
                    sx={
                        haveReadInvoicePermission && {
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            color: '#1976d2',
                            fontWeight: 'bold',
                        }
                    }
                    onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        if (haveReadInvoicePermission) {
                            window.open(
                                `${process.env.REACT_APP_URL2}/api/invoice/${transaction?.salesId}/pdf`,
                                '_blank',
                            );
                        }
                    }}
                >
                    {transaction?.invoiceNo}
                </Typography>
            ),
            bookingId: transaction?.bookingId,
        })),
    );

    const fetchServiceSubscription = async () => {
        try {
            setLoading(true);

            const response = await api.getApiServiceSubscriptionCustomer({
                outletCustomerId,
            });

            setData(response?.data ?? []);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteService = async (item) => {
        try {
            setLoading(true);
            await api.deleteApiServiceSubscriptionId(item?.subscription?.id);
            fetchServiceSubscription();

            toast.success(t('Calendar.SubscriptionDeleteSucc'));
            setOpenDeleteModel(false);
        } catch (error) {
            console.error('Error : ', error);
            toast.error(t('Calendar.SubscriptionDeleteFailed'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServiceSubscription();
    }, [outletCustomerId]);

    return (
        <Box sx={{ px: 1, pb: 3, height: '550px' }}>
            <FCommonTable
                visibleColumns={
                    isMobile
                        ? ['serviceName', 'totalCredit', 'usedCredit']
                        : [
                              'serviceName',
                              'totalCredit',
                              'usedCredit',
                              'SubscriptionStartDate',
                              'SubscriptionStatus',
                              'otherRow',
                          ]
                }
                columns={columns}
                expandTableTitle={t('Calendar.UsageHistory')}
                data={parentData}
                isExpandable
                expandColumn={expandColumn}
                expandData={expandedData}
                expandedRow={expandedRow}
                loading={loading}
                onExpandRowClick={toggleExpand}
            />

            {openDeleteModel && (
                <CustomDeleteModal
                    title={t('Common.Delete')}
                    description={t('Calendar.SubscriptionDeleteDescription', {
                        name: selectedService?.subscription?.serviceName,
                    })}
                    loading={loading}
                    open={openDeleteModel}
                    onClickConfirm={() => handleDeleteService(selectedService)}
                    onClickDismiss={() => setOpenDeleteModel(false)}
                    handleClose={() => setOpenDeleteModel(false)}
                />
            )}

            {openEditModel && (
                <SubscriptionEditModal
                    openEditModel={openEditModel}
                    setOpenEditModel={setOpenEditModel}
                    selectedService={selectedService}
                    fetchServiceSubscription={fetchServiceSubscription}
                />
            )}
        </Box>
    );
};

export default SubscriptionModal;
