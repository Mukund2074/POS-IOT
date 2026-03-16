import { Close } from '@mui/icons-material';
import { CircularProgress, IconButton, Modal, Paper, Stack } from '@mui/material';
import React, { useEffect, useState } from 'react';
import FPrimaryHeading from '../../../commonComponents/F_PrimaryHeading';
import { t } from 'i18next';
import moment from 'moment';
import { DropDown } from '../../../insight/customDropDown';
import FSelect from '../../../commonComponents/F_Select';
import FButton from '../../../commonComponents/F_Button';
import FSwitch from '../../../commonComponents/f-switch';
import { ExportBookingsApi } from '../../../../utils/Api/Settings';
import CustomSelect from '../../commonCustomSelect';
import { useSelector } from 'react-redux';
import apiFetcher from '../../../../utils/interCeptor';

export default function ExportBookings({ open, onClose = () => {}, showToast = () => {} }) {
    const bookingStatus = [
        { label: 'Pending bookings', value: 'BOOKED' },
        { label: 'Rescheduled bookings', value: 'RESCHEDULED' },
        { label: 'Rescheduled to', value: 'RESCHEDULED_TO' },
        { label: 'Completed bookings', value: 'COMPLETED' },
        { label: 'Cancelled bookings', value: 'CANCELLED' },
        { label: 'Awaiting new customer', value: 'OFFERED' },
        { label: 'Cancellation offer accepted', value: 'OFFER_ACCEPTED' },
        { label: 'Deleted bookings', value: 'DELETED' },
        { label: 'Absence bookings', value: 'NOSHOW' },
        { label: 'Auto completed bookings', value: 'AUTOCOMPLETED' },
    ];

    const [selectedStatus, setSelectedStatus] = useState([]);
    const [startDate, setStartDate] = useState(moment());
    const [endDate, setEndDate] = useState(moment());
    const [isLoading, setIsLoading] = useState(false);
    const [dateType, setDateType] = useState('booking'); // 'booking' or 'created'
    const [serviceGroup, setServiceGroup] = useState([]);
    const [selectedServiceGroup, setSelectedServiceGroup] = useState([]);
    let allID = serviceGroup?.map((data) => data.value);

    const handleClose = () => {
        onClose();
        setSelectedStatus([]);
        setStartDate(moment());
        setEndDate(moment());
        setDateType('booking');
    };

    const employeeFromStore = useSelector((state) => state.settings.data.employees);
    const outletId = useSelector((state) => state.settings.data.profile?.id);

    const employeeOptions = [
        { label: t('Common.All'), value: 'ALL' },
        ...employeeFromStore.map((emp) => ({
            label: emp.name,
            value: emp.id,
        })),
    ];

    const [selectedEmployee, setSelectedEmployee] = useState('ALL');

    const handleSelect = (e) => {
        const selectedValues = e.target.value;
        let allID = bookingStatus?.map((data) => data.value);

        if ((selectedValues === 0 || selectedValues.includes(0)) && allID.length === selectedStatus.length) {
            setSelectedStatus([]);
        } else if (selectedValues === 0 || selectedValues.includes(0)) {
            setSelectedStatus(allID);
        } else if (selectedValues.length === 0) {
            setSelectedStatus([]);
        } else {
            setSelectedStatus(selectedValues);
        }
    };

    const handleServiceGroupSelect = (e) => {
        const selectedValues = e.target.value;

        if ((selectedValues === 0 || selectedValues.includes(0)) && allID.length === selectedServiceGroup.length) {
            setSelectedServiceGroup([]);
        } else if (selectedValues === 0 || selectedValues.includes(0)) {
            setSelectedServiceGroup(allID);
        } else if (selectedValues.length === 0) {
            setSelectedServiceGroup([]);
        } else {
            setSelectedServiceGroup(selectedValues);
        }
    };

    const handleSubmit = async () => {
        const params = {
            fromDate: startDate?.format('YYYY-MM-DD'),
            toDate: endDate?.format('YYYY-MM-DD'),
            status: selectedStatus?.length === bookingStatus?.length ? ['ALL'] : selectedStatus?.join(','),
            serviceId: selectedServiceGroup?.length === serviceGroup?.length ? null : selectedServiceGroup?.join(','),
            dateType: dateType,
            employeeId: selectedEmployee === 'ALL' ? '' : selectedEmployee,
        };
        try {
            setIsLoading(true);
            const response = await ExportBookingsApi({
                params,
                // ABCforsikring outlet id is 274 & include created by is true for production
                shouldIncludeCreatedBy: outletId === 274,
            });
            if (response) {
                const blob = new Blob([response.data], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `bookings_${moment().format('YYYY_MM_DD_HH_mm_ss')}.csv`;
                link.click();
                window.URL.revokeObjectURL(url);

                showToast(t('Setting.SuccessInExport'), 'success');
            }
        } catch (error) {
            showToast(t('Setting.ErrInExport'), 'error');
        } finally {
            setIsLoading(false);
            handleClose();
        }
    };

    const fetchServiceGroup = async () => {
        try {
            const response = await apiFetcher.get('/api/v1/store/service_group');
            setServiceGroup(
                response?.data?.data
                    .map((group) => group?.services)
                    .flat()
                    .map((service) => ({
                        label: service.name,
                        value: service.id,
                    })),
            );
        } catch (error) {
            console.error('Error : ', error);
        }
    };

    useEffect(() => {
        fetchServiceGroup();
    }, []);

    useEffect(() => {
        if (serviceGroup.length > 0) {
            setSelectedServiceGroup(serviceGroup.map((sg) => sg.value));
        }
    }, [serviceGroup]);

    const renderBtnText = () => {
        if (isLoading) {
            return (
                <Stack
                    sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1,
                    }}
                >
                    <CircularProgress size={20} sx={{ color: 'inherit' }} />
                    <FPrimaryHeading
                        text={t('Setting.Exporting')}
                        sx={{ fontSize: 16, fontWeight: 600, color: 'inherit' }}
                    />
                </Stack>
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
                    width: { xs: '90%', md: 'auto' },
                    minWidth: '40%',
                    display: 'flex',
                    borderRadius: 8,
                    flexDirection: 'column',
                    position: 'relative',
                    overflow: 'hidden',
                    p: 4,
                    overflowY: 'scroll',
                    scrollbarWidth: 'none',
                }}
            >
                <IconButton
                    disableRipple
                    disableFocusRipple
                    disableTouchRipple
                    sx={{ position: 'absolute', right: 8, top: 8, zIndex: 11 }}
                    onClick={onClose}
                >
                    <Close />
                </IconButton>

                <FPrimaryHeading text={t('Setting.ExportBookings')} />

                <FPrimaryHeading
                    sx={{ fontSize: 16, mt: 6, mb: 1, fontWeight: 600 }}
                    text={t('Setting.ChooseDateRange')}
                />
                <DropDown
                    show={true}
                    startdate={startDate}
                    endDate={endDate}
                    setStartDate={setStartDate}
                    setEndDate={setEndDate}
                />

                <Stack sx={{ mt: 2, mb: 2 }}>
                    <FSwitch
                        checked={dateType === 'created'}
                        onChange={(e) => setDateType(e.target.checked ? 'created' : 'booking')}
                        label="by booking create date"
                    />
                </Stack>

                <FPrimaryHeading sx={{ fontSize: 16, mt: 2, mb: 1, fontWeight: 600 }} text={t('Common.CapsEmployee')} />

                <CustomSelect
                    options={employeeOptions}
                    value={selectedEmployee}
                    onChange={(e) => {
                        setSelectedEmployee(e.target.value);
                    }}
                />

                <FPrimaryHeading
                    sx={{ fontSize: 16, fontWeight: 600, mt: 4, mb: 1 }}
                    text={t('Setting.ChooseBkType')}
                />
                <FSelect
                    selectAllRenderText={t('Setting.AllBks')}
                    isMultiSelect={true}
                    value={selectedStatus}
                    TextToDisplayWithCount={`${t('Setting.TypesSelected')}`}
                    onChange={handleSelect}
                    selectAllRenderCheckBoxText={t('Setting.AllBks')}
                    options={bookingStatus}
                />

                {/* Services dropdown */}
                <FPrimaryHeading sx={{ fontSize: 16, fontWeight: 600, mt: 4, mb: 1 }} text={t('Common.Service')} />
                <FSelect
                    selectAllRenderText={t('Services.AllServ')}
                    isMultiSelect={true}
                    value={selectedServiceGroup}
                    TextToDisplayWithCount={`${t('Setting.TypesSelected')}`}
                    onChange={handleServiceGroupSelect}
                    selectAllRenderCheckBoxText={t('Services.AllServ')}
                    options={serviceGroup}
                />

                <Stack
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mt: 4,
                        gap: 2,
                    }}
                >
                    <FButton
                        title={t('Setting.Cancel')}
                        variant={'save'}
                        onClick={() => {
                            handleClose();
                        }}
                        sx={{
                            width: { xs: '100%', md: '40%' },
                            bgcolor: '#d2d2d2',
                        }}
                    />
                    <FButton
                        title={isLoading ? renderBtnText() : t('Setting.ExportBookings')}
                        disabled={selectedStatus?.length === 0 || isLoading || selectedServiceGroup.length === 0}
                        variant={'save'}
                        onClick={() => {
                            handleSubmit();
                        }}
                        sx={{
                            width: { xs: '100%', md: '40%' },
                            bgcolor:
                                (selectedStatus?.length === 0 || isLoading || selectedServiceGroup.length === 0) &&
                                '#d2d2d2',
                        }}
                    />
                </Stack>
            </Paper>
        </Modal>
    );
}
