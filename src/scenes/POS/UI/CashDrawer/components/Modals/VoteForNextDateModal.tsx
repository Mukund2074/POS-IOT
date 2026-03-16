import POSButton from '@/components/POS/Common/POSButton';
import POSDatePicker from '@/components/POS/Common/POSDatePicker';
import POSHeading from '@/components/POS/Common/POSHeading';
import POSInput from '@/components/POS/Common/POSInput';
import { Close } from '@mui/icons-material';
import { IconButton, Modal, Paper, Stack } from '@mui/material';
import { t } from 'i18next';
import moment, { Moment } from 'moment';
import React from 'react';
import POSSelect from '@/components/POS/Common/POSSelect';

type Props = {
    open: boolean;
    onClose: () => void;
    startDate: string;
    endDate: string;
    onUpdate: (endDate: Moment | null) => void;
    timeSlots: string[];
    selectedTimeSlot: string;
    setSelectedTimeSlot: (timeSlot: string) => void;
};

const VoteForNextDateModal = ({
    open,
    onClose,
    startDate,
    endDate,
    onUpdate,
    timeSlots,
    selectedTimeSlot,
    setSelectedTimeSlot,
}: Props) => {
    const [endDateValue, setEndDateValue] = React.useState<Moment | null>(moment(endDate));
    const [hours, minutes] = selectedTimeSlot.split(':').map(Number);
    const EndDateMoment = moment(endDateValue).set({ hour: hours, minute: minutes });
    const isPastClose = EndDateMoment.isBefore(moment(startDate));

    return (
        <Modal
            open={open}
            onClose={onClose}
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <Paper
                sx={{
                    backgroundColor: '#fff',
                    borderRadius: 2,
                    boxShadow: 24,
                    p: 4,
                    width: { xs: '100%', sm: '70%', md: '50%' },
                    maxWidth: '98%',
                    mx: 'auto',
                    my: 'auto',
                    position: 'relative',
                    maxHeight: '90%',
                    overflow: 'hidden',
                    overflowY: 'scroll',
                    scrollbarWidth: 'none',
                }}
            >
                <IconButton
                    size="small"
                    onClick={onClose}
                    sx={{ position: 'absolute', top: 16, right: 16, zIndex: 1 }}
                    disableRipple
                    disableFocusRipple
                    disableTouchRipple
                >
                    <Close />
                </IconButton>

                <Stack alignItems="start" spacing={4}>
                    <POSHeading
                        text={'Update period'}
                        fontColor="#1F1F1F"
                        fontSize="22px"
                        variant="h6"
                        sx={{ position: 'absolute', top: 16, left: 16, zIndex: 1 }}
                    />

                    <Stack spacing={1} width={{ xs: '100%' }}>
                        <POSHeading text={`From`} fontColor="#1F1F1F" fontSize="16px" variant="h6" />
                        <POSInput
                            value={moment(startDate).format('DD/MM/YYYY HH:mm')}
                            onChange={() => {}}
                            disabled={true}
                            sx={{
                                width: { xs: '100%', md: '50%' },
                            }}
                        />
                    </Stack>

                    <Stack spacing={1} width={'100%'}>
                        <POSHeading text={`To`} fontColor="#1F1F1F" fontSize="16px" variant="h6" />
                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} width={'100%'}>
                            <POSDatePicker
                                value={endDateValue ? moment(endDateValue) : moment()}
                                onChange={(date) => {
                                    setEndDateValue(moment(date));
                                }}
                                minDate={moment(startDate)}
                                format="DD/MM/YYYY"
                                maxDate={moment(new Date())}
                                sx={{ borderRadius: 2, minWidth: { xs: '100%', md: '50%' } }}
                            />

                            <POSSelect
                                options={timeSlots.map((slot: string) => {
                                    return {
                                        label: slot.split(' - ')[0],
                                        value: slot.split(' - ')[0],
                                    };
                                })}
                                value={selectedTimeSlot}
                                onChange={(e) => {
                                    setSelectedTimeSlot(e.target.value as string);
                                }}
                                borderColor="#D9D9D9"
                                borderThickness="1px"
                                sx={{
                                    width: { sm: '100%', md: '35%' },
                                }}
                                error={isPastClose}
                                helperText={isPastClose ? t('POS.CloseTimeSlotError') : ''}
                            />
                        </Stack>
                    </Stack>
                </Stack>
                <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    spacing={2}
                    mt={6}
                    justifyContent={'center'}
                    alignItems={'center'}
                >
                    <POSButton
                        title={t('POS.Close')}
                        onClick={onClose}
                        variant="f_outline"
                        titleColor="#000"
                        width={{
                            xs: '100%',
                            sm: 'auto',
                        }}
                    />
                    <POSButton
                        disabled={isPastClose}
                        title={t('GiftCard.update') + ' ' + t('POS.CashDrawerBadge2Text').toLowerCase()}
                        onClick={() => {
                            onUpdate(endDateValue);
                        }}
                        variant="save"
                    />
                </Stack>
            </Paper>
        </Modal>
    );
};

export default VoteForNextDateModal;
