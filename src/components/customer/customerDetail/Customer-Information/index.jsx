import { Box, Stack, Typography, Grid2, CircularProgress } from '@mui/material';
import { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import moment from 'moment';
import apiFetcher from '../../../../utils/interCeptor';
import { useNavigate, useParams } from 'react-router-dom';
import CustomDeleteModal from '../../../deleteAlertModal';
import { useSelector } from 'react-redux';
import { DeleteCustomerApi } from '../../../../utils/Api/Customer';
import theme from '../../../../ui/theme'; // Ensure this points to your unified tokens
import { useCustomer } from '../../../../context/customer/CustomerContext';
import { formatPrice } from '../../../../scenes/POS/Core/pos.utils';
import RadixInput from '../../../radix/RadixInput';
import RadixTextarea from '../../../radix/RadixTextarea';
import RadixSelect from '../../../radix/RadixSelect';
import RadixPhoneField from '../../../radix/RadixPhoneField';
import RadixButton from '../../../radix/RadixButton';
import { UserRound, MapPin, NotebookPen } from 'lucide-react';
import { toast } from 'react-toastify';

const dateObject = {
    dates: Array.from({ length: 31 }, (_, i) => i + 1),
    months: Array.from({ length: 12 }, (_, i) => i + 1),
    years: Array.from({ length: 100 }, (_, i) => moment().year() - i),
};

const CustomerInformation = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [havePermission, setHavePermission] = useState(false);
    const [deleteCustomerModel, setDeleteCustomerModel] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState({ day: '', month: '', year: '' });

    const isEdit = id !== 'create' && id;
    const user = useSelector((state) => state.user.data);
    const { customer: customerData } = useCustomer();

    useEffect(() => {
        if (user && (user?.settings?.edit_customers || user?.role === 'ADMIN')) {
            setHavePermission(true);
        }
    }, [user]);

    // Update form when context data arrives
    useEffect(() => {
        if (customerData && isEdit) {
            formik.setValues({ ...customerData });
            if (customerData.birthday) {
                setSelectedDate({
                    day: moment(customerData.birthday).date(),
                    month: moment(customerData.birthday).month() + 1,
                    year: moment(customerData.birthday).year(),
                });
            }
        }
    }, [customerData, isEdit]);

    // Handle Birthday String Generation
    useEffect(() => {
        if (selectedDate.year && selectedDate.month && selectedDate.day) {
            const formattedDate = `${selectedDate.year}-${String(selectedDate.month).padStart(2, '0')}-${String(selectedDate.day).padStart(2, '0')}`;
            formik.setFieldValue('birthday', formattedDate);
        }
    }, [selectedDate]);

    const formik = useFormik({
        initialValues: {
            name: '',
            address: '',
            email: '',
            zip_code: '',
            city: '',
            phone_number: '',
            phone_number2: '',
            birthday: null,
            country_code: '+91',
            country_iso_code: 'IN',
            country_code2: '+91',
            country_iso_code2: 'IN',
            bonus: 0,
            marketplace_pointer: '',
            note: '',
        },
        validationSchema: Yup.object({
            name: Yup.string().required('Name is required'),
            phone_number: Yup.string().required('Phone is required'),
            email: Yup.string().email('Invalid email').nullable(),
        }),
        onSubmit: async (values) => {
            try {
                setSaveLoading(true);
                const endpoint = isEdit ? `api/v1/store/customer/outlet?id=${id}` : `api/v1/store/customer/outlet`;
                const method = isEdit ? 'patch' : 'post';

                const response = await apiFetcher[method](endpoint, values);

                if (response.status === 200 || response.status === 201) {
                    toast.success(isEdit ? 'Profile Updated' : 'Customer Created');
                    if (!isEdit) navigate(`/customers/${response.data.data.id}/customerinformation`);
                }
            } catch (error) {
                toast.error('Failed to save changes');
            } finally {
                setSaveLoading(false);
            }
        },
    });

    const mapOptions = (array) => array.map((item) => ({ value: String(item), label: String(item) }));

    const handleSelectDate = ({ date, type }) => {
        setSelectedDate((prev) => ({ ...prev, [type]: date }));
    };

    const deleteCustomer = async (id) => {
        try {
            const response = await DeleteCustomerApi(id);
            if (response.status === 200) {
                toast.success('Customer deleted successfully');
            }
        } catch (error) {
            toast.error('Failed to delete customer');
        }
    };

    return (
        <Stack sx={{ bgcolor: theme.colors.background.default }}>
            {/* MAIN FORM CARD */}
            <Box
                sx={{
                    mx: { xs: 2, md: 10 },
                    mt: 4,
                    p: { xs: 3, md: 8 },
                    bgcolor: theme.colors.background.paper,
                    borderRadius: '40px',
                    boxShadow: '0 20px 60px -10px rgba(0,0,0,0.05)',
                    border: `1px solid ${theme.colors.grey[100]}`,
                }}
            >
                <Stack spacing={1} sx={{ mb: 6 }}>
                    <Typography
                        variant="h2"
                        sx={{
                            fontWeight: 900,
                            fontSize: '32px',
                            color: theme.colors.grey[950],
                            letterSpacing: '-1.5px',
                        }}
                    >
                        {isEdit ? 'Customer Profile' : 'Register Customer'}
                    </Typography>
                    <Typography sx={{ color: theme.colors.grey[500], fontWeight: 500 }}>
                        Manage personal details, contact information, and internal notes.
                    </Typography>
                </Stack>

                <Grid2 container spacing={8}>
                    {/* LEFT COLUMN: IDENTIFICATION */}
                    <Grid2 size={{ xs: 12, md: 6 }}>
                        <Stack spacing={4}>
                            <SectionHeader icon={<UserRound size={20} />} title="Identity" />

                            <FieldWrapper label="FULL NAME" error={formik.touched.name && formik.errors.name}>
                                <RadixInput
                                    name="name"
                                    value={formik.values.name}
                                    onChange={formik.handleChange}
                                    placeholder="e.g. John Doe"
                                    disabled={!havePermission}
                                />
                            </FieldWrapper>

                            <FieldWrapper label="EMAIL ADDRESS" error={formik.touched.email && formik.errors.email}>
                                <RadixInput
                                    name="email"
                                    value={formik.values.email}
                                    onChange={formik.handleChange}
                                    placeholder="john@example.com"
                                />
                            </FieldWrapper>

                            <FieldWrapper label="PRIMARY CONTACT">
                                <RadixPhoneField
                                    value={{
                                        phone: formik.values.phone_number,
                                        country_code: formik.values.country_code,
                                        countryISOCode: formik.values.country_iso_code || 'IN',
                                    }}
                                    onChange={(pv) => {
                                        formik.setFieldValue('phone_number', pv.phone);
                                        formik.setFieldValue('country_code', pv.country_code);
                                        formik.setFieldValue('country_iso_code', pv.countryISOCode);
                                    }}
                                />
                            </FieldWrapper>

                            <FieldWrapper label="BIRTHDAY">
                                <Stack direction="row" spacing={1.5}>
                                    <Box flex={1}>
                                        <RadixSelect
                                            placeholder="DD"
                                            options={mapOptions(dateObject.dates)}
                                            value={String(selectedDate.day)}
                                            onValueChange={(v) => handleSelectDate({ date: Number(v), type: 'day' })}
                                        />
                                    </Box>
                                    <Box flex={1}>
                                        <RadixSelect
                                            placeholder="MM"
                                            options={mapOptions(dateObject.months)}
                                            value={String(selectedDate.month)}
                                            onValueChange={(v) => handleSelectDate({ date: Number(v), type: 'month' })}
                                        />
                                    </Box>
                                    <Box flex={1.5}>
                                        <RadixSelect
                                            placeholder="YYYY"
                                            options={mapOptions(dateObject.years)}
                                            value={String(selectedDate.year)}
                                            onValueChange={(v) => handleSelectDate({ date: Number(v), type: 'year' })}
                                        />
                                    </Box>
                                </Stack>
                            </FieldWrapper>
                        </Stack>
                    </Grid2>

                    {/* RIGHT COLUMN: LOCATION & NOTES */}
                    <Grid2 size={{ xs: 12, md: 6 }}>
                        <Stack spacing={4}>
                            <SectionHeader icon={<MapPin size={20} />} title="Location & Loyalty" />

                            <FieldWrapper label="RESIDENTIAL ADDRESS">
                                <RadixInput
                                    name="address"
                                    value={formik.values.address}
                                    onChange={formik.handleChange}
                                    placeholder="House no, Street name"
                                />
                            </FieldWrapper>

                            <Stack direction="row" spacing={2}>
                                <Box flex={2}>
                                    <FieldWrapper label="CITY">
                                        <RadixInput
                                            name="city"
                                            value={formik.values.city}
                                            onChange={formik.handleChange}
                                            placeholder="City"
                                        />
                                    </FieldWrapper>
                                </Box>
                                <Box flex={1}>
                                    <FieldWrapper label="ZIP">
                                        <RadixInput
                                            name="zip_code"
                                            value={formik.values.zip_code}
                                            onChange={formik.handleChange}
                                            placeholder="Zip"
                                        />
                                    </FieldWrapper>
                                </Box>
                            </Stack>

                            <FieldWrapper label="LOYALTY BONUS (₹)">
                                <RadixInput
                                    name="bonus"
                                    value={formik.values.bonus}
                                    onChange={(e) => formik.setFieldValue('bonus', formatPrice(e.target.value))}
                                    placeholder="0.00"
                                />
                            </FieldWrapper>

                            <SectionHeader icon={<NotebookPen size={20} />} title="System Notes" />

                            <FieldWrapper label="INTERNAL REMARKS">
                                <RadixTextarea
                                    name="note"
                                    rows={4}
                                    value={formik.values.note}
                                    onChange={formik.handleChange}
                                    placeholder="Add private staff notes about this customer..."
                                />
                            </FieldWrapper>
                        </Stack>
                    </Grid2>
                </Grid2>
            </Box>
            {/* DELETE ACTION */}
            <Box sx={{ mx: { xs: 2, md: 10 }, mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <RadixButton
                    variant="primary"
                    onClick={() => formik.handleSubmit()}
                    disabled={saveLoading}
                    className="w-fit"
                >
                    {saveLoading ? <CircularProgress size={20} color="inherit" /> : 'Save Profile'}
                </RadixButton>
                {isEdit && havePermission && (
                    <RadixButton
                        variant="danger"
                        onClick={() => setDeleteCustomerModel(true)}
                        className="rounded-full"
                        style={{ px: 5, py: 1 }}
                    >
                        Delete Customer Profile
                    </RadixButton>
                )}
            </Box>
            <CustomDeleteModal
                open={deleteCustomerModel}
                handleClose={() => setDeleteCustomerModel(false)}
                title="Delete Customer Profile?"
                description="This will permanently remove the customer profile. Previous transaction history will be detached but kept for accounting."
                onClickConfirm={() => deleteCustomer(id)}
            />
        </Stack>
    );
};

// HELPER COMPONENTS FOR CLEANER CODE
const SectionHeader = ({ icon, title }) => (
    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
        <Box sx={{ color: theme.colors.primary[500], display: 'flex' }}>{icon}</Box>
        <Typography
            sx={{
                fontWeight: 800,
                fontSize: '14px',
                color: theme.colors.grey[900],
                textTransform: 'uppercase',
                letterSpacing: '1px',
            }}
        >
            {title}
        </Typography>
    </Stack>
);

const FieldWrapper = ({ label, children, error }) => (
    <Stack spacing={1} sx={{ width: '100%' }}>
        <Typography sx={{ fontSize: '12px', fontWeight: 700, color: theme.colors.grey[600], ml: 1 }}>
            {label}
        </Typography>
        {children}
        {error && (
            <Typography sx={{ fontSize: '12px', color: theme.colors.red[500], ml: 1, fontWeight: 600 }}>
                {error}
            </Typography>
        )}
    </Stack>
);

export default CustomerInformation;
