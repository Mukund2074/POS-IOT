import React, { useEffect } from 'react';
import { CircularProgress, InputAdornment, Modal, Paper, Stack, Typography } from '@mui/material';
import POSHeading from '@/components/POS/Common/POSHeading';
import POSTextArea from '@/components/POS/Common/POSTextArea';
import POSInput from '@/components/POS/Common/POSInput';
import POSButton from '@/components/POS/Common/POSButton';
import POSSelect from '@/components/POS/Common/POSSelect';
import { t } from 'i18next';
import { FormikTouched, useFormik } from 'formik';
import { Close } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import * as Yup from 'yup';
import { useGetExpensecategory } from '@/hooks/api/pos';
import { useSelector } from 'react-redux';
import { PostApiExpenseBody } from '@/shared/api/models';
import { useCreateExpense } from '@/hooks/api/pos';
import { useGetExpenseData } from '@/hooks/api/pos';
import { EmployeeListingSchema } from '../../../../Sales-Page/Types/sales.types';

interface Props {
    open: boolean;
    onClose: () => void;
}
type employee = {
    label: string;
    value: string;
};

const CreateExpenseModal: React.FC<Props> = ({ open, onClose }) => {
    const setting = useSelector((state: any) => state?.settings?.data);
    const { mutateAsync: createExpense } = useCreateExpense();
    const { refetch: refetchExpense } = useGetExpenseData({});
    const { data: ExpenseCategorysData, refetch } = useGetExpensecategory({
        params: {
            limit: 100,
            sortBy: 'name',
            sortOrder: 'desc',
        },
    });

    const employees = setting?.employees.map((val: EmployeeListingSchema) => {
        return { label: val?.name, value: val?.id };
    });

    const ErrorComponent: React.FC<{ field: keyof typeof formik.initialValues }> = ({ field }) => {
        const touched = formik.touched[field];
        const error = formik.errors[field];

        if (touched && typeof error === 'string') {
            return <Typography style={{ color: 'red', margin: 0 }}>{error}</Typography>;
        }

        return null;
    };

    const validationSchema = Yup.object().shape({
        employee: Yup.string().required(t('Services.YupErrSelectedEmployeeListMin')),
        amount: Yup.number().required(t('POS.YuprequiredAmount')).typeError(t('Customer.ADVJournalFieldNameError')),
    });

    const formik = useFormik({
        initialValues: {
            description: '',
            employee: '',
            category: '',
            amount: '',
        },
        enableReinitialize: true,
        validationSchema,
        onSubmit: async (values) => {
            const body = {
                employeeId: parseInt(values?.employee),
                expenseCategoryId: values?.category === '0' ? '' : values?.category,
                amount: parseFloat(values?.amount),
                description: values?.description || '',
            } as PostApiExpenseBody;
            await createExpense(body);
            refetchExpense();
            onClose();
        },
    });
    const categories = ExpenseCategorysData?.categories?.map((val, index) => {
        return { label: val?.name, value: val?.id };
    });
    categories?.unshift({ label: t('POS.UnCategory'), value: '0' });

    useEffect(() => {
        refetch();
        const selectedEmp = employees.filter((val: employee) => val.value == localStorage.getItem('employee_id'));
        formik.setFieldValue('employee', selectedEmp[0].value);
        formik.setFieldValue('category', '0');
    }, []);

    return (
        <Modal open={open} onClose={onClose} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Paper
                sx={{
                    width: { xs: '90%', sm: '75%', md: '50%' },
                    borderRadius: 4,
                    overflow: 'auto',
                    scrollbarWidth: 'none',
                    my: { xs: 1 },
                    position: 'relative',
                    px: 4,
                    pt: 2,
                }}
            >
                <IconButton sx={{ position: 'absolute', right: 0, top: 0 }} onClick={onClose}>
                    <Close />
                </IconButton>

                <POSHeading text={t('POS.Information')} />

                <Stack spacing={3} sx={{ pt: 4 }}>
                    <Stack
                        spacing={1}
                        direction={{ xs: 'column', sm: 'row' }}
                        alignItems={{ xs: 'flex-start', sm: 'center' }}
                    >
                        <POSHeading
                            text={t('Setting.Description')}
                            sx={{ fontSize: 15, color: '#333', fontWeight: 600, minWidth: 100 }}
                        />
                        <POSTextArea
                            placeholder="Enter description..."
                            value={formik.values.description}
                            onChange={(e) => formik.setFieldValue('description', e.target.value)}
                            sx={{ width: '100%' }}
                        />
                    </Stack>
                    <Stack
                        spacing={1}
                        direction={{ xs: 'column', sm: 'row' }}
                        alignItems={{ xs: 'flex-start', sm: 'center' }}
                    >
                        <POSHeading
                            text={t('Common.CapsEmployee')}
                            sx={{ fontSize: 15, color: '#333', fontWeight: 600, minWidth: 100 }}
                        />
                        <POSSelect
                            id="employee"
                            options={employees}
                            value={formik.values.employee}
                            onChange={(e: any) => formik.setFieldValue('employee', e.target.value)}
                            sx={{ width: '100%', backgroundColor: '#fff' }}
                        />
                    </Stack>
                    <Stack
                        spacing={1}
                        direction={{ xs: 'column', sm: 'row' }}
                        alignItems={{ xs: 'flex-start', sm: 'center' }}
                    >
                        <POSHeading
                            text={t('POS.Category')}
                            sx={{ fontSize: 15, color: '#333', fontWeight: 600, minWidth: 100 }}
                        />
                        <POSSelect
                            id="category"
                            options={categories ?? []}
                            value={formik.values.category}
                            onChange={(e: any) => formik.setFieldValue('category', e.target.value)}
                            sx={{ width: '100%', backgroundColor: '#fff' }}
                        />
                    </Stack>
                    <Stack
                        spacing={1}
                        direction={{ xs: 'column', sm: 'row' }}
                        alignItems={{ xs: 'flex-start', sm: 'center' }}
                    >
                        <POSHeading
                            text={t('Common.Amount')}
                            sx={{ fontSize: 15, color: '#333', fontWeight: 600, minWidth: 100 }}
                        />

                        <Stack spacing={1} sx={{ width: '100%', display: 'block' }}>
                            <POSInput
                                placeholder={t('POS.PlaceholderAmount')}
                                name="amount"
                                value={formik.values.amount ?? ''}
                                onChange={(e) => {
                                    const numericValue = e.target.value.replace(/[^0-9.]/g, '');
                                    // Ensure only one decimal point is allowed
                                    const parts = numericValue.split('.');
                                    let formattedValue =
                                        parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : numericValue;
                                    // Limit to 2 decimal places
                                    if (parts.length === 2 && parts[1].length > 2) {
                                        formattedValue = parts[0] + '.' + parts[1].substring(0, 2);
                                    }
                                    formik.setFieldValue('amount', formattedValue);
                                }}
                                sx={{ flex: 1 }}
                                slotProps={{
                                    input: {
                                        endAdornment: (
                                            <InputAdornment position="end">{t('POS.Currency')}</InputAdornment>
                                        ),
                                    },
                                }}
                            />
                            <ErrorComponent field="amount" />
                        </Stack>
                    </Stack>
                </Stack>

                <Stack
                    direction="row"
                    spacing={2}
                    justifyContent="center"
                    alignItems="center"
                    sx={{
                        px: 4,
                        py: 2.5,
                        mt: 2,
                        backgroundColor: '#fff',
                        display: 'flex',
                        flexDirection: { md: 'row', xs: 'column' },
                        gap: 3,
                    }}
                >
                    <POSButton
                        width={{ md: 'auto', xs: '100%' }}
                        variant="save"
                        onClick={onClose}
                        sx={{ bgcolor: '#d2d2d2' }}
                        title={t('Setting.Cancel')}
                    />
                    <POSButton
                        width={{ md: 'auto', xs: '100%' }}
                        variant="save"
                        disabled={formik.isSubmitting}
                        sx={{ bgcolor: formik.isSubmitting && '#d2d2d2' }}
                        title={
                            formik.isSubmitting ? (
                                <Stack direction="row" gap={2} alignItems="center">
                                    <CircularProgress size={20} color="inherit" />
                                    {t('POS.Processing')}
                                </Stack>
                            ) : (
                                t('POS.CreateExpense')
                            )
                        }
                        onClick={formik.handleSubmit}
                    />
                </Stack>
            </Paper>
        </Modal>
    );
};

export default CreateExpenseModal;
