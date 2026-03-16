import { Box, Stack, Typography } from '@mui/material';
import React, { useMemo, useRef } from 'react';
import { eventChecker } from '../../utils/Functions';
import moment from 'moment';
import { t } from 'i18next';
import { useSelector } from 'react-redux';

export default function CalendarComponent({ controller, data, setOpenFormModel, selectedLanguage }) {
    // const [openFormModel, setOpenFormModel] = useState(false);
    // const [formProps, setFormProps] = useState({});
    const settings = useSelector((state) => state.settings.data);

    const sequnced_Emp = settings?.calendar?.employees;

    let employeesList = [];

    data?.employees_opening_hour?.forEach((empObj) => {
        employeesList.push({
            ...empObj,
            sequence: sequnced_Emp ? sequnced_Emp[empObj.id]?.sequence : 0,
            name: empObj?.name,
        });
    });

    if (sequnced_Emp) {
        employeesList.sort((a, b) => a.sequence - b.sequence);
    } else {
        employeesList.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
    }
    const refContainer = useRef();

    const handlePopup = ({ emp, weekday }) => {
        setOpenFormModel({
            openModel: true,
            formProps: {
                weekday,
                employee: emp,
                detailId: null,
                event: null,
            },
        });
    };

    const handleEventPopup = ({ emp, weekday, event }) => {
        // const event = getStartEndTime({ emp, date: weekday }).item;

        const formData = {
            weekday,
            employee: emp,
            detailId: event?.id ?? null,
            event: {
                ...event,
                end_break_time: event?.end_break_time
                    ? typeof event?.end_break_time == 'string'
                        ? moment(event?.end_break_time, 'HH:mm:ss')
                        : event?.end_break_time
                    : null,
                end_date: event?.end_date
                    ? typeof event?.end_date == 'string'
                        ? moment(event?.end_date, 'YYYY-MM-DD')
                        : event?.end_date
                    : null,
                end_time: event?.end_time
                    ? typeof event?.end_time == 'string'
                        ? moment(event?.end_time, 'HH:mm:ss')
                        : event?.end_time
                    : null,
                repeat: event?.repeat === null ? 'DO_NOT_REPEAT' : event?.repeat,
                start_break_time: event?.start_break_time
                    ? typeof event?.start_break_time == 'string'
                        ? moment(event?.start_break_time, 'HH:mm:ss')
                        : event?.start_break_time
                    : null,
                start_date: event?.start_date
                    ? typeof event?.start_date == 'string'
                        ? moment(event?.start_date, 'YYYY-MM-DD')
                        : event?.start_date
                    : null,
                start_time: event?.start_time
                    ? typeof event?.start_time == 'string'
                        ? moment(event?.start_time, 'HH:mm:ss')
                        : event?.start_time
                    : null,
            },
        };
        setOpenFormModel({
            openModel: event?.status !== 'off',
            openDeleteModal: event?.status === 'off',
            formProps: formData,
        });
    };

    const calendarWidth = useMemo(() => {
        if (refContainer.current) {
            return refContainer.current.offsetWidth;
            // setDimensions({
            //     width: refContainer.current.offsetWidth,
            //     height: refContainer.current.offsetHeight,
            // });
        }
        return 770;
    }, [controller]);

    return (
        <Box
            className="scrollbar-hidden"
            id="calendarOutline"
            ref={refContainer}
            sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(8, 1fr)',
                gridTemplateRows: '1fr',
                // minWidth: '100%',
                border: '1px solid #E0E0E0',
                borderRadius: 2,
                boxShadow: 1,
                maxHeight: '500px',

                overflow: 'scroll',
            }}
        >
            {(controller?.format === 'evenweek' && controller?.weekNumber % 2 !== 0) ||
            (controller?.format === 'oddweek' && controller?.weekNumber % 2 === 0) ? (
                <Stack
                    display={'grid'}
                    alignItems={'center'}
                    justifyContent={'center'}
                    height={'500px'}
                    position={'absolute'}
                    sx={{ borderRadius: 2 }}
                    bgcolor={'#D9D9D9cc'}
                    width={calendarWidth}
                    zIndex={20}
                >
                    <Typography
                        fontWeight={600}
                        bgcolor={'white'}
                        p={2}
                        borderRadius={2}
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        variant="body1"
                    >
                        This is an {controller?.format !== 'evenweek' ? 'Even Week' : 'Odd Week'}.{' '}
                        {t('Setting.PleaseProceedToNextWeek')}
                    </Typography>
                </Stack>
            ) : null}

            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: 60,
                        borderBottom: '1px solid #E0E0E0',
                        position: 'sticky',
                        top: 0,
                        zIndex: 1,
                        background: '#fff',
                    }}
                >
                    <Typography variant="body1">
                        {t('Setting.Weeks')} {controller?.weekNumber}
                    </Typography>
                </Box>
                {employeesList &&
                    employeesList.map((item, index) => {
                        return (
                            <Box
                                key={item.id}
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    borderBottom: '1px solid #E0E0E0',
                                    p: 2,
                                    height: 50,
                                    // maxWidth:120y
                                    // minheight: 50,
                                    // maxheight: 50,
                                }}
                            >
                                <Typography
                                    noWrap
                                    variant="body2"
                                    sx={{
                                        textAlign: 'center',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        display: '-webkit-box',
                                        WebkitLineClamp: '2',
                                        WebkitBoxOrient: 'vertical',
                                        lineHeight: 1.3,
                                    }}
                                >
                                    {`${item?.name}` || 'NOT AVAILABLE'}
                                </Typography>
                            </Box>
                        );
                    })}
            </Box>

            {controller?.weekDates?.map((weekday, index) => (
                <Box
                    key={index}
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        borderLeft: '1px solid #E0E0E0',
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: 60,
                            minWidth: 80,
                            position: 'sticky',
                            top: 0,
                            zIndex: 1,
                            background: '#fff',
                            borderBottom: '1px solid #E0E0E0',
                        }}
                    >
                        <Typography noWrap variant="body2" sx={{ fontWeight: 700 }}>
                            {moment(weekday).locale(selectedLanguage).format('ddd. DD. MMM')}
                        </Typography>
                    </Box>
                    {employeesList &&
                        employeesList.map((emp, index1) => {
                            const event = eventChecker(emp, controller, index);
                            if (event?.status === 'off') {
                                return (
                                    <Box
                                        key={emp.id}
                                        onClick={() => {
                                            handleEventPopup({ emp, weekday, event });
                                        }}
                                        sx={{
                                            height: 50,
                                            width: 'auto',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            pt: 1,
                                            pb: 1,
                                            borderTop: index1 === 0 ? null : '1px solid #E0E0E0',
                                            '& .appear-item': {
                                                display: 'none',
                                            },
                                            '&:hover .appear-item': {
                                                display: 'block',
                                            },
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                backgroundColor: '#d2d2d2',
                                                borderRadius: 2,
                                                p: 0.7,
                                                color: 'white',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                width: 'auto',
                                                height: '100%',
                                                cursor: 'pointer',
                                                minWidth: 80,
                                            }}
                                        >
                                            <Typography noWrap variant="body2">
                                                {' '}
                                                {t('Setting.OnLeave')}{' '}
                                            </Typography>
                                        </Box>
                                    </Box>
                                );
                            } else if (event) {
                                return (
                                    <Box
                                        key={index1}
                                        sx={{
                                            height: 50,
                                            width: 'auto',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            pt: 1,
                                            pb: 1,
                                            borderTop: index1 === 0 ? null : '1px solid #E0E0E0',
                                            '& .appear-item': {
                                                display: 'none',
                                            },
                                            '&:hover .appear-item': {
                                                display: 'block',
                                            },
                                            cursor: 'pointer',
                                        }}
                                        onClick={() => handleEventPopup({ emp, weekday, event })}
                                    >
                                        <Box
                                            sx={{
                                                backgroundColor: '#44B904',
                                                borderRadius: 2,
                                                p: 0.7,
                                                color: 'white',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                width: 'auto',
                                                height: '100%',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            <Typography noWrap variant="body2">
                                                {' '}
                                                {moment(event?.start_time, 'HH:mm:ss').format('HH:mm')} -{' '}
                                                {moment(event?.end_time, 'HH:mm:ss').format('HH:mm')}{' '}
                                            </Typography>
                                        </Box>
                                    </Box>
                                );
                            } else {
                                return (
                                    <Box
                                        key={index1}
                                        sx={{
                                            height: 50,
                                            width: 'auto',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            pt: 1,
                                            pb: 1,
                                            borderTop: index1 === 0 ? null : '1px solid #E0E0E0',
                                            '& .appear-item': {
                                                display: 'none',
                                            },
                                            '&:hover .appear-item': {
                                                display: 'block',
                                            },
                                            cursor: 'pointer',
                                        }}
                                        onClick={() => handlePopup({ emp, weekday })}
                                    >
                                        <span className="appear-item">+</span>
                                    </Box>
                                );
                            }
                        })}
                </Box>
            ))}

            {/* {openFormModel && <FormModel formProps={formProps} setData={setData} open={openFormModel} onClose={() => setOpenFormModel(false)} />} */}
        </Box>
    );
}
