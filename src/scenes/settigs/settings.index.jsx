import React, { useEffect, useState } from 'react';
import Masonry from '@mui/lab/Masonry';
import {
    Box,
    Typography,
    Grid2,
    Stack,
    Divider,
    Button,
    InputAdornment,
    Skeleton,
    CircularProgress,
    TextField,
    IconButton,
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import { Add, Cancel, StorefrontOutlined, LinkOutlined, PhotoLibraryOutlined, SaveOutlined } from '@mui/icons-material';
import { useFormik } from 'formik';
import apiFetcher from '../../utils/interCeptor';
import _ from 'lodash';
import { useSelector } from 'react-redux';
import * as Yup from 'yup';
import { HttpStatusCode } from 'axios';
import { useData } from '../../context/DataContext';
import { toast } from 'sonner';
import RadixButton from '../../components/radix/RadixButton';

/* ─────────────────────────────────────────────────────────────
   DESIGN TOKENS  — mapped directly from your theme
   primary[500]    = #141b2d  (dark navy)
   primary[400]    = #4B49AC  (purple accent)
   blueAccent[500] = #6870fa
   blueAccent[400] = #868dfb
   grey[*]         = as defined
───────────────────────────────────────────────────────────── */
const D = {
    // Page
    pageBg: '#f5f6fa',
    cardBg: '#ffffff',
    inputBg: '#f9fafb',

    // Brand colours from your tokens
    primary: '#141b2d', // primary[500]
    accent: '#4B49AC', // primary[400]
    accentBlue: '#6870fa', // blueAccent[500]
    accentLight: '#868dfb', // blueAccent[400]
    accentDim: 'rgba(75,73,172,0.08)',
    accentBorder: 'rgba(75,73,172,0.25)',

    // Text
    text: '#141b2d',
    textSecond: '#525252', // grey[600]
    textMuted: '#858585', // grey[400]
    textPlaceholder: '#a3a3a3', // grey[300]

    // Borders
    border: '#e8eaf0',
    borderFocus: '#4B49AC',

    // Status
    error: '#e2726e', // redAccent[400]
    success: '#4cceac', // greenAccent[500]

    // Fonts (matching your theme)
    sansFont: '"Source Sans Pro", sans-serif',
    monoFont: '"DM Mono", "Courier New", monospace',
};

/* ─────────────────────────────────────────────────────────────
   SHARED MUI TextField sx
───────────────────────────────────────────────────────────── */
const inputSx = {
    width: '100%',
    '& .MuiOutlinedInput-root': {
        bgcolor: D.inputBg,
        borderRadius: '8px',
        fontSize: 14,
        color: D.text,
        fontFamily: D.sansFont,
        transition: 'box-shadow 0.18s ease',
        '& fieldset': {
            borderColor: D.border,
            borderWidth: '1.5px',
            transition: 'border-color 0.18s ease',
        },
        '&:hover fieldset': { borderColor: D.accentLight },
        '&.Mui-focused fieldset': {
            borderColor: D.accent,
            borderWidth: '1.5px',
        },
        '&.Mui-focused': {
            boxShadow: `0 0 0 3px ${D.accentDim}`,
        },
        '&.Mui-disabled': {
            bgcolor: '#f3f4f6',
            '& fieldset': { borderColor: D.border },
        },
        '& input': {
            color: D.text,
            fontFamily: D.sansFont,
            fontSize: 14,
            padding: '11px 14px',
            '&::placeholder': { color: D.textPlaceholder, opacity: 1 },
            '&:-webkit-autofill': {
                WebkitBoxShadow: `0 0 0 100px ${D.inputBg} inset`,
                WebkitTextFillColor: D.text,
            },
        },
        '& textarea': {
            color: D.text,
            fontFamily: D.sansFont,
            fontSize: 14,
            lineHeight: 1.7,
            '&::placeholder': { color: D.textPlaceholder, opacity: 1 },
        },
    },
    '& .MuiFormHelperText-root': {
        color: D.error,
        fontSize: 11,
        mx: 0,
        mt: 0.5,
    },
};

/* ─────────────────────────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────────────────────────── */

/** Small monospace label above each field */
const FieldLabel = ({ text }) => (
    <Typography
        component="label"
        sx={{
            display: 'block',
            fontFamily: D.monoFont,
            fontSize: '10.5px',
            fontWeight: 500,
            letterSpacing: '0.11em',
            textTransform: 'uppercase',
            color: D.textMuted,
            mb: 0.8,
            mt: 2.5,
        }}
    >
        {text}
    </Typography>
);

/** Section: icon + heading + desc on left, children on right */
const Section = ({ icon: Icon, title, desc, children, noDivider = false }) => (
    <>
        <Grid2 container spacing={{ xs: 3, md: 6 }} sx={{ px: { xs: 3, md: 5 }, py: { xs: 4, md: 5 } }}>
            {/* Left meta column */}
            <Grid2 size={{ xs: 12, md: 3 }}>
                <Stack direction="row" alignItems="flex-start" spacing={1.5} sx={{ mb: 1 }}>
                    <Box
                        sx={{
                            width: 36,
                            height: 36,
                            borderRadius: '10px',
                            flexShrink: 0,
                            bgcolor: D.accentDim,
                            border: `1.5px solid ${D.accentBorder}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Icon sx={{ fontSize: 17, color: D.accent }} />
                    </Box>
                    <Box>
                        <Typography
                            sx={{
                                fontFamily: D.sansFont,
                                fontSize: 15,
                                fontWeight: 700,
                                color: D.primary,
                                lineHeight: 1.25,
                            }}
                        >
                            {title}
                        </Typography>
                        <Typography
                            sx={{
                                fontFamily: D.sansFont,
                                fontSize: 12.5,
                                color: D.textMuted,
                                lineHeight: 1.65,
                                fontWeight: 400,
                                mt: 0.5,
                            }}
                        >
                            {desc}
                        </Typography>
                    </Box>
                </Stack>
            </Grid2>

            {/* Right content column */}
            <Grid2 size={{ xs: 12, md: 9 }}>{children}</Grid2>
        </Grid2>

        {!noDivider && <Divider sx={{ borderColor: D.border }} />}
    </>
);

/** Skeleton loader while fetching */
const FormSkeleton = () => (
    <Grid2 container spacing={2.5}>
        {Array.from({ length: 6 }).map((_, i) => (
            <Grid2 key={i} size={{ xs: 12, sm: 6 }}>
                <Skeleton variant="text" width="36%" height={13} sx={{ mb: 0.8, mt: 2.5 }} />
                <Skeleton variant="rounded" height={44} sx={{ borderRadius: '8px' }} />
            </Grid2>
        ))}
        <Grid2 size={12}>
            <Skeleton variant="text" width="18%" height={13} sx={{ mb: 0.8, mt: 2.5 }} />
            <Skeleton variant="rounded" height={130} sx={{ borderRadius: '8px' }} />
        </Grid2>
    </Grid2>
);

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */
export const formatPhoneNumber = (n) => (n ? n.replace(/(\d{2})(?=\d)/g, '$1 ') : '');

const extractCoordinates = (geo) => {
    if (!geo) return { lng: '', lat: '' };
    const m = geo.match(/POINT \(([-\d.]+) ([-\d.]+)\)/);
    return m ? { lng: parseFloat(m[1]), lat: parseFloat(m[2]) } : { lng: '', lat: '' };
};

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────── */
const GeneralSettingsOption = () => {
    const user = useSelector((s) => s.user.data);
    const setting = useSelector((s) => s.settings.data);
    const { refreshSettings } = useData();

    const [initialValues, setInitialValues] = useState({
        name: '',
        address: '',
        city: '',
        contact_number: '',
        contact_number2: '',
        lat: '',
        lng: '',
        about: '',
        zip_code: '',
        email: '',
        website: '',
        instagram: '',
        facebook: '',
        tiktok: '',
        profile_image: '',
        banner_image: '',
        images: [],
    });
    const [loading, setLoading] = useState(false);
    const [isChanges, setIsChanges] = useState(false);

    /* ── Data Fetching ── */
    const fetchData = async ({ needLoad = false }) => {
        try {
            needLoad && setLoading(true);
            const [res, imgRes] = await Promise.all([
                apiFetcher.get('/api/v1/store/setting/profile'),
                apiFetcher.get('/api/v1/store/gallery'),
            ]);
            const data = res.data.data;
            const { lng, lat } = extractCoordinates(data.geo_location);
            setInitialValues((p) => ({ ...p, ...data, ...imgRes.data.data, lng, lat }));
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchData({ needLoad: true });
    }, []);

    /* ── Validation ── */
    const validationSchema = Yup.object({
        name: Yup.string().required('Business name is required'),
        address: Yup.string().required('Business street name is required'),
        about: Yup.string().nullable(),
        contact_number: Yup.string()
            .required('Business phone number is required')
            .min(10, 'Must be exactly 10 digits')
            .max(10, 'Must be exactly 10 digits'),
        contact_number2: Yup.string()
            .nullable()
            .min(10, 'Must be exactly 10 digits')
            .max(10, 'Must be exactly 10 digits'),
        email: Yup.string().email('Invalid email format').required('Email is required'),
        website: Yup.string().nullable(),
        instagram: Yup.string().nullable(),
        facebook: Yup.string().nullable(),
        tiktok: Yup.string().nullable(),
        images: Yup.array(),
    });

    /* ── Formik ── */
    const formik = useFormik({
        enableReinitialize: true,
        initialValues,
        validationSchema,
        onSubmit: handlesubmit,
    });

    /* ── Dirty detection ── */
    useEffect(() => {
        const changed = !_.isEqual(initialValues, formik.values);
        if (changed !== isChanges) {
            const timer = setTimeout(() => setIsChanges(changed), 200);
            return () => clearTimeout(timer);
        }
    }, [initialValues, formik.values, isChanges]);

    /* ── File Removal ── */
    const handleFilesRemove = async ({ ids = [], profile_image = false, banner_image = false }) => {
        try {
            const res = await apiFetcher.delete('/api/v1/store/gallery', {
                data: { ids, profile_image, banner_image },
            });
            if (res.status === HttpStatusCode.Ok) {
                toast.success('Image removed');
                let newValues;
                if (profile_image) newValues = { ...formik.values, profile_image: '' };
                else if (banner_image) newValues = { ...formik.values, banner_image: '' };
                else
                    newValues = {
                        ...formik.values,
                        images: formik.values.images.filter((img) => !ids.includes(img.id)),
                    };
                formik.setValues(newValues);
                setInitialValues(newValues);
            }
        } catch {
            toast.error('Failed to remove image');
        }
    };

    /* ── Dropzone ── */
    const { getRootProps, getInputProps } = useDropzone({
        onDrop: (files) => formik.setFieldValue('images', [...formik.values.images, ...files]),
        accept: 'image/*',
        multiple: false,
    });
    const handleInputImageFileChange = (e) => {
        const file = e.target.files[0];
        if (file) formik.setFieldValue('images', [...formik.values.images, file]);
    };

    /* ── Submit ── */
    async function handlesubmit(values) {
        const isProfileObj = typeof formik.values.profile_image === 'object';
        const isBannerObj = typeof formik.values.banner_image === 'object';
        const hasImgFiles = formik.values.images.length > 0;

        // Online booking setting
        try {
            const parsed = setting?.profile?.settings?.find((s) => s.settingName === 'OnlineBooking');
            let pv = {};
            if (parsed?.value) {
                try {
                    pv = JSON.parse(parsed.value);
                } catch {}
            }
            pv.onlineBooking = pv.onlineBooking || {};
            await apiFetcher.patch('/api/v1/store/outlet/setting', {
                settings: [
                    {
                        settingCategory: 'outlet',
                        settingName: 'OnlineBooking',
                        value: JSON.stringify(pv),
                        type: 'JSON',
                    },
                ],
            });
        } catch (e) {
            console.error(e);
        }

        // Profile text fields
        if (!hasImgFiles && !isProfileObj && !isBannerObj) {
            try {
                const res = await apiFetcher.post('/api/v1/store/setting/profile', values);
                if (res.data.success) {
                    toast.success('Store settings updated');
                    setInitialValues(formik.values);
                } else toast.error('Failed to update store settings');
            } catch (e) {
                console.error(e);
            } finally {
                await fetchData({ needLoad: false });
            }
        }

        // Image uploads
        const formdata = new FormData();
        if (isProfileObj) formdata.append('profile_image', formik.values.profile_image);
        if (isBannerObj) formdata.append('banner_image', formik.values.banner_image);

        let hasNewImages = false;
        if (hasImgFiles) {
            const newImgs = formik.values.images.filter((img) => !img?.image);
            if (newImgs.length > 0) {
                hasNewImages = true;
                newImgs.forEach((img) => formdata.append('images', img));
            }
        }

        if (hasNewImages || isProfileObj || isBannerObj) {
            try {
                const res = await apiFetcher.post('/api/v1/store/gallery', formdata);
                if (res.data.success) toast.success('Store settings updated');
                else toast.error('Failed to update store settings');
            } catch (e) {
                console.error(e);
            } finally {
                await fetchData({ needLoad: false });
            }
        } else if (hasImgFiles) {
            try {
                const res = await apiFetcher.post('/api/v1/store/setting/profile', values);
                if (res.data.success) {
                    toast.success('Store settings updated');
                    setInitialValues(formik.values);
                } else toast.error('Failed to update store settings');
            } catch {
                toast.error('Failed to update store settings');
            } finally {
                await fetchData({ needLoad: false });
            }
        }

        refreshSettings();
    }

    const canEdit = user?.role === 'ADMIN' || user?.settings?.edit_about_us;
    const canUpload = user?.role === 'ADMIN' || user?.settings?.upload_pictures;
    if (!formik?.values) return null;

    /* ── Phone prefix adornment ── */
    const PhonePrefix = (
        <InputAdornment position="start">
            <Typography
                sx={{
                    fontFamily: D.monoFont,
                    fontSize: 12,
                    fontWeight: 600,
                    color: D.accent,
                    borderRight: `1.5px solid ${D.border}`,
                    pr: 1.2,
                    mr: 0.5,
                    userSelect: 'none',
                    lineHeight: 1,
                }}
            >
                +91
            </Typography>
        </InputAdornment>
    );

    /* ══════════════════════════════════════════════════════════
       RENDER
    ══════════════════════════════════════════════════════════ */
    return (
        <Box sx={{ bgcolor: D.pageBg, minHeight: '100vh' }}>
            {/* ── PAGE HEADER ── */}
            <Stack sx={{ position: 'sticky', top: 0, zIndex: 100, width: '100%', bgcolor: D.cardBg }}>
                <Box
                    sx={{
                        bgcolor: D.cardBg,
                        borderBottom: `1px solid ${D.border}`,
                        px: { xs: 3, md: 5 },
                        pt: 4,
                        pb: 3,
                    }}
                >
                    <Typography
                        sx={{
                            fontFamily: D.sansFont,
                            fontSize: { xs: 22, md: 26 },
                            fontWeight: 700,
                            color: D.primary,
                        }}
                    >
                        Store Configuration
                    </Typography>
                </Box>

                {/* ── STICKY SAVE BAR ── */}
                {isChanges && (
                    <Box
                        sx={{
                            bgcolor: D.cardBg,
                            px: { xs: 3, md: 5 },
                            py: 1.1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            boxShadow: '0 4px 16px rgba(25,27,45,0.22)',
                        }}
                    >
                        <Stack direction="row" alignItems="center" spacing={1.2}>
                            <Box
                                sx={{
                                    width: 7,
                                    height: 7,
                                    borderRadius: '50%',
                                    bgcolor: '#fbbf24',
                                    boxShadow: '0 0 8px rgba(251,191,36,0.7)',
                                }}
                            />
                            <Typography
                                sx={{
                                    fontFamily: D.monoFont,
                                    fontSize: '10px',
                                    letterSpacing: '0.12em',
                                    color: D.text,
                                    textTransform: 'uppercase',
                                }}
                            >
                                Unsaved changes
                            </Typography>
                        </Stack>

                        <Button
                            onClick={() => formik.handleSubmit()}
                            disabled={formik.isSubmitting}
                            startIcon={
                                formik.isSubmitting ? (
                                    <CircularProgress size={13} sx={{ color: D.cardBg }} />
                                ) : (
                                    <SaveOutlined sx={{ fontSize: '14px !important' }} />
                                )
                            }
                            sx={{
                                bgcolor: D.text,
                                color: D.cardBg,
                                fontFamily: D.monoFont,
                                fontSize: '11px',
                                fontWeight: 700,
                                letterSpacing: '0.10em',
                                textTransform: 'uppercase',
                                px: 2.5,
                                py: 0.85,
                                borderRadius: '7px',
                                boxShadow: 'none',
                                minWidth: 0,
                            }}
                        >
                            Save Changes
                        </Button>
                    </Box>
                )}
            </Stack>

            {/* ── MAIN CARD ── */}
            <Box
                sx={{
                    bgcolor: D.cardBg,
                    borderRadius: '14px',
                    border: `1px solid ${D.border}`,
                    mx: { xs: 2, md: 3 },
                    my: 3,
                    overflow: 'hidden',
                    boxShadow: '0 1px 6px rgba(20,27,45,0.05)',
                }}
            >
                {/* ══ STORE INFORMATION ══ */}
                <Section
                    icon={StorefrontOutlined}
                    title="Store Information"
                    desc="Core business details visible to your customers."
                >
                    {loading ? (
                        <FormSkeleton />
                    ) : (
                        <Grid2 container spacing={2.5}>
                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                <FieldLabel text="Business Name" />
                                <TextField
                                    {...formik.getFieldProps('name')}
                                    disabled={!canEdit}
                                    placeholder="Your business name"
                                    sx={inputSx}
                                    error={formik.touched.name && Boolean(formik.errors.name)}
                                    helperText={formik.touched.name && formik.errors.name}
                                />
                            </Grid2>

                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                <FieldLabel text="Street Address" />
                                <TextField
                                    {...formik.getFieldProps('address')}
                                    disabled={!canEdit}
                                    placeholder="123 Main Street"
                                    sx={inputSx}
                                    error={formik.touched.address && Boolean(formik.errors.address)}
                                    helperText={formik.touched.address && formik.errors.address}
                                />
                            </Grid2>

                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                <FieldLabel text="Primary Phone" />
                                <TextField
                                    disabled={!canEdit}
                                    value={
                                        formik.values.contact_number
                                            ? formatPhoneNumber(formik.values.contact_number)
                                            : ''
                                    }
                                    onChange={(e) =>
                                        formik.setFieldValue('contact_number', e.target.value.replace(/[^0-9]/g, ''))
                                    }
                                    onBlur={() => formik.setFieldTouched('contact_number', true)}
                                    inputProps={{ maxLength: 14 }}
                                    placeholder="00 00 00 00 00"
                                    InputProps={{ startAdornment: PhonePrefix }}
                                    sx={inputSx}
                                    error={formik.touched.contact_number && Boolean(formik.errors.contact_number)}
                                    helperText={formik.touched.contact_number && formik.errors.contact_number}
                                />
                            </Grid2>

                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                <FieldLabel text="Alternative Phone" />
                                <TextField
                                    disabled={!canEdit}
                                    value={
                                        formik.values.contact_number2
                                            ? formatPhoneNumber(formik.values.contact_number2)
                                            : ''
                                    }
                                    onChange={(e) =>
                                        formik.setFieldValue('contact_number2', e.target.value.replace(/[^0-9]/g, ''))
                                    }
                                    onBlur={() => formik.setFieldTouched('contact_number2', true)}
                                    inputProps={{ maxLength: 14 }}
                                    placeholder="00 00 00 00 00"
                                    InputProps={{ startAdornment: PhonePrefix }}
                                    sx={inputSx}
                                    error={formik.touched.contact_number2 && Boolean(formik.errors.contact_number2)}
                                    helperText={formik.touched.contact_number2 && formik.errors.contact_number2}
                                />
                            </Grid2>

                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                <FieldLabel text="Email Address" />
                                <TextField
                                    {...formik.getFieldProps('email')}
                                    disabled={!canEdit}
                                    placeholder="hello@yourbusiness.com"
                                    sx={inputSx}
                                    error={formik.touched.email && Boolean(formik.errors.email)}
                                    helperText={formik.touched.email && formik.errors.email}
                                />
                            </Grid2>

                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                <FieldLabel text="CVR Number" />
                                <TextField
                                    {...formik.getFieldProps('cvr_number')}
                                    disabled={!canEdit}
                                    placeholder="00000000"
                                    sx={inputSx}
                                    error={formik.touched.cvr_number && Boolean(formik.errors.cvr_number)}
                                    helperText={formik.touched.cvr_number && formik.errors.cvr_number}
                                />
                            </Grid2>

                            <Grid2 size={12}>
                                <FieldLabel text="About Us" />
                                <TextField
                                    {...formik.getFieldProps('about')}
                                    disabled={!canEdit}
                                    multiline
                                    minRows={5}
                                    maxRows={14}
                                    placeholder="Tell your story — what makes your business unique..."
                                    sx={inputSx}
                                    error={formik.touched.about && Boolean(formik.errors.about)}
                                    helperText={formik.touched.about && formik.errors.about}
                                />
                            </Grid2>
                        </Grid2>
                    )}
                </Section>

                {/* ══ MARKETPLACE LINKS ══ */}
                {!loading && (
                    <Section
                        icon={LinkOutlined}
                        title="Marketplace Links"
                        desc="Connect your website and social channels."
                    >
                        <Grid2 container spacing={2.5}>
                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                <FieldLabel text="Website" />
                                <TextField
                                    {...formik.getFieldProps('website')}
                                    disabled={!canEdit}
                                    placeholder="https://yourbusiness.com"
                                    sx={inputSx}
                                    error={formik.touched.website && Boolean(formik.errors.website)}
                                    helperText={formik.touched.website && formik.errors.website}
                                />
                            </Grid2>

                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                <FieldLabel text="Instagram" />
                                <TextField
                                    {...formik.getFieldProps('instagram')}
                                    disabled={!canEdit}
                                    placeholder="@yourbusiness"
                                    sx={inputSx}
                                    error={formik.touched.instagram && Boolean(formik.errors.instagram)}
                                    helperText={formik.touched.instagram && formik.errors.instagram}
                                />
                            </Grid2>

                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                <FieldLabel text="Facebook" />
                                <TextField
                                    {...formik.getFieldProps('facebook')}
                                    disabled={!canEdit}
                                    placeholder="facebook.com/yourbusiness"
                                    sx={inputSx}
                                    error={formik.touched.facebook && Boolean(formik.errors.facebook)}
                                    helperText={formik.touched.facebook && formik.errors.facebook}
                                />
                            </Grid2>

                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                <FieldLabel text="TikTok" />
                                <TextField
                                    {...formik.getFieldProps('tiktok')}
                                    disabled={!canEdit}
                                    placeholder="@yourbusiness"
                                    onChange={(e) => {
                                        let v = e.target.value;
                                        v = v.replace(/^([^@])/, '@$1');
                                        formik.setFieldValue('tiktok', v);
                                    }}
                                    sx={inputSx}
                                    error={formik.touched.tiktok && Boolean(formik.errors.tiktok)}
                                    helperText={formik.touched.tiktok && formik.errors.tiktok}
                                />
                            </Grid2>
                        </Grid2>
                    </Section>
                )}

                {/* ══ GALLERY ══ */}
                {!loading && (
                    <Section
                        icon={PhotoLibraryOutlined}
                        title="Gallery"
                        desc="Visual assets shown on your public profile."
                        noDivider
                    >
                        {/* Profile + Banner */}
                        {canUpload && (
                            <Grid2 container spacing={2.5} sx={{ mb: 3.5 }}>
                                <Grid2 size={{ xs: 12, sm: 6 }}>
                                    <FieldLabel text="Profile Picture" />
                                    <Stack spacing={1}>
                                        {(() => {
                                            const field = formik.values.profile_image;
                                            const previewSrc =
                                                typeof field === 'string' && field
                                                    ? field.startsWith('http')
                                                        ? field
                                                        : `${process.env.REACT_APP_IMG_URL || ''}${field}`
                                                    : field && typeof field === 'object'
                                                      ? URL.createObjectURL(field)
                                                      : null;
                                            return previewSrc ? (
                                                <Box
                                                    component="img"
                                                    src={previewSrc}
                                                    alt=""
                                                    sx={{ maxHeight: 120, objectFit: 'contain', borderRadius: 1 }}
                                                />
                                            ) : null;
                                        })()}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            hidden
                                            id="profile_image"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) formik.setFieldValue('profile_image', file);
                                                e.target.value = '';
                                            }}
                                        />
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <RadixButton
                                                type="button"
                                                variant="outline"
                                                onClick={() => document.getElementById('profile_image')?.click()}
                                            >
                                                Upload
                                            </RadixButton>
                                            <RadixButton
                                                type="button"
                                                variant="ghost"
                                                onClick={() => handleFilesRemove({ profile_image: true })}
                                            >
                                                Remove
                                            </RadixButton>
                                        </Stack>
                                    </Stack>
                                </Grid2>
                                <Grid2 size={{ xs: 12, sm: 6 }}>
                                    <FieldLabel text="Banner Picture" />
                                    <Stack spacing={1}>
                                        {(() => {
                                            const field = formik.values.banner_image;
                                            const previewSrc =
                                                typeof field === 'string' && field
                                                    ? field.startsWith('http')
                                                        ? field
                                                        : `${process.env.REACT_APP_IMG_URL || ''}${field}`
                                                    : field && typeof field === 'object'
                                                      ? URL.createObjectURL(field)
                                                      : null;
                                            return previewSrc ? (
                                                <Box
                                                    component="img"
                                                    src={previewSrc}
                                                    alt=""
                                                    sx={{ maxHeight: 120, objectFit: 'contain', borderRadius: 1 }}
                                                />
                                            ) : null;
                                        })()}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            hidden
                                            id="banner_image"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) formik.setFieldValue('banner_image', file);
                                                e.target.value = '';
                                            }}
                                        />
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <RadixButton
                                                type="button"
                                                variant="outline"
                                                onClick={() => document.getElementById('banner_image')?.click()}
                                            >
                                                Upload
                                            </RadixButton>
                                            <RadixButton
                                                type="button"
                                                variant="ghost"
                                                onClick={() => handleFilesRemove({ banner_image: true })}
                                            >
                                                Remove
                                            </RadixButton>
                                        </Stack>
                                    </Stack>
                                </Grid2>
                            </Grid2>
                        )}

                        <FieldLabel text="Gallery Images" />

                        <Masonry columns={{ xs: 1, sm: 2, lg: 3, xl: 4 }} spacing={1.5} sx={{ zIndex: 0, mt: 1 }}>
                            {formik.values.images?.map((item, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        position: 'relative',
                                        borderRadius: '10px',
                                        overflow: 'hidden',
                                        border: `1px solid ${D.border}`,
                                        '&:hover .remove-btn': { opacity: 1 },
                                        '&:hover img': { transform: 'scale(1.04)' },
                                    }}
                                >
                                    {canUpload && (
                                        <IconButton
                                            className="remove-btn"
                                            size="small"
                                            onClick={() => {
                                                if (typeof item === 'object' && item?.id)
                                                    handleFilesRemove({ ids: [item.id] });
                                                else
                                                    formik.setFieldValue(
                                                        'images',
                                                        formik.values.images.filter((img) => img !== item),
                                                    );
                                            }}
                                            sx={{
                                                position: 'absolute',
                                                top: 6,
                                                right: 6,
                                                zIndex: 2,
                                                opacity: 0,
                                                width: 26,
                                                height: 26,
                                                bgcolor: 'rgba(255,255,255,0.92)',
                                                border: `1px solid ${D.border}`,
                                                transition: 'opacity 0.2s ease',
                                                '&:hover': { bgcolor: '#fff' },
                                            }}
                                        >
                                            <Cancel sx={{ fontSize: 14, color: D.error }} />
                                        </IconButton>
                                    )}
                                    <Box
                                        component="img"
                                        src={
                                            item?.image && typeof item.image === 'string'
                                                ? `${process.env.REACT_APP_IMG_URL}${item.image}`
                                                : URL.createObjectURL(item)
                                        }
                                        alt="gallery"
                                        loading="lazy"
                                        sx={{
                                            display: 'block',
                                            width: '100%',
                                            borderRadius: '10px',
                                            transition: 'transform 0.3s ease',
                                        }}
                                    />
                                </Box>
                            ))}

                            {/* Upload tile */}
                            {canUpload && (
                                <Box
                                    {...getRootProps()}
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        minHeight: '160px',
                                        borderRadius: '10px',
                                        border: `1.5px dashed ${D.border}`,
                                        bgcolor: D.inputBg,
                                        cursor: 'pointer',
                                        transition: 'border-color 0.2s ease, background 0.2s ease',
                                        '&:hover': {
                                            borderColor: D.accent,
                                            bgcolor: D.accentDim,
                                        },
                                    }}
                                >
                                    <input {...getInputProps()} onChange={handleInputImageFileChange} />
                                    <Box
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: '10px',
                                            bgcolor: D.accentDim,
                                            border: `1.5px solid ${D.accentBorder}`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            mb: 1,
                                        }}
                                    >
                                        <Add sx={{ fontSize: 20, color: D.accent }} />
                                    </Box>
                                    <Typography
                                        sx={{
                                            fontFamily: D.monoFont,
                                            fontSize: '10px',
                                            letterSpacing: '0.10em',
                                            color: D.textMuted,
                                            textTransform: 'uppercase',
                                        }}
                                    >
                                        Drop or Click
                                    </Typography>
                                </Box>
                            )}
                        </Masonry>
                    </Section>
                )}
            </Box>
        </Box>
    );
};

export default GeneralSettingsOption;
