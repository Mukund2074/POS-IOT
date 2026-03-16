import React, { useEffect, useRef, useState } from 'react';
import { IconButton, Stack, Typography, useMediaQuery } from '@mui/material';
import FButton from '../../../../commonComponents/F_Button';
import { Close } from '@mui/icons-material';
import moment from 'moment';
import { useSelector } from 'react-redux';
import apiFetcher from '../../../../../utils/interCeptor';
import { toast } from 'react-toastify';
import { t } from 'i18next';
import { HttpStatusCode } from 'axios';

export default function DynamicSignature({ formik, field, name, advancedJournalId, autoSave }) {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [signatureImages, setSignatureImages] = useState({});
    const ctxRef = useRef(null);
    const user = useSelector((state) => state.user.data);

    const isTablet = useMediaQuery('md');

    useEffect(() => {
        const storedSignature = formik.values[name] || null;
        setSignatureImages(storedSignature);
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.lineWidth = 2;
            ctxRef.current = ctx;
        }
    }, [formik.values, name]);

    const startDrawing = (e) => {
        e.preventDefault(); // Prevent default behavior
        const ctx = ctxRef.current;
        if (ctx) {
            ctx.beginPath();
            const pos = getCursorPosition(e);
            ctx.moveTo(pos.x, pos.y);
            setIsDrawing(true);
        }
    };

    const draw = (e) => {
        e.preventDefault(); // Prevent default behavior
        if (!isDrawing) return;
        const ctx = ctxRef.current;
        const pos = getCursorPosition(e);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const getCursorPosition = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        const scaleX = canvasRef.current.width / rect.width;
        const scaleY = canvasRef.current.height / rect.height;

        // Handle both mouse and touch events
        const clientX = e.clientX || (e.touches && e.touches[0]?.clientX);
        const clientY = e.clientY || (e.touches && e.touches[0]?.clientY);

        const x = (clientX - rect.left) * scaleX;
        const y = (clientY - rect.top) * scaleY;

        return { x, y };
    };

    const saveSignature = () => {
        const dataURL = canvasRef.current.toDataURL();

        // Remove base64 header
        const base64Data = dataURL.split(',')[1];

        // Decode the base64 string
        const binaryData = atob(base64Data);

        // Create a new Uint8Array to hold the binary data
        const arrayBuffer = new ArrayBuffer(binaryData.length);
        const uint8Array = new Uint8Array(arrayBuffer);

        // Fill the array with the binary data
        for (let i = 0; i < binaryData.length; i++) {
            uint8Array[i] = binaryData.charCodeAt(i);
        }

        // Create a Blob from the binary data
        const blob = new Blob([uint8Array], { type: 'image/png' });

        // Create the File object from the Blob
        const file = new File([blob], `signature-${moment().unix()}.png`, { type: 'image/png' });

        let body = {
            advance_journal_id: advancedJournalId,
            employee_id: user?.id,
        };

        const formData = new FormData();
        formData.append('attachment', file);
        formData.append('req_body', JSON.stringify(body));

        // API call to store the signature
        apiFetcher
            .post(`api/v1/store/advance_journal/attachment`, formData)
            .then((response) => {
                setSignatureImages({
                    id: response?.data?.data?.id,
                    attachment: response?.data?.data?.attachment,
                });
                const signatureValue = {
                    id: response?.data?.data?.id,
                    attachment: response?.data?.data?.attachment,
                };

                formik.setFieldValue(name, signatureValue, false);

                // Auto-save with the updated signature value directly
                // Show loading toast immediately before setTimeout
                const saveToastId = toast.loading(t('Customer.Saving'));
                setTimeout(() => {
                    if (autoSave) {
                        autoSave({ [name]: signatureValue }, saveToastId);
                    }
                }, 500);
            })
            .catch((error) => {
                toast.error(t('Customer.ADVSignErrorToast'));
                console.error('error', error);
            });
    };

    const clearSignature = () => {
        const ctx = ctxRef.current;
        if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    };

    const handleRemoveImage = () => {
        apiFetcher
            .delete(`api/v1/store/advance_journal/attachment/${signatureImages?.id}`)
            .then((response) => {
                if (response.status === HttpStatusCode.Ok) {
                    setSignatureImages(null);
                    formik.setFieldValue(name, null, false);
                    // Auto-save with null signature value directly
                    // Show loading toast immediately before setTimeout
                    const saveToastId = toast.loading(t('Customer.Saving'));
                    setTimeout(() => {
                        if (autoSave) {
                            autoSave({ [name]: null }, saveToastId);
                        }
                    }, 500);
                }
            })
            .catch((error) => {
                toast.error(t('Customer.ADVRemoveSignErrorToast'));
                console.error('error', error);
            });
    };

    return (
        <Stack>
            <Typography fontWeight={700} variant="body1">
                {field?.name}
            </Typography>
            {!signatureImages?.id && !formik?.values?.disabled && (
                <Stack mt={1} ml={{ xs: 0, md: 2 }} sx={{ display: 'inline-block' }}>
                    <canvas
                        disabled={formik?.values?.disabled}
                        ref={canvasRef}
                        width={isTablet ? 500 : 300}
                        height={200}
                        style={{
                            border: '1px solid #d9d9d9',
                            borderRadius: 10,
                            backgroundColor: '#f0f0f010',
                            touchAction: 'none',
                            userSelect: 'none',
                            msUserSelect: 'none',
                            WebkitUserSelect: 'none',
                            WebkitTouchCallout: 'none',
                        }}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                    />

                    <Stack direction={{ xs: 'column', md: 'row' }} mt={2} gap={2}>
                        <FButton
                            disabled={formik?.values?.disabled}
                            variant={'save'}
                            onClick={saveSignature}
                            title={t('Customer.SaveSignature')}
                        />
                        <FButton
                            disabled={formik?.values?.disabled}
                            variant={'delete'}
                            onClick={clearSignature}
                            title={t('Common.Clear')}
                        />
                    </Stack>
                </Stack>
            )}

            {signatureImages?.id && (
                <Stack
                    borderRadius={3}
                    border={'1px solid #d9d9d9'}
                    p={2}
                    width={250}
                    direction={'column'}
                    gap={2}
                    justifyContent={'space-between'}
                    ml={{ xs: 0, md: 2 }}
                    mt={1}
                >
                    <img
                        height={150}
                        width={200}
                        src={`${process.env.REACT_APP_IMG_URL}${signatureImages?.attachment}`}
                        alt={`Signature `}
                    />

                    {!formik?.values?.disabled && (
                        <IconButton
                            disableFocusRipple
                            disableRipple
                            disableTouchRipple
                            disabled={formik?.values?.disabled}
                            onClick={() => handleRemoveImage()}
                            sx={{ color: 'red', px: 4, borderRadius: 4, bgcolor: '#d9d9d9', height: 40 }}
                        >
                            <Close />
                        </IconButton>
                    )}
                </Stack>
            )}

            {formik?.touched?.[name] && formik?.errors?.[name] && (
                <Typography style={{ color: 'red' }}>{formik?.errors?.[name]}</Typography>
            )}
        </Stack>
    );
}
