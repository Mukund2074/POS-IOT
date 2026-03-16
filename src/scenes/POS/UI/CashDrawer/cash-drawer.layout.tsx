import { Box, CircularProgress, Stack } from '@mui/material';
import CashDrawerHeader from './components/CashDrawerHeader';
import CashReconcilationBody from './components/CashReconcilation/CashReconcilationBody';
import CashDrawerBankTransferForm from './components/BankTransferForm/CashDrawerBankTransferForm';
import CashDrawerFooter from './components/BankTransferForm/CashDrawerFooter';
import React, { useEffect, useState, useRef } from 'react';
import ConfirmCashDrawerModal from './components/Modals/ConfirmCashDrawerModal';
import { GetApiCashDrawerEmployeeSummary200Data, PostApiCashDrawerCloseBody } from '@/shared/api/models';
import { useFormik } from 'formik';
import { t } from 'i18next';
import StartDrawer from './shared/StartDrawer';
import { useCreateCashDrawer } from '@/hooks/api/pos/cashDrawer';
import { toast } from 'react-toastify';
import moment from 'moment';
import { PostCashDrawerClose } from '@/utils/Api/POS/CashDrawer';
import { useSalesList } from '@/hooks/index';
import { CashDrawerData, CashFormType } from './Types/cash-drawer.types';
import { CashDrawerUtils } from './Core/cash-drawer.utils';
import ListByPaymentType from './components/Modals/ListByPaymentType';
import { useSelector } from 'react-redux';

import VoteForNextDateModal from './components/Modals/VoteForNextDateModal';
// @ts-ignore
import { generateTimeSlots } from '@/components/calanderComponents/booking/utils/functions';
import { api } from '@/utils/Api/POS';
import Permission from '@/utils/POS/Permission';

// const validationSchema = Yup.object().shape({
//     outletId: Yup.number().required(),
//     cashDrawerId: Yup.string().required(),
//     fromDate: Yup.string().required(),
//     toDate: Yup.string().required(),
//     totalSales: Yup.number().min(0).required(),
//     totalTenderAmount: Yup.number().min(0).required(),
//     openingCash: Yup.number().min(0).required(),
//     closingCash: Yup.number().min(0).required(),
//     lastCashDrawerEndDate: Yup.string().nullable(),
//     drawerName: Yup.string(),
//     drawerStatus: Yup.string(),
//     drawerStartDate: Yup.string(),
//     drawerEndDate: Yup.string(),
//     salesDetails: Yup.array().of(Yup.object()),
//     paymentBreakdown: Yup.object().shape({
//         cashAmount: Yup.number().min(0).required(),
//         cardAmount: Yup.number().min(0).required(),
//         mobilePayAmount: Yup.number().min(0).required(),
//         bankTransferAmount: Yup.number().min(0).required(),
//         giftCardAmount: Yup.number().min(0).required(),
//         creditAmount: Yup.number().min(0).required(),
//         otherAmount: Yup.number().min(0).required(),
//         outlayAmount: Yup.number().min(0).required(),
//         outstandingAmount: Yup.number().min(0).required(),
//     }),
//     salesBreakdown: Yup.object().shape({
//         productSale: Yup.number().min(0).required(),
//         serviceSale: Yup.number().min(0).required(),
//         giftCardSale: Yup.number().min(0).required(),
//         cutCardSale: Yup.number().min(0).required(),
//         productSaleNonTaxable: Yup.number().min(0).required(),
//         productSaleTaxable: Yup.number().min(0).required(),
//         serviceSaleNonTaxable: Yup.number().min(0).required(),
//         serviceSaleTaxable: Yup.number().min(0).required(),
//     }),
//     creditBreakdown: Yup.object().shape({
//         cardCredit: Yup.number().min(0).required(),
//         cashCredit: Yup.number().min(0).required(),
//         bankTransferCredit: Yup.number().min(0).required(),
//         mobilePayCredit: Yup.number().min(0).required(),
//     }),
//     bankTransformForm: Yup.array().of(
//         Yup.object().shape({
//             key: Yup.number().required(),
//             label: Yup.string().required(),
//             val: Yup.number().required(),
//         }),
//     ),
//     CashDifferenceForm: Yup.array().of(
//         Yup.object().shape({
//             key: Yup.number().required(),
//             label: Yup.string().required(),
//             val: Yup.number().required(),
//         }),
//     ),
//     transferToBank: Yup.number()
//         .min(0, t('POS.TransferToBankMinError'))
//         .test('max-transfer', t('POS.TransferToBankError'), function (value) {
//             const { bankTransferTotal = 0 } = this.parent;
//             if (value === undefined || value === null) return true; // allow empty, required will catch
//             return value <= bankTransferTotal;
//         })
//         .required(t('POS.TransferToBankRequired')),
//     addNoteToVoteCheck: Yup.boolean(),
//     addNoteToVote: Yup.string(),
//     cardDifference: Yup.number(),
//     bankDifference: Yup.number(),
//     bankTransferTotal: Yup.number(),
//     remainingCashForNextDay: Yup.number(),
//     selectedEmployee: Yup.number(),
// });

const CashDrawerLayout = () => {
    const { isAllowed } = Permission();
    const employeeId = localStorage.getItem('employee_id');
    const setting = useSelector((state: any) => state?.settings?.data);
    const [voteForSecondTerm, setVoteForSecondTerm] = useState(false);
    const employee = setting?.employees || [];
    const { mutate: createCashDrawer } = useCreateCashDrawer();
    const [openSaleDetails, setOpenSaleDetails] = useState(false);
    const [modalName, setModalName] = useState('');
    const printRef = useRef<HTMLDivElement>(null);
    const storeName = setting?.profile?.name || '';

    const params = {
        page: 1,
        limit: 100,
    };
    const { refetch: refetchSales } = useSalesList({ params });
    const timeSlots = generateTimeSlots();
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>(timeSlots[timeSlots.length - 1].split(' - ')[0]);
    const [isChanged, setIsChanged] = useState(false);
    const [cashDrawerData, setCashDrawerData] = useState<GetApiCashDrawerEmployeeSummary200Data | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        refetchSales();
    }, []);

    const [data, setData] = useState<CashDrawerData>({
        outletId: 0,
        cashDrawerId: '',
        fromDate: '',
        toDate: new Date().toISOString(),
        totalSales: 0,
        totalTenderAmount: 0,
        openingCash: 0,
        closingCash: 0,
        lastCashDrawerEndDate: '',
        drawerName: '',
        drawerStatus: '',
        drawerStartDate: '',
        drawerEndDate: new Date().toISOString(),
        detailedPaymentBreakdown: [],
        paymentBreakdown: {
            cashAmount: 0,
            cardAmount: 0,
            mobilePayAmount: 0,
            bankTransferAmount: 0,
            giftCardAmount: 0,
            creditAmount: 0,
            otherAmount: 0,
            outlayAmount: 0,
            outstandingAmount: 0,
        },
        salesBreakdown: {
            productSale: 0,
            serviceSale: 0,
            giftCardSale: 0,
            cutCardSale: 0,
            punchSaleTaxable: 0,
            punchSaleNonTaxable: 0,
            giftCardSaleTaxable: 0,
            giftCardSaleNonTaxable: 0,
            productSaleNonTaxable: 0,
            productSaleTaxable: 0,
            serviceSaleNonTaxable: 0,
            serviceSaleTaxable: 0,
        },
        creditBreakdown: {
            cardCredit: 0,
            cashCredit: 0,
            bankTransferCredit: 0,
            mobilePayCredit: 0,
        },
        bankTransformForm: [
            { key: 0, label: '50 Ear', val: 0 },
            { key: 1, label: '1 kr', val: 0 },
            { key: 2, label: '2 kr', val: 0 },
            { key: 3, label: '5 kr', val: 0 },
            { key: 4, label: '10 kr', val: 0 },
            { key: 5, label: '20 kr', val: 0 },
            { key: 6, label: '50 kr', val: 0 },
            { key: 7, label: '100 kr', val: 0 },
            { key: 8, label: '200 kr', val: 0 },
            { key: 9, label: '500 kr', val: 0 },
            { key: 10, label: '1000 kr', val: 0 },
        ],
        CashDifferenceForm: [
            { key: 11, label: t('POS.CashDrawerVisa'), val: 0 },
            { key: 12, label: t('POS.CashDrawerMastercard'), val: 0 },
            { key: 13, label: t('POS.CashDrawerForbrugsforeningen'), val: 0 },
            { key: 14, label: t('POS.CashDrawerFee'), val: 0 },
        ],
        transferToBank: 0,
        addNoteToVoteCheck: false,
        addNoteToVote: '',
        cardDifference: 0,
        bankDifference: 0,
        bankTransferTotal: 0,
        remainingCashForNextDay: 0,
        selectedEmployee: Number(localStorage.getItem('employee_id')) || -1,
    });

    const [open, setOpen] = useState(false);

    const formik = useFormik({
        initialValues: data,
        // validationSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            const modifiedData: PostApiCashDrawerCloseBody = {
                closeDate: values.drawerEndDate === values.toDate ? new Date().toISOString() : EndDate,
                closingCash: values.remainingCashForNextDay,
                currencyBreakdown: values.bankTransformForm.map((item: CashFormType) => {
                    return {
                        [item.label]: item.val,
                    };
                }),
                cardBreakdown: values.CashDifferenceForm.map((item: CashFormType) => {
                    return { [item.label]: item.val };
                }),
                salesBreakdown: [
                    {
                        productSale: values.salesBreakdown.productSale ?? 0,
                        serviceSale: values.salesBreakdown.serviceSale ?? 0,
                        giftCardSale: values.salesBreakdown.giftCardSale ?? 0,
                        cutCardSale: values.salesBreakdown.cutCardSale ?? 0,
                        productSaleTaxable: values.salesBreakdown.productSaleTaxable ?? 0,
                        productSaleNonTaxable: values.salesBreakdown.productSaleNonTaxable ?? 0,
                        serviceSaleTaxable: values.salesBreakdown.serviceSaleTaxable ?? 0,
                        serviceSaleNonTaxable: values.salesBreakdown.serviceSaleNonTaxable ?? 0,
                    },
                ],
                transferToBank: values.transferToBank,
                closedBy: values.selectedEmployee,
                difference: values.bankDifference,
                totalInDrawer: values.bankTransferTotal,
                actualCash: values.remainingCashForNextDay,
                cardDifference: values.cardDifference,
                paymentBreakdown: values.paymentBreakdown,
                cashDrawerId: values.cashDrawerId ?? '',
                note: values.addNoteToVote,
            };

            try {
                const res = await PostCashDrawerClose(modifiedData);
                if (res.data) {
                    toast.success(t('POS.CashDrawerCloseDrawerSuccess'));
                    formik.resetForm();
                    getCashDrawerData();
                    // handlePrint();
                    window.open(
                        `${process.env.REACT_APP_URL2}/api/cash-drawer/${modifiedData?.cashDrawerId}/pdf`,
                        '_blank',
                    );
                    setSelectedTimeSlot(timeSlots[timeSlots.length - 1].split(' - ')[0]);
                }
            } catch (error) {
                console.error('Error closing cash drawer:', error);
                toast.error(t('POS.CashDrawerCloseDrawerError'));
            } finally {
                setOpen(false);
            }
        },
    });
    const formatedEndDate = `${moment(formik.values.drawerEndDate).format('YYYY-MM-DD')}T${selectedTimeSlot}`;
    const IsoEndDate = moment(formatedEndDate, 'YYYY-MM-DDTHH:mm').toISOString();
    const EndDate = isChanged ? IsoEndDate : new Date().toISOString();
    const cashDrawerUtils = new CashDrawerUtils(formik.values);

    const getCashDrawerData = async () => {
        try {
            setIsLoading(true);
            const res = await api.getApiCashDrawerEmployeeSummary({ employeeId: Number(employeeId), toDate: EndDate });
            setCashDrawerData(res.data);
        } catch (error) {
            console.error('Error fetching cash drawer data:', error);
        } finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        cashDrawerUtils.updateCashDrawerData(formik.values);
    }, [formik.values]);

    const handleStartDrawer = (amount: number) => {
        createCashDrawer(
            { employeeId: Number(employeeId), openingCash: amount, drawerName: storeName },
            {
                onSuccess: (data) => {
                    setData((prev) => {
                        return {
                            ...data.data,
                            cashDrawerId: data.data.cashDrawerId ?? '',
                            bankTransformForm: prev.bankTransformForm,
                            CashDifferenceForm: prev.CashDifferenceForm,
                            addNoteToVoteCheck: prev.addNoteToVoteCheck,
                            addNoteToVote: prev.addNoteToVote,
                            transferToBank: prev.transferToBank,
                            cardDifference: prev.cardDifference,
                            bankDifference: prev.bankDifference,
                            bankTransferTotal: prev.bankTransferTotal,
                            remainingCashForNextDay: prev.remainingCashForNextDay,
                            selectedEmployee: prev.selectedEmployee,
                        };
                    });
                    toast.success(t('POS.CashDrawerStartDrawerSuccess'));
                    getCashDrawerData();
                },
                onError: (error) => {
                    console.error('Error creating cash drawer:', error);
                    toast.error(t('POS.CashDrawerStartDrawerError'));
                },
            },
        );
    };

    useEffect(() => {
        if (cashDrawerData) {
            formik.setValues((prev) => {
                const updatedCashDifferenceForm = prev.CashDifferenceForm.map((item, idx) =>
                    idx === 0 ? { ...item, val: cashDrawerData.paymentBreakdown.cardAmount ?? 0 } : item,
                );
                return {
                    ...cashDrawerData,
                    cashDrawerId: cashDrawerData.cashDrawerId ?? '',
                    bankTransformForm: prev.bankTransformForm,
                    CashDifferenceForm: updatedCashDifferenceForm,
                    addNoteToVoteCheck: prev.addNoteToVoteCheck,
                    addNoteToVote: prev.addNoteToVote,
                    transferToBank: prev.transferToBank,
                    cardDifference: prev.cardDifference,
                    bankDifference: prev.bankDifference,
                    bankTransferTotal: prev.bankTransferTotal,
                    remainingCashForNextDay: prev.remainingCashForNextDay,
                    selectedEmployee: prev.selectedEmployee,
                    toDate: prev.toDate,
                    drawerEndDate: prev.drawerEndDate,
                };
            });
        }
    }, [cashDrawerData]);

    useEffect(() => {
        getCashDrawerData();
    }, [formik.values.drawerEndDate, selectedTimeSlot]);

    useEffect(() => {
        // Find values by key instead of array index
        const visaAmount = formik.values.CashDifferenceForm.find((item) => item.key === 11)?.val || 0;
        const mastercardAmount = formik.values.CashDifferenceForm.find((item) => item.key === 12)?.val || 0;
        const forbrugsforeningenAmount = formik.values.CashDifferenceForm.find((item) => item.key === 13)?.val || 0;
        const feeAmount = formik.values.CashDifferenceForm.find((item) => item.key === 14)?.val || 0;

        // Calculate the total entered amount (visa + mastercard + forbrugsforeningen - fees)
        const totalEnteredAmount = visaAmount + mastercardAmount + forbrugsforeningenAmount - feeAmount;

        // Calculate difference: entered amount - actual card payment
        const isDifference = totalEnteredAmount - (formik.values.paymentBreakdown.cardAmount ?? 0);

        formik.setFieldValue('cardDifference', isDifference);
    }, [formik.values.CashDifferenceForm, formik.values.paymentBreakdown.cardAmount]);

    useEffect(() => {
        const Total =
            (formik.values?.paymentBreakdown.cashAmount ?? 0) +
            formik.values?.openingCash -
            (formik.values.creditBreakdown.cashCredit ?? 0) -
            (formik.values.paymentBreakdown.outlayAmount ?? 0) -
            (formik.values.paymentBreakdown.otherAmount ?? 0);

        const totalAmount = formik.values.bankTransformForm.reduce((sum, item) => {
            let multiplier;

            if (item.key === 0) {
                multiplier = 0.5;
            } else {
                multiplier = parseFloat(item.label);
            }

            return sum + item.val * multiplier;
        }, 0);

        const difference = -Total + totalAmount;

        formik.setFieldValue('bankTransferTotal', totalAmount);
        formik.setFieldValue('bankDifference', difference);
    }, [formik.values.bankTransformForm]);

    const handlePaymentClick = ({ name }: { name: string }) => {
        setModalName(name);
        setOpenSaleDetails(true);
    };

    if (isLoading) {
        return (
            <Stack sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100dvh' }}>
                <CircularProgress size={40} sx={{ color: 'inherit' }} />
            </Stack>
        );
    }

    return (
        <Box>
            {/* <button onClick={handlePrint}>Print</button> */}
            {!cashDrawerData?.cashDrawerId && !isLoading ? (
                <StartDrawer onSubmit={(amount) => handleStartDrawer(amount)} />
            ) : (
                <React.Fragment>
                    <Stack className="print-cashdrawer" ref={printRef}>
                        <CashDrawerHeader
                            formik={formik}
                            storeName={storeName}
                            employee={employee}
                            setVoteForSecondTerm={() => setVoteForSecondTerm((prev) => !prev)}
                            // selectedCashDrawerEmployee={selectedCashDrawerEmployee}
                            // setSelectedCashDrawerEmployee={setSelectedCashDrawerEmployee}
                        />
                        <CashReconcilationBody formik={formik} handlePaymentClick={handlePaymentClick} />
                        <CashDrawerBankTransferForm formik={formik} />
                    </Stack>
                    {isAllowed('CashDrawer', 'update') && (
                        <CashDrawerFooter
                            setOpen={setOpen}
                            formik={formik}
                            storeName={storeName}
                            employee={employee}
                            employeeId={Number(employeeId)}
                        />
                    )}
                </React.Fragment>
            )}

            {open && (
                <ConfirmCashDrawerModal
                    open={open}
                    onClose={() => setOpen(false)}
                    onApprove={formik.handleSubmit}
                    formik={formik}
                    period={
                        moment(formik.values.fromDate).format('DD/MM-YYYY') +
                        ' - ' +
                        moment(formik.values.drawerEndDate).format('DD/MM-YYYY')
                    }
                    storeName={storeName}
                    selectedEmployee={
                        employee?.find((emp: { id: number }) => emp.id === formik.values.selectedEmployee)?.name || ''
                    }
                />
            )}

            {openSaleDetails && (
                <ListByPaymentType
                    openSaleDetails={openSaleDetails}
                    setOpenSaleDetails={setOpenSaleDetails}
                    modalName={modalName}
                    cashDrawerUtils={cashDrawerUtils}
                />
            )}

            {voteForSecondTerm && (
                <VoteForNextDateModal
                    open={voteForSecondTerm}
                    onClose={() => setVoteForSecondTerm(false)}
                    startDate={formik.values.fromDate}
                    endDate={formik.values.drawerEndDate || ''}
                    onUpdate={(endDate) => {
                        formik.setFieldValue(
                            'drawerEndDate',
                            endDate
                                ? moment.isMoment(endDate)
                                    ? endDate.toISOString()
                                    : new Date(endDate).toISOString()
                                : '',
                        );
                        setIsChanged(true);
                        setVoteForSecondTerm(false);
                    }}
                    timeSlots={timeSlots}
                    selectedTimeSlot={selectedTimeSlot}
                    setSelectedTimeSlot={setSelectedTimeSlot}
                />
            )}
        </Box>
    );
};

export default CashDrawerLayout;
