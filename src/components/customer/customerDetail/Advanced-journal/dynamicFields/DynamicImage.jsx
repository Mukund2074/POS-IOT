import { CircularProgress, IconButton, Modal, Paper, Slider, Stack, Typography } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import FButton from '../../../../commonComponents/F_Button';
import { Close, Mode } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import apiFetcher from '../../../../../utils/interCeptor';
import { t } from 'i18next';

export default function DynamicImage({ field, formik, name = 'upload', autoSave }) {
    const [image, setImage] = useState(field?.value);
    const [showEditor, setShowEditor] = useState(false);
    const [imageUrl, setImageUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const user = useSelector((state) => state.user.data);

    // Update image state when field value changes (e.g., after page reload)
    useEffect(() => {
        setImage(field?.value);
    }, [field?.value]);

    useEffect(() => {
        if (!image) {
            setIsLoading(false);
            setImageUrl(null);
            return;
        }

        setIsLoading(true);
        // Use direct S3 URL for display
        const imgUrl = `${process.env.REACT_APP_IMG_URL}${image}`;

        // Preload the image to handle errors
        const img = new Image();
        img.onload = () => {
            setImageUrl(imgUrl);
            setIsLoading(false);
        };
        img.onerror = () => {
            console.error('Failed to load image');
            toast.error(t('Customer.ADVLoadFailed'));
            setIsLoading(false);
            setImageUrl(null);
        };
        img.crossOrigin = 'anonymous';
        img.src = imgUrl;

        // Cleanup function to handle component unmount or image change
        return () => {
            img.onload = null;
            img.onerror = null;
        };
    }, [image]);

    return (
        <Stack>
            <Typography fontWeight={700} variant="body1">
                {field?.name}
            </Typography>

            <Stack
                sx={{
                    ml: { xs: 0, md: 2 },
                    mt: 1,
                    '&:hover': { bgcolor: '#F1F1F1' },
                }}
                display={'flex'}
                pr={4}
                flexDirection={'row'}
                gap={2}
            >
                {isLoading ? (
                    <Stack height={200} width={200} justifyContent="center" alignItems="center">
                        <CircularProgress size={40} sx={{ color: '#6f6f6f' }} />
                    </Stack>
                ) : imageUrl ? (
                    <img
                        onClick={() => {
                            setShowEditor(true);
                        }}
                        src={imageUrl}
                        alt="Uploaded"
                        style={{ objectFit: 'contain', backgroundColor: '#f1f1f190' }}
                        width={200}
                        height={200}
                        crossOrigin="anonymous"
                    />
                ) : (
                    <Stack
                        height={200}
                        width={200}
                        justifyContent="center"
                        alignItems="center"
                        sx={{ backgroundColor: '#f1f1f190' }}
                    >
                        <Typography color="textSecondary">{t('Customer.NoImage')}</Typography>
                    </Stack>
                )}
            </Stack>

            {showEditor && !formik?.values?.disabled && (
                <EditImage
                    field={field}
                    formik={formik}
                    name={name}
                    image={image}
                    setImage={setImage}
                    employeeId={user?.id}
                    open={showEditor}
                    onClose={() => setShowEditor(false)}
                    autoSave={autoSave}
                />
            )}
            {formik?.touched?.[name] && formik?.errors?.[name] && (
                <Typography style={{ color: 'red' }}>{formik?.errors?.[name]}</Typography>
            )}
        </Stack>
    );
}

function EditImage({ field, formik, name, image, setImage, employeeId, open, onClose, autoSave }) {
    const [isImageLoading, setIsImageLoading] = useState(false);
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [penColor, setPenColor] = useState('#000000');
    const [penWidth, setPenWidth] = useState(2);
    const ctxRef = useRef(null);
    const [showTools, setShowTools] = useState(false);
    const [canvasError, setCanvasError] = useState(null);
    const imageRef = useRef(null);

    // Initialize canvas with image
    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas && imageRef.current && !isImageLoading) {
            canvas.width = imageRef.current.width;
            canvas.height = imageRef.current.height;

            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(imageRef.current, 0, 0);
                ctxRef.current = ctx;

                // Set initial drawing properties
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.lineWidth = penWidth;
                ctx.strokeStyle = penColor;
            }
        }
    }, [isImageLoading]); // Only re-run when image loading state changes

    // Update pen properties without redrawing
    useEffect(() => {
        const ctx = ctxRef.current;
        if (ctx) {
            ctx.lineWidth = penWidth;
            ctx.strokeStyle = penColor;
        }
    }, [penColor, penWidth]);

    // Handle image loading
    useEffect(() => {
        if (!image) return;

        const loadImage = async () => {
            try {
                setIsImageLoading(true);
                setCanvasError(null);

                // Use direct S3 URL for loading
                const imgUrl = `${process.env.REACT_APP_IMG_URL}${image}`;

                // Create a new image to ensure it's fully loaded before drawing
                const img = new Image();
                img.crossOrigin = 'anonymous';

                // Create a promise to handle image loading
                await new Promise((resolve, reject) => {
                    img.onload = () => {
                        imageRef.current = img;
                        resolve();
                    };
                    img.onerror = (error) => {
                        console.error('Image load error:', error);
                        reject(new Error('Failed to load image'));
                    };
                    img.src = imgUrl;
                });
            } catch (error) {
                console.error('Canvas image loading error:', error);
                setCanvasError(error.message);
                toast.error(t('Customer.ADVLoadFailed'));
            } finally {
                setIsImageLoading(false);
            }
        };

        loadImage();
    }, [image]);

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

    const startDrawing = (e) => {
        e.preventDefault(); // Prevent default behavior
        const ctx = ctxRef.current;
        if (ctx) {
            const { x, y } = getCursorPosition(e);
            ctx.beginPath();
            ctx.moveTo(x, y);
            setIsDrawing(true);
        }
    };

    const draw = (e) => {
        e.preventDefault(); // Prevent default behavior
        if (!isDrawing) return;
        const ctx = ctxRef.current;
        if (ctx) {
            const { x, y } = getCursorPosition(e);
            ctx.lineTo(x, y);
            ctx.stroke();
        }
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const saveEditedImage = () => {
        const canvas = canvasRef.current;
        canvas.toBlob((blob) => {
            const file = new File([blob], field?.image_name || 'edited-image.png', { type: 'image/png' });
            const formData = new FormData();
            formData.append('file', file);

            const toastId = toast.loading(`${t('Common.Uploading')}...`);
            apiFetcher
                .post(`api/v1/store/file`, formData)
                .then((response) => {
                    if (response?.data?.data?.url) {
                        const imageUrl = response.data.data.url;
                        setImage(imageUrl);
                        formik.setFieldValue(name, imageUrl, false);
                        toast.update(toastId, {
                            type: 'success',
                            isLoading: false,
                            render: t('Customer.ADVUploadSuccess'),
                            autoClose: 1000,
                        });
                        // Auto-save with updated image URL directly
                        // Show loading toast immediately before setTimeout
                        const saveToastId = toast.loading(t('Customer.Saving'));
                        setTimeout(() => {
                            if (autoSave) {
                                autoSave({ [name]: imageUrl }, saveToastId);
                            }
                        }, 500);
                        onClose();
                    } else {
                        throw new Error('Invalid response format');
                    }
                })
                .catch((error) => {
                    console.error('Upload Error:', error);
                    toast.update(toastId, {
                        type: 'error',
                        isLoading: false,
                        render: t('Customer.ADVUploadFailed'),
                        autoClose: 2000,
                    });
                });
        }, 'image/png');
    };

    const clearEdit = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx && imageRef.current) {
            // Preserve current canvas size
            const currentWidth = canvas.width;
            const currentHeight = canvas.height;

            // Clear and reset to original image
            ctx.clearRect(0, 0, currentWidth, currentHeight);
            ctx.drawImage(imageRef.current, 0, 0);

            // Maintain current pen settings
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.lineWidth = penWidth;
            ctx.strokeStyle = penColor;
        }
    };

    return (
        <Modal open={open} onClose={onClose} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                                sx={{ fontSize: '2rem', cursor: 'pointer', alignItems: 'center', ml: { xs: 0, md: 2 } }}
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
                <Stack mt={2} sx={{ flex: 1, minHeight: 0 }}>
                    {isImageLoading ? (
                        <Stack height={400} width={'100%'} justifyContent={'center'} alignItems={'center'}>
                            <CircularProgress size={'2.5rem'} sx={{ color: '#6f6f6f' }} />
                        </Stack>
                    ) : canvasError ? (
                        <Stack height={400} width={'100%'} justifyContent={'center'} alignItems={'center'}>
                            <Typography color="error" align="center">
                                {canvasError}
                            </Typography>
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
                                    cursor: 'crosshair',
                                    touchAction: 'none',
                                    userSelect: 'none',
                                    msUserSelect: 'none',
                                    WebkitUserSelect: 'none',
                                    WebkitTouchCallout: 'none',
                                }}
                            />
                        </Stack>
                    )}
                    <Stack direction={'row'} gap={2} p={2}>
                        <FButton variant={'save'} onClick={saveEditedImage} title={t('Customer.SaveEditedPicture')} />
                        <FButton variant={'delete'} onClick={clearEdit} title={t('Common.Clear')} />
                    </Stack>
                </Stack>
            </Paper>
        </Modal>
    );
}
