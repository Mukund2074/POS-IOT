import React, { useState, useEffect } from 'react';
import { Modal, Box, Typography, Stack, CircularProgress, Fade, Zoom, Slide } from '@mui/material';
import { CreditCard, CheckCircle, Error, Refresh } from '@mui/icons-material';
import { t } from 'i18next';
import POSButton from '@/components/POS/Common/POSButton';

interface CardTerminalLoadingModalProps {
    open: boolean;
    onClose?: () => void;
    status: 'processing' | 'success' | 'error';
    message?: string;
    onRetry?: () => void;
    retryTimeout?: number; // in milliseconds, default 30000 (30 seconds)
    onCancel?: () => void;
    isCancellingPayment?: boolean;
}

const CardTerminalLoadingModal: React.FC<CardTerminalLoadingModalProps> = ({
    open,
    onClose,
    status,
    message,
    onRetry,
    retryTimeout = 30000,
    onCancel,
    isCancellingPayment = false,
}) => {
    const [showRetryButton, setShowRetryButton] = useState(false);
    const [showCancelButton, setShowCancelButton] = useState(false);

    useEffect(() => {
        if (status === 'processing' && onRetry) {
            const timer = setTimeout(() => {
                setShowRetryButton(true);
                setShowCancelButton(true);
            }, retryTimeout);

            return () => clearTimeout(timer);
        } else {
            setShowRetryButton(false);
            setShowCancelButton(false);
        }
    }, [status, onRetry, retryTimeout]);

    // Reset retry button when modal closes
    useEffect(() => {
        if (!open) {
            setShowRetryButton(false);
            setShowCancelButton(false);
        }
    }, [open]);

    const getStatusIcon = () => {
        switch (status) {
            case 'success':
                return <CheckCircle sx={{ fontSize: 80, color: '#4caf50' }} />;
            case 'error':
                return <Error sx={{ fontSize: 80, color: '#f44336' }} />;
            default:
                return <CreditCard sx={{ fontSize: 80, color: '#1976d2' }} />;
        }
    };

    const getStatusMessage = () => {
        if (message) return message;
        if (status === 'processing') return t('POS.Processing') + '...';
        switch (status) {
            case 'success':
                return t('POS.CardPaymentSuccess');
            case 'error':
                return t('POS.CardPaymentError');
            default:
                return t('POS.Processing');
        }
    };

    const getStatusColor = () => {
        switch (status) {
            case 'success':
                return '#4caf50';
            case 'error':
                return '#f44336';
            default:
                return '#8B7D6B';
        }
    };

    return (
        <Modal
            open={open}
            onClose={(e, reason) => {
                if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
                    return;
                }
                onClose?.();
            }}
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(8px)',
                backgroundColor: 'rgba(83, 83, 83, 0.04)',
            }}
        >
            <Fade in={open} timeout={300}>
                <Box
                    sx={{
                        position: 'relative',
                        width: 400,
                        maxWidth: '90vw',
                        backgroundColor: 'white',
                        borderRadius: 4,
                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.43)',
                        overflow: 'hidden',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 4,
                            background: `linear-gradient(90deg, ${getStatusColor()}, #e3f2fd)`,
                        },
                    }}
                >
                    {/* {!isCancellingPayment && (
                        <IconButton
                            sx={{ position: 'absolute', top: 2, right: 2, zIndex: 1000 }}
                            onClick={onClose}
                            disableFocusRipple
                            disableRipple
                            disableTouchRipple
                        >
                            <Close />
                        </IconButton>
                    )} */}
                    {/* Animated Background Pattern */}
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: `
                                radial-gradient(circle at 20% 20%, rgba(25, 118, 210, 0.1) 0%, transparent 50%),
                                radial-gradient(circle at 80% 80%, rgba(76, 175, 80, 0.1) 0%, transparent 50%),
                                radial-gradient(circle at 40% 60%, rgba(156, 39, 176, 0.1) 0%, transparent 50%)
                            `,
                            animation: 'float 6s ease-in-out infinite',
                            '@keyframes float': {
                                '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
                                '50%': { transform: 'translateY(-10px) rotate(1deg)' },
                            },
                        }}
                    />

                    <Stack
                        spacing={3}
                        alignItems="center"
                        sx={{
                            p: 4,
                            position: 'relative',
                            zIndex: 1,
                        }}
                    >
                        {/* Main Icon with Animation */}
                        <Box
                            sx={{
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            {/* Pulsing Ring Animation */}
                            {status === 'processing' && (
                                <>
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            width: 120,
                                            height: 120,
                                            borderRadius: '50%',
                                            border: `3px solid ${getStatusColor()}`,
                                            opacity: 0.3,
                                            animation: 'pulse 2s ease-in-out infinite',
                                            '@keyframes pulse': {
                                                '0%': { transform: 'scale(0.8)', opacity: 0.3 },
                                                '50%': { transform: 'scale(1.2)', opacity: 0.1 },
                                                '100%': { transform: 'scale(0.8)', opacity: 0.3 },
                                            },
                                        }}
                                    />
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            width: 100,
                                            height: 100,
                                            borderRadius: '50%',
                                            border: `2px solid ${getStatusColor()}`,
                                            opacity: 0.5,
                                            animation: 'pulse 2s ease-in-out infinite 0.5s',
                                        }}
                                    />
                                </>
                            )}

                            {/* Main Icon */}
                            <Zoom in={true} timeout={500}>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: 100,
                                        height: 100,
                                        borderRadius: '50%',
                                        backgroundColor: `${getStatusColor()}15`,
                                        animation: status === 'processing' ? 'bounce 2s ease-in-out infinite' : 'none',
                                        '@keyframes bounce': {
                                            '0%, 100%': { transform: 'translateY(0px)' },
                                            '50%': { transform: 'translateY(-5px)' },
                                        },
                                    }}
                                >
                                    {status === 'processing' ? (
                                        <CircularProgress
                                            size={50}
                                            thickness={3}
                                            sx={{
                                                color: getStatusColor(),
                                                animation: 'spin 1s linear infinite',
                                                '@keyframes spin': {
                                                    '0%': { transform: 'rotate(0deg)' },
                                                    '100%': { transform: 'rotate(360deg)' },
                                                },
                                            }}
                                        />
                                    ) : (
                                        getStatusIcon()
                                    )}
                                </Box>
                            </Zoom>
                        </Box>

                        {/* Status Message */}
                        <Slide direction="up" in={true} timeout={700}>
                            <Stack spacing={1} alignItems="center">
                                <Typography
                                    variant="h5"
                                    sx={{
                                        fontWeight: 600,
                                        color: getStatusColor(),
                                        textAlign: 'center',
                                        animation: status === 'processing' ? 'glow 2s ease-in-out infinite' : 'none',
                                        '@keyframes glow': {
                                            '0%, 100%': { textShadow: `0 0 5px ${getStatusColor()}40` },
                                            '50%': { textShadow: `0 0 20px ${getStatusColor()}80` },
                                        },
                                    }}
                                >
                                    {getStatusMessage()}
                                </Typography>

                                {status === 'processing' && (
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: '#666',
                                            textAlign: 'center',
                                            animation: 'fadeInOut 2s ease-in-out infinite',
                                            '@keyframes fadeInOut': {
                                                '0%, 100%': { opacity: 0.6 },
                                                '50%': { opacity: 1 },
                                            },
                                        }}
                                    >
                                        {t('POS.PleaseWait')}
                                    </Typography>
                                )}

                                {/* Animated Dots */}
                                {status === 'processing' && (
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            gap: 1,
                                            '& > div': {
                                                width: 8,
                                                height: 8,
                                                borderRadius: '50%',
                                                backgroundColor: getStatusColor(),
                                                animation: 'wave 1.5s ease-in-out infinite',
                                                '@keyframes wave': {
                                                    '0%, 100%': { transform: 'scale(1)', opacity: 0.5 },
                                                    '50%': { transform: 'scale(1.5)', opacity: 1 },
                                                },
                                            },
                                            '& > div:nth-of-type(2)': {
                                                animationDelay: '0.2s',
                                            },
                                            '& > div:nth-of-type(3)': {
                                                animationDelay: '0.4s',
                                            },
                                        }}
                                    >
                                        <div />
                                        <div />
                                        <div />
                                    </Box>
                                )}
                            </Stack>
                        </Slide>

                        {/* Progress Bar for Processing */}
                        {status === 'processing' && (
                            <Box
                                sx={{
                                    width: '100%',
                                    height: 4,
                                    backgroundColor: '#e0e0e0',
                                    borderRadius: 2,
                                    overflow: 'hidden',
                                    position: 'relative',
                                }}
                            >
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        height: '100%',
                                        width: '100%',
                                        background: `linear-gradient(90deg, ${getStatusColor()}, #e3f2fd)`,
                                        borderRadius: 2,
                                        animation: 'progress 3s ease-in-out infinite',
                                        '@keyframes progress': {
                                            '0%': { transform: 'translateX(-100%)' },
                                            '100%': { transform: 'translateX(100%)' },
                                        },
                                    }}
                                />
                            </Box>
                        )}
                    </Stack>

                    <Stack sx={{ p: 2 }} spacing={2}>
                        {showRetryButton && onRetry && (
                            <POSButton
                                variant="save"
                                onClick={onRetry}
                                title={t('POS.Retry')}
                                width={{ xs: '100%', md: 'auto' }}
                                sx={{
                                    bgcolor: '#1976d2',
                                    color: 'white',
                                    '&:hover': {
                                        bgcolor: '#1565c0',
                                    },
                                }}
                                icon={<Refresh />}
                            />
                        )}
                        {showCancelButton && (
                            <POSButton
                                variant="save"
                                onClick={onCancel}
                                title={
                                    isCancellingPayment ? (
                                        <Stack
                                            sx={{ display: 'flex', alignItems: 'center', flexDirection: 'row', gap: 1 }}
                                        >
                                            {' '}
                                            <CircularProgress size={20} sx={{ color: 'inherit' }} />{' '}
                                            {t('POS.Cancelling')}{' '}
                                        </Stack>
                                    ) : (
                                        t('Setting.Cancel')
                                    )
                                }
                                width={{ xs: '100%', md: 'auto' }}
                                sx={{ bgcolor: '#d2d2d2' }}
                            />
                        )}
                    </Stack>
                </Box>
            </Fade>
        </Modal>
    );
};

export default CardTerminalLoadingModal;
