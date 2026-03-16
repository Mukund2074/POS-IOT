import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    ListItem,
    Box,
    Modal,
    CircularProgress,
    IconButton,
    Grid,
    Typography,
    Checkbox,
    FormControlLabel,
    Paper,
    ListItemText,
    TextField,
    Stack,
    Dialog,
    DialogTitle,
    DialogContent,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import axios from 'axios';
import { toast } from 'react-toastify';

import CustomTextField from '../settings/commonTextinput';
import SecondaryHeading from '../settings/commonSecondaryHeading';
import CommonButton from '../settings/commonButton';
import serviceNameIcon from '../../assets/nameOfServiceIcon.png';
import { t } from 'i18next';
import FSwitch from '../commonComponents/f-switch';
import { CheckCircle, CopyAll } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import GroupServiceDrivingFees from './GroupServiceDrivingFees';
import apiFetcher2 from '../../utils/Api/POS/Interceptor2';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '75%',
    bgcolor: '#FFFFFF',
    borderRadius: 3,
    boxShadow: 0,
    p: 3.5,
};

function ServiceGroupModal(props) {
    const { open, handleClose, serviceList, type, selectedServiceGroup } = props;
    const authTokenUser = localStorage.getItem('auth_token');
    const [isLoading, setLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [serviceGroupName, setServiceGroupName] = useState('');
    const [selectedIds, setSelectedIds] = useState([]);
    const [showError, setShowError] = useState(false);
    const [marketplaceHide, setMarketplaceHide] = useState(selectedServiceGroup?.marketplace_hidden);
    const [copyStatus, setCopyStatus] = useState('initial');
    const [groupCharges, setGroupCharges] = useState('');
    const settings = useSelector((state) => state.settings.data);

    const tabs = [
        { id: 1, tabName: t('Services.ServiceGroups') },
        { id: 2, tabName: t('Services.DrivingFees') },
    ];

    const [selectedTab, setSelectedTab] = useState(1);

    const callServiceGroupApiById = async () => {
        setLoading(true);
        try {
            const response = await apiFetcher2.get(`/api/service-groups/${selectedServiceGroup.groupId}/driving-fees`);
            setGroupCharges(response?.data);
        } catch (error) {
            console.error('Error : ', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        callServiceGroupApiById();
    }, []);

    // useEffect(() => {
    // if (selectedServiceGroup) {
    // setServiceGroupName(selectedServiceGroup?.title);
    // const ids = selectedServiceGroup?.data?.map(item => parseInt(item.id, 10));
    // setSelectedIds(ids);
    // }
    // }, [selectedServiceGroup]);

    useEffect(() => {
        if (selectedServiceGroup) {
            setServiceGroupName(selectedServiceGroup?.title);
            const ids = selectedServiceGroup?.services?.map((service) => parseInt(service.id, 10));
            setSelectedIds(ids);
        }
    }, [selectedServiceGroup]);

    const onSavePress = async () => {
        if (serviceGroupName == '') {
            setShowError(true);
            return;
        }

        if (type == 'create') {
            callCreateServiceGroupApi();
        } else {
            callUpdateServiceGroupApi();
        }
    };

    const callCreateServiceGroupApi = async () => {
        setLoading(true);
        try {
            const data = {
                group: serviceGroupName,
                marketplace_hidden: marketplaceHide,
                services: selectedIds,
            };

            const response = await axios.post(`${process.env.REACT_APP_URL}/api/v1/store/service_group`, data, {
                headers: {
                    Authorization: `Bearer ${authTokenUser}`,
                },
            });

            if (response !== undefined) {
                if (response.data.success) {
                    toast.success(t('Services.ToastSuccessSrvGrp'));
                    resetFields('Callapi');
                    // setTimeout(() => {
                    // resetFields('Callapi');
                    // }, 2000);
                } else {
                    toast.error(t('Services.ToastErrCreateSrvGrp'));
                    setLoading(false);
                }
            }
        } catch (error) {
            toast.error(t('Services.ToastErrCreateSrvGrp'));
            setLoading(false);
            console.error('Error fetching service data:', error);
        } finally {
            setLoading(false);
        }
    };

    const callUpdateServiceGroupApi = async () => {
        try {
            const data = {
                group: serviceGroupName,
                marketplace_hidden: marketplaceHide,
                services: selectedIds,
            };

            const response = await axios.patch(
                `${process.env.REACT_APP_URL}/api/v1/store/service_group/${selectedServiceGroup?.groupId}`,
                data,
                {
                    headers: {
                        Authorization: `Bearer ${authTokenUser}`,
                    },
                },
            );

            if (response !== undefined) {
                if (response.data.success) {
                    toast.success(t('Services.ToastUpSuccessSrvGrp'));
                    resetFields('Callapi');
                    // setTimeout(() => {
                    // resetFields('Callapi');
                    // }, 2000);
                } else {
                    toast.error(t('Services.ToastErrUpdateSrvGrp'));
                    setLoading(false);
                }
            }
        } catch (error) {
            toast.error(t('Services.ToastErrUpdateSrvGrp'));
            console.error('Error fetching service data:', error);
        } finally {
            setLoading(false);
        }
    };

    const deleteServiceGroup = async () => {
        setDeleteLoading(true);
        try {
            const response = await axios.delete(
                `${process.env.REACT_APP_URL}/api/v1/store/service_group/${selectedServiceGroup?.groupId}`,
                {
                    headers: {
                        Authorization: `Bearer ${authTokenUser}`,
                    },
                },
            );

            if (response.status == 200) {
                toast.success(t('Services.ToastSuccessDeleteServiceGroup'));
                resetFields('Callapi');
                // setTimeout(() => {
                // resetFields('Callapi');
                // }, 2000);
            } else {
                setDeleteLoading(false);
                toast.error(t('Services.ToastErrDeleteSGroup'));
            }
        } catch (error) {
            toast.error(t('Services.ToastErrDeleteSGroup'));
            setDeleteLoading(false);
            console.error('ERROR ', error);
        }
    };

    const resetFields = (command) => {
        setServiceGroupName('');
        setSelectedIds([]);
        handleClose(command);
        setLoading(false);
        setDeleteLoading(false);
    };

    const handleCloseModal = (event, reason) => {
        if (reason === 'backdropClick') {
            return;
        }
    };

    const handleCircleClick = (id) => {
        setSelectedIds((prevSelectedIds) => {
            if (prevSelectedIds.includes(id)) {
                return prevSelectedIds.filter((selectedId) => selectedId !== id);
            } else {
                return [...prevSelectedIds, id];
            }
        });
    };

    const handleCopy = async () => {
        setCopyStatus('started');
        const timeout = setTimeout(async () => {
            try {
                await navigator.clipboard.writeText(
                    `${process.env.REACT_APP_MARKETPLACE_URL ?? 'https://bahlou.dk/'}klinik/${settings?.profile?.web_store_name}?cid=${selectedServiceGroup?.groupId}`,
                );
                setCopyStatus('success');
            } catch (error) {
                setCopyStatus('failed');
            }
            const timeout = setTimeout(() => {
                setCopyStatus('initial');
            }, 2000);
            return () => clearTimeout(timeout);
        }, 1000);
        return () => clearTimeout(timeout);
    };

    const RenderComponent = () => {
        if (selectedTab === 1) {
            return (
                <React.Fragment>
                    <Box
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'flex-start',
                            alignItems: 'center',
                            marginTop: '20px',
                        }}
                    >
                        <img src={serviceNameIcon} style={{ width: '23px', height: '22px', marginRight: 10 }} alt="" />
                        <Typography variant="body1" sx={{ color: '#6F6F6F', width: '100%' }}>
                            {t('Services.SrvGrpName')}
                        </Typography>
                    </Box>

                    <Stack style={{ width: '100%', marginBottom: 20 }}>
                        <CustomTextField
                            value={serviceGroupName}
                            onChange={(event) => {
                                setShowError(false);
                                setServiceGroupName(event.target.value);
                            }}
                            placeholder={t('Services.PlaceHLDSrvGrp')}
                            placeholderFontSize={'16px'}
                            inputFontSize={'16px'}
                            borderColor={'#A79C92'}
                            borderThickness={'1px'}
                            height={40}
                        />
                        {showError && (
                            <Typography variant="caption" style={{ color: 'red' }}>
                                {t('Services.GrpErr')}
                            </Typography>
                        )}

                        <FSwitch
                            sx={{ mt: 2 }}
                            label={
                                <Typography variant="body1" sx={{ color: '#6F6F6F', width: '100%' }}>
                                    {' '}
                                    {t('Services.marketHide')}
                                </Typography>
                            }
                            checked={marketplaceHide}
                            onChange={(e) => {
                                setMarketplaceHide(e.target.checked);
                            }}
                        />

                        {type == 'edit' && (
                            <Stack position={'relative'} p={0} m={0}>
                                <CustomTextField
                                    width={'100%'}
                                    value={`${process.env.REACT_APP_MARKETPLACE_URL ?? 'https://bahlou.dk/'}klinik/${settings?.profile?.web_store_name}?cid=${selectedServiceGroup?.groupId}`}
                                    readOnly={true}
                                    disabled
                                    inputFontSize={'16px'}
                                    borderColor={'#A79C92'}
                                    borderThickness={'1px'}
                                    height={40}
                                />
                                <IconButton
                                    disableTouchRipple
                                    disableFocusRipple
                                    disableRipple
                                    sx={{ position: 'absolute', right: 4, top: '60%', transform: 'translateY(-50%)' }}
                                    onClick={handleCopy}
                                >
                                    {copyStatus === 'started' ? (
                                        <CircularProgress size={20} />
                                    ) : copyStatus === 'success' ? (
                                        <CheckCircle color="success" />
                                    ) : (
                                        <CopyAll />
                                    )}
                                </IconButton>
                            </Stack>
                        )}
                    </Stack>

                    <Box
                        sx={{
                            overflow: 'scroll',
                            maxHeight: '60vh',
                            paddingBottom: 8,
                            scrollbarWidth: 'none',
                            '&::-webkit-scrollbar': {
                                display: 'none',
                            },
                        }}
                    >
                        {Object.keys(serviceList).map((groupId) => {
                            const group = serviceList[groupId];
                            return (
                                <Stack key={groupId}>
                                    <Typography variant="body1" sx={{ fontWeight: 700, color: '#1f1f1f', mt: 2 }}>
                                        {group.title}
                                    </Typography>

                                    {group.services.map((serviceItem) => (
                                        <Stack
                                            key={serviceItem.id}
                                            flex={1}
                                            flexDirection={{ xs: 'column', sm: 'row' }}
                                            alignItems={'center'}
                                            justifyContent={'flex-start'}
                                            width={'100%'}
                                            p={1}
                                            sx={{
                                                borderRadius: '15px',
                                                border: '1.5px solid #D9D9D9',
                                            }}
                                            my={0.5}
                                            onClick={() => handleCircleClick(serviceItem.id)}
                                        >
                                            {/* <Stack pr={2} flexDirection={{ xs: 'column', md: 'row' }} display={'flex'} justifyContent={'flex-start'} alignItems={{ md: 'center' }}> */}
                                            <IconButton
                                                disableRipple
                                                sx={{
                                                    width: 24,
                                                    height: 24,
                                                    borderRadius: '50%',
                                                    border: '2px solid #F7C098',
                                                    backgroundColor: selectedIds.includes(serviceItem.id)
                                                        ? '#F7C098'
                                                        : 'white',
                                                    position: 'relative',
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    opacity: 1,
                                                    marginLeft: 1,
                                                    transition: 'background-color 0.3s ease, border 0.3s ease',
                                                    '&:hover': {
                                                        border: '2px solid #F7C098',
                                                    },
                                                }}
                                            >
                                                {selectedIds.includes(serviceItem.id) && (
                                                    <Typography
                                                        sx={{
                                                            fontSize: '12px',
                                                            color: '#fff',
                                                            fontWeight: 'bold',
                                                        }}
                                                    >
                                                        {selectedIds.indexOf(serviceItem.id) + 1}
                                                    </Typography>
                                                )}
                                            </IconButton>

                                            {/* </Stack> */}

                                            {/* <Stack flexDirection={{ xs: 'column', md: 'row' }} justifyContent={'flex-start'} alignItems={{ md: 'center' }}> */}
                                            <Typography
                                                variant="body1"
                                                sx={{
                                                    fontWeight: 400,
                                                    color: '#A0A0A0',
                                                    // whiteSpace: { xs: 'nowrap', sm: 'normal', md: 'nowrap', lg: 'normal' },
                                                    // whiteSpace: 'nowrap',
                                                    // overflow: 'hidden',
                                                    pr: { sm: 6 },
                                                    pl: { sm: 2 },
                                                    textOverflow: 'ellipsis',
                                                }}
                                            >
                                                {serviceItem.name}
                                            </Typography>

                                            <Typography
                                                variant="body1"
                                                sx={{
                                                    // width: '50%',
                                                    fontWeight: 400,
                                                    fontSize: '16px',
                                                    color: '#A0A0A0',
                                                    ml: { sm: 'auto' },
                                                    px: { sm: 6 },
                                                }}
                                            >
                                                {serviceItem.duration_text}
                                            </Typography>

                                            <Typography
                                                variant="body1"
                                                sx={{
                                                    // width: '50%',
                                                    fontWeight: 400,
                                                    fontSize: '16px',
                                                    color: '#367B3D',
                                                    px: { sm: 6 },
                                                }}
                                            >
                                                {`${serviceItem.price}kr.`}
                                            </Typography>
                                            {/* </Stack> */}
                                        </Stack>
                                    ))}
                                </Stack>
                            );
                        })}
                    </Box>

                    <Stack
                        sx={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            p: { xs: 2, sm: 4 },
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            flexDirection: { xs: 'column', md: 'row' },
                            gap: 2,
                            alignItems: { md: 'center' },
                            backgroundColor: 'white',
                        }}
                    >
                        <CommonButton
                            width={{ xs: '100%', md: '40%' }}
                            height="40px"
                            disabled={isLoading || deleteLoading}
                            title={
                                isLoading ? (
                                    <CircularProgress
                                        size={24}
                                        sx={{
                                            color: 'white',
                                            position: 'absolute',
                                            top: '50%',
                                            left: '50%',
                                            marginTop: '-12px',
                                            marginLeft: '-12px',
                                        }}
                                    />
                                ) : type === 'create' ? (
                                    t('Services.CreateGrp')
                                ) : (
                                    t('Services.UpdateGrp')
                                )
                            }
                            onClick={onSavePress}
                        />

                        {type == 'edit' && selectedServiceGroup?.groupId != 0 && (
                            <CommonButton
                                width={{ xs: '100%', md: '40%' }}
                                height="40px"
                                disabled={deleteLoading || isLoading}
                                title={
                                    deleteLoading ? (
                                        <CircularProgress
                                            size={24}
                                            sx={{
                                                color: 'white',
                                                position: 'absolute',
                                                top: '50%',
                                                left: '50%',
                                                marginTop: '-12px',
                                                marginLeft: '-12px',
                                            }}
                                        />
                                    ) : (
                                        t('Services.DeleteGrp')
                                    )
                                }
                                backgroundColor={'#D30000'}
                                onClick={(event) => {
                                    event.stopPropagation();
                                    deleteServiceGroup();
                                }}
                            />
                        )}
                    </Stack>
                </React.Fragment>
            );
        } else if (selectedTab === 2) {
            return (
                <GroupServiceDrivingFees
                    serviceGroup={groupCharges}
                    selectedServiceGroup={selectedServiceGroup}
                    handleClose={handleClose}
                />
            );
        }
    };

    return (
        <Modal
            disableAutoFocus
            open={open}
            onClose={handleClose}
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
            <Paper
                sx={{
                    width: { xs: '90%', md: '50%' },
                    maxHeight: '80%',
                    display: 'flex',
                    overflow: 'hidden',
                    flexDirection: 'column',
                    position: 'relative',
                    borderRadius: 8,
                    py: 4,
                    px: 2,
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        width: '100%',
                        borderBottom: `${settings?.profile?.inspection_module ? '1px solid #0000001f' : '0'}`,
                    }}
                >
                    <Box sx={{ display: 'flex', gap: 4 }}>
                        {type === 'create' ? (
                            <Typography
                                borderBottom={'3px solid #BBB0A4'}
                                sx={{
                                    cursor: 'pointer',
                                    fontSize: '1rem',
                                    fontWeight: 700,
                                    color: '#bbb0a4',
                                    display: settings?.profile?.inspection_module ? 'block' : 'none',
                                }}
                            >
                                {tabs[0]?.tabName}
                            </Typography>
                        ) : (
                            tabs?.map((tab) => (
                                <Typography
                                    sx={{
                                        borderBottom: selectedTab === tab?.id ? '3px solid #BBB0A4' : 'none',
                                        cursor: 'pointer',
                                        fontSize: '1rem',
                                        fontWeight: selectedTab === tab?.id ? 700 : 500,
                                        color: '#BBB0A4',
                                        display: settings?.profile?.inspection_module ? 'block' : 'none',
                                    }}
                                    onClick={() => setSelectedTab(tab?.id)}
                                >
                                    {tab?.tabName}
                                </Typography>
                            ))
                        )}
                    </Box>
                    <IconButton
                        edge="end"
                        color="inherit"
                        onClick={() => resetFields()}
                        aria-label="close"
                        sx={{
                            position: 'absolute',
                            top: '10px',
                            right: '30px',
                            zIndex: 10,
                            color: 'black',
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>

               {RenderComponent()}
            </Paper>
        </Modal>
    );
}

export default ServiceGroupModal;
