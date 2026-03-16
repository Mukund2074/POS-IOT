import { Stack } from '@mui/material';
import { useEffect, useState } from 'react';
import FPrimaryHeading from '../../../commonComponents/F_PrimaryHeading';
import { t } from 'i18next';
import FCommonTable from '../../../commonComponents/F_commonTable';
import { useParams } from 'react-router-dom';
import moment from 'moment';
import { ArrowDropDown, ArrowDropUpRounded } from '@mui/icons-material';
import { FaRegFilePdf } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { api } from '../../../../utils/Api/POS';

const HealthDeclationBookingList = () => {
    const params = useParams();
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState(null);

    const columns = [
        { id: 'id', label: `${t('Common.ID')}`, sortable: false },
        { id: 'booking_status', label: `${t('POS.Status')}`, sortable: false },
        { id: 'reviewed_by', label: `${t('Customer.ReviewdBy')}`, sortable: false },
        { id: 'reviewed_at', label: `${t('Customer.ReviewdAt')}`, sortable: false },
        { id: 'resended_by', label: `${t('Customer.ResendBy')}`, sortable: false },
        { id: 'resended_at', label: `${t('Customer.ResendAt')}`, sortable: false },
        { id: 'submitted_at', label: `${t('Customer.SubmittedAt')}`, sortable: false },
        { id: 'drpodown_arrow', label: ``, sortable: false },
        { id: 'pdf_icon', label: ``, sortable: false },
    ];

    const expandedColumns = [
        { id: 'status', label: `${t('POS.Status')}`, sortable: false },
        { id: 'deviceIpAddress', label: `${t('Customer.DeviceIdAddress')}`, sortable: false },
        { id: 'createdAt', label: `${t('Common.createdAt')}`, sortable: false },
    ];

    const [expandedData, setExpandedData] = useState(null);
    const [expandedRowIndex, setExpandedRowIndex] = useState(null);

    const checkNull = (items) => {
        return items.map((item) => {
            const updatedItem = {};

            Object.keys(item).forEach((key) => {
                updatedItem[key] = item[key] === null ? '-' : item[key];
            });

            // update or add a field
            updatedItem.createdAt = moment(item?.createdAt).format('DD/MM-YYYY HH:mm');

            return updatedItem;
        });
    };

    const printPdf = async (id) => {
        try {
            const url = `${process.env.REACT_APP_URL2}/api/health-declaration-print/${id}/pdf`;
            window.open(url, '_blank');
        } catch (error) {
            console.error('Error : ', error);
            toast.error(t('Customer.PDFError'));
        }
    };

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const response = await api.getApiHealthDeclarations({
                outletCustomerId: params?.id,
                includeLogs: true,
            });

            if (response) {
                const normalizedData = response?.data?.items?.map((item) => ({
                    id: item?.id,
                    booking_status: item?.status || '-',
                    reviewed_by: item?.reviewedBy?.employeeName || '-',
                    reviewed_at: item?.reviewedAt ? moment(item?.reviewedAt).format('DD/MM-YYYY HH:mm') : '-',
                    resended_at: item?.resendAt ? moment(item?.resendAt).format('DD/MM-YYYY HH:mm') : '-',
                    resended_by: item?.resendBy?.employeeName || '-',
                    submitted_at: item?.submittedAt ? moment(item?.submittedAt).format('DD/MM-YYYY HH:mm') : '-',
                    drpodown_arrow: <ArrowDropDown />,
                    pdf_icon: <FaRegFilePdf style={{ cursor: 'pointer' }} onClick={() => printPdf(item?.id)} />,
                }));
                setData(normalizedData);

                const normalizedExpandedData = response?.data?.items?.map((item) => {
                    // ensure logs is an array
                    return Array.isArray(item?.logs)
                        ? item.logs.map((log) => ({
                              ...log,
                              status: log?.status === 'REMINDER_SENT_CONFLICT' ? 'REMINDER_SENT' : log?.status || '-',
                              createdAt: moment(log?.createdAt).format('DD/MM-YYYY HH:mm'),
                          }))
                        : [];
                });
                setExpandedData(normalizedExpandedData);
            }
        } catch (error) {
            console.error('Error : ', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (!data) return;

        setData((prev) =>
            prev.map((row, index) => ({
                ...row,
                drpodown_arrow: expandedRowIndex === index ? <ArrowDropUpRounded /> : <ArrowDropDown />,
            })),
        );
    }, [expandedRowIndex]);

    return (
        <Stack>
            <FPrimaryHeading sx={{ mt: 4, mb: 2 }} text={t('Customer.HealthDeclarationBooking')} />
            <FCommonTable
                loading={isLoading}
                columns={columns}
                data={data || []}
                visibleColumns={[
                    'booking_status',
                    'reviewed_by',
                    'reviewed_at',
                    'resended_by',
                    'resended_at',
                    'submitted_at',
                    'drpodown_arrow',
                    'pdf_icon',
                ]}
                expandColumn={expandedColumns}
                isExpandable={true}
                expandData={expandedData || []}
                onExpandRowClick={(rowIndex) => {
                    setExpandedRowIndex((prev) => (prev === rowIndex ? null : rowIndex));
                }}
                expandedRow={expandedRowIndex}
                expandColumnWidth={['33.33%', '33.33%', '33.33%']}
                expandTableTitle={t('Customer.Logs')}
            />
        </Stack>
    );
};

export default HealthDeclationBookingList;
