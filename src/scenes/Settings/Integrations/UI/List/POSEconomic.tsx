import { AppBar, Box, CircularProgress, Typography } from '@mui/material';
import { t } from 'i18next';
import { useEffect, useState, useCallback, useRef } from 'react';
import { api } from '@/utils/Api/POS';
import POSButton from '@/components/POS/Common/POSButton';
import EconomicConfiguration from '../../Components/EconomicConfiguration';
import { toast } from 'react-toastify';
import { PutApiEconomicConfigBody } from '@/shared/api/models';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const EconomicBox = () => {
    const [isLoading, setLoading] = useState(false);
    const [formData, setFormData] = useState({});
    const [initalValues, setInitialValues] = useState(null);
    const [isChanges, setIsChanges] = useState(false);
    const hasProcessedToken = useRef(false);
    const setting = useSelector((state: any) => state.settings.data);
    const navigate = useNavigate();

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const response: any = await api.getApiEconomicConfig();

            setInitialValues(response.data);
            setFormData(response.data);
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const postTokenOnce = useCallback(async (apiToken: string) => {
        if (hasProcessedToken.current) {
            return;
        }
        hasProcessedToken.current = true;
        try {
            setLoading(true);
            await api.postApiEconomicConnect({ agreementGrantToken: apiToken });
            toast.success(t('Integration.EconomicConnectSuccess') || 'Economic connected successfully');
        } catch (error) {
            console.error('Token error:', error);
            toast.error(t('Integration.EconomicConnectFailed') || 'Failed to connect Economic');
            hasProcessedToken.current = false;
        } finally {
            setLoading(false);
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, []);

    const handleSaveChanges = async () => {
        setLoading(true);
        try {
            const finalPayload = formData as PutApiEconomicConfigBody;

            await api.putApiEconomicConfig(finalPayload);
            await fetchData();

            toast.success(t('Integration.SuccessConfig'));
        } catch (error) {
            console.error('PUT error:', error);
            toast.error(t('Integration.FailedConfig'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const url = new URL(window.location.href);
        const token = url.searchParams.get('token');

        const init = async () => {
            if (token && !hasProcessedToken.current) {
                await postTokenOnce(token);
            }
            await fetchData();
        };
        init();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!initalValues) return;
        setIsChanges(JSON.stringify(formData) !== JSON.stringify(initalValues));
    }, [formData, initalValues]);

    useEffect(() => {
        if (!setting?.profile?.inspection_module) {
            navigate('/pos/integration');
        }
    }, []);

    return (
        <Box p={4.5}>
            <>
                {isChanges && (
                    <AppBar
                        sx={{
                            position: 'fixed',
                            top: 45,
                            left: 0,
                            right: 0,
                            py: 1,
                            px: 4,
                            bgcolor: '#fff',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            alignItems: 'flex-end',
                            width: '100%',
                            zIndex: 8,
                        }}
                    >
                        <POSButton
                            onClick={handleSaveChanges}
                            variant="save"
                            width="auto"
                            height={35}
                            title={t('Setting.SaveChanges')}
                            loading={isLoading}
                            disabled={isLoading}
                        />
                    </AppBar>
                )}

                <Box sx={{ mt: isChanges ? 7 : 0 }}>
                    <Typography fontWeight={700} sx={{ fontSize: '22px', mb: 2 }}>
                        {t('Integration.Economic')}
                    </Typography>

                    {setting?.profile?.inspection_module && (
                        <EconomicConfiguration formData={formData} setFormData={setFormData} isLoading={isLoading} />
                    )}
                </Box>
            </>
        </Box>
    );
};

export default EconomicBox;
