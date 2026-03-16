import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { IconButton, Modal, Paper, Stack, Slider, Typography, CircularProgress } from '@mui/material';
import FButton from '../../../../commonComponents/F_Button';
import { Close, Mode } from '@mui/icons-material';
import moment from 'moment';
import apiFetcher from '../../../../../utils/interCeptor';
import { toast } from 'react-toastify';
import { t } from 'i18next';

export default function EditImage({
    selectedImage,
    open,
    onClose,
    employeeId,
    images,
    setImages,
    advancedJournalId,
    autoSave,
    formik,
    name,
}) {
    const [isImageLoading, setIsImageLoading] = useState(false);
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [penColor, setPenColor] = useState('#000000');
    const [penWidth, setPenWidth] = useState(2);
    const ctxRef = useRef(null);
    const [localImage, setLocalImage] = useState(null);
    const [showTools, setShowTools] = useState(false);
    const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });

    useEffect(() => {
        if (selectedImage?.attachment && !isImageLoading) {
            setIsImageLoading(true);
            const imgSrc = `${process.env.REACT_APP_IMG_URL}${selectedImage?.attachment}`;
            fetch(imgSrc)
                .then((response) => response.blob())
                .then((blob) => {
                    const localURL = URL.createObjectURL(blob);
                    setLocalImage(localURL);
                    setIsImageLoading(false);
                })
                .catch((err) => {
                    console.error('Failed to load image:', err);
                    toast.error(t('Customer.ADVLoadFailed'));
                    setIsImageLoading(false);
                });
        }
    }, [selectedImage]);

    useLayoutEffect(() => {
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.lineWidth = penWidth;
            ctx.strokeStyle = penColor;
            ctxRef.current = ctx;
        }
    }, [penColor, penWidth]);

    useEffect(() => {
        if (localImage) {
            const img = new Image();
            img.src = localImage;
            img.onload = () => {
                const canvas = canvasRef.current;
                if (canvas) {
                    // Calculate aspect ratio
                    const aspectRatio = img.width / img.height;
                    let width = 800;
                    let height = width / aspectRatio;

                    if (height > 600) {
                        height = 600;
                        width = height * aspectRatio;
                    }

                    setCanvasSize({ width, height });
                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0, width, height);
                }
            };
        }
    }, [localImage]);

    const getCursorPosition = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        // Handle both mouse and touch events
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);

        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY,
        };
    };

    const startDrawing = (e) => {
        e.preventDefault();
        const ctx = ctxRef.current;
        if (ctx) {
            ctx.beginPath();
            const { x, y } = getCursorPosition(e);
            ctx.moveTo(x, y);
            setIsDrawing(true);
        }
    };

    const draw = (e) => {
        e.preventDefault();
        if (!isDrawing) return;
        const ctx = ctxRef.current;
        if (ctx) {
            const { x, y } = getCursorPosition(e);
            ctx.lineTo(x, y);
            ctx.stroke();
        }
    };

    const stopDrawing = (e) => {
        e.preventDefault();
        setIsDrawing(false);
    };

    const saveEditedImage = () => {
        const canvas = canvasRef.current;
        canvas.toBlob((blob) => {
            const file = new File([blob], `edited-${moment().unix()}.png`, { type: 'image/png' });
            let body = { id: advancedJournalId, employee_id: employeeId };
            const formData = new FormData();
            formData.append('attachment', file);
            formData.append('req_body', JSON.stringify(body));

            const toastId = toast.loading(`${t('Common.Uploading')}...`);
            apiFetcher
                .patch(`api/v1/store/advance_journal/attachment/${selectedImage.id}`, formData)
                .then((response) => {
                    let updatedImages = images.map((img) =>
                        img.id === selectedImage.id ? { ...img, attachment: response.data.data.attachment } : img,
                    );
                    setImages(updatedImages);
                    if (formik && name) {
                        formik.setFieldValue(name, updatedImages, false);
                        // Auto-save with updated images directly
                        // Show loading toast immediately before setTimeout
                        const saveToastId = toast.loading(t('Customer.Saving'));
                        setTimeout(() => {
                            if (autoSave) {
                                autoSave({ [name]: updatedImages }, saveToastId);
                            }
                        }, 500);
                    }
                    toast.update(toastId, {
                        type: 'success',
                        isLoading: false,
                        render: t('Customer.ADVUploadSuccess'),
                        autoClose: 1000,
                    });
                    onClose();
                })
                .catch((error) => {
                    toast.update(toastId, {
                        type: 'error',
                        isLoading: false,
                        render: t('Customer.ADVUploadFailed'),
                        autoClose: 2000,
                    });
                    console.error('Upload Error:', error);
                });
        }, 'image/png');
    };

    const clearEdit = () => {
        const ctx = ctxRef.current;
        if (ctx) {
            // Redraw the background image on the canvas
            const img = new Image();
            img.src = localImage;
            img.onload = () => {
                const canvas = canvasRef.current;
                ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the drawing area
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height); // Redraw the background image
            };
        }
    };

    return (
        <React.Fragment>
            <Modal
                disableAutoFocus
                open={open}
                onClose={onClose}
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
                <Paper
                    sx={{
                        position: 'relative',
                        maxWidth: '90%',
                        maxHeight: '90vh',
                        overflow: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 8,
                        padding: 4,
                    }}
                >
                    <IconButton sx={{ position: 'absolute', right: 8, top: 8 }} onClick={onClose}>
                        <Close />
                    </IconButton>
                    <Stack mt={2} p={0} direction={'row'}>
                        <Stack width={'20%'} direction={'column'} gap={2}>
                            <Typography>{t('Customer.PenColor')}</Typography>
                            <input type="color" value={penColor} onChange={(e) => setPenColor(e.target.value)} />
                        </Stack>

                        {!showTools ? (
                            <Stack
                                flex={1}
                                flexDirection={'column'}
                                justifyContent={'space-evenly'}
                                alignContent={'center'}
                                disableFocusRipple
                                disableRipple
                                disableTouchRipple
                                disableTouchFocusRipple
                                sx={{ p: 0, flexDirection: 'column' }}
                                width={'20%'}
                            >
                                <Typography>{t('Customer.SelectMarker')}</Typography>
                                <Mode
                                    sx={{ fontSize: '2rem', cursor: 'pointer', alignItems: 'center', ml: 3 }}
                                    onClick={() => {
                                        setPenWidth(1);
                                        setShowTools(!showTools);
                                    }}
                                />
                            </Stack>
                        ) : (
                            <Stack width={'30%'} direction={'column'} gap={2}>
                                <Typography>{t('Customer.PenWidth')}</Typography>
                                <Slider
                                    value={penWidth}
                                    min={0.1}
                                    max={10}
                                    step={1}
                                    onChange={(e, newValue) => setPenWidth(newValue)}
                                />
                            </Stack>
                        )}
                    </Stack>
                    <Stack mt={2} sx={{ overflow: 'hidden', flex: 1 }}>
                        {isImageLoading ? (
                            <Stack height={400} width={'100%'} justifyContent={'center'} alignItems={'center'}>
                                <CircularProgress size={'2.5rem'} sx={{ color: '#6f6f6f' }} />
                            </Stack>
                        ) : (
                            <Stack
                                alignItems="center"
                                width="100%"
                                sx={{
                                    flex: 1,
                                    overflow: 'auto',
                                    '& canvas': {
                                        maxWidth: '100%',
                                        maxHeight: '70vh',
                                        objectFit: 'contain',
                                    },
                                }}
                            >
                                <canvas
                                    ref={canvasRef}
                                    onMouseDown={startDrawing}
                                    onMouseMove={draw}
                                    onMouseUp={stopDrawing}
                                    onMouseLeave={stopDrawing}
                                    onTouchStart={startDrawing}
                                    onTouchMove={draw}
                                    onTouchEnd={stopDrawing}
                                    style={{
                                        border: '1px solid #d9d9d9',
                                        width: '100%',
                                        height: 'auto',
                                        maxWidth: '800px',
                                        maxHeight: '600px',
                                        touchAction: 'none',
                                        WebkitTouchCallout: 'none',
                                        WebkitUserSelect: 'none',
                                        userSelect: 'none',
                                    }}
                                />
                            </Stack>
                        )}
                    </Stack>
                    <Stack
                        direction={'row'}
                        gap={2}
                        p={2}
                        sx={{
                            position: 'sticky',
                            bottom: 0,
                            backgroundColor: 'white',
                            zIndex: 1,
                        }}
                    >
                        <FButton
                            variant={'save'}
                            onClick={() => saveEditedImage()}
                            title={t('Customer.SaveEditedPicture')}
                        />
                        <FButton variant={'delete'} onClick={clearEdit} title={t('Common.Clear')} />
                    </Stack>
                </Paper>
            </Modal>
        </React.Fragment>
    );
}
