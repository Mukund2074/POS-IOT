import { Box, Divider, Stack, TextField, Tooltip, Typography } from '@mui/material'
import { LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { t } from 'i18next';
import moment from 'moment';
import React from 'react'
import { getWeekDayByLang } from '../../../../utils/commonFetcher';
import CustomTimePicker from '../../commonTimePicker';
import FSwitch from '../../../commonComponents/f-switch';
import { useSelector } from 'react-redux';

const weekDays = getWeekDayByLang({ lang: 'da' });


const sortDaysOfWeek = (data) => {
    const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    let newData = [...data]

    return newData.sort((a, b) => daysOrder.indexOf(a.day) - daysOrder.indexOf(b.day));

};

export default function GenralStoreOpeningHoursList({ data, setData, handleOpenStatus, handleByAppointment }) {

    const user = useSelector((state) => state?.user?.data);

    const checkPermission = () => {
        if (user?.role !== "ADMIN" && !user?.settings?.change_all_opening_hours) {
            return false;
        }
        return true;
    }

    const sortedSchedule = sortDaysOfWeek(data?.schedule || []);

    const handleTimeChange = (time, id, type) => {
        // let updatedSchedule = [];
        const updatedSchedule = data.schedule.map((item) => {
            if (item.id === id) {
                let itemNew = { ...item }
                itemNew[type] = time.format('HH:mm:ss')
                return itemNew
            } else {
                return item
            }
        });


        setData({ ...data, schedule: updatedSchedule });
    }

    return (
        <React.Fragment>
            {sortedSchedule && sortedSchedule?.map((item, index) => (
                <Box key={index} sx={{ display: "flex", flexDirection: 'row', justifyContent: "between", alignItems: "center", width: "100%", borderRadius: '10px' }}>

                    <Box sx={{ backgroundColor: item.is_closed ? '#D9D9D950' : '#FFFFFF', display: "flex", flexDirection: 'row', justifyContent: "between", alignItems: "center", width: "60%", border: '1px solid #D9D9D9', borderRadius: '10px' }}>
                        <Box sx={{ width: "50%", display: "flex", height: "100%", flexDirection: 'column', alignItems: "start", borderRight: '1px solid #D9D9D9' }}>
                            <Typography style={{ width: 'full', size: '20px', color: '#A0A0A0', padding: '8px' }}>
                                {item?.day === Object.keys(weekDays)[index] ? weekDays[item?.day] : item?.day}
                            </Typography>
                        </Box>
                        {
                            item.open_by_appointment ?
                                <Box sx={{ width: "50%", height: "100%", display: "flex", flexDirection: 'column', justifyContent: "center", alignItems: "center" }}>
                                    <Typography style={{ width: 'full', size: '20px', color: '#A0A0A0', padding: '8px 0px 8px 0px' }}>
                                        {t("Setting.OpenByAppointment")}
                                    </Typography>
                                </Box>
                                : item &&
                                <Stack display={"flex"} flexDirection="row" justifyContent="center" alignItems="center" sx={{ width: "50%", height: "100%" }}>
                                    <Divider orientation="vertical" sx={{ height: "100%", backgroundColor: "#D9D9D9" }} />
                                    <Stack sx={{ width: "40%" }}>
                                        <CustomTimePicker
                                            disabled={!checkPermission()}
                                            borderThickness="0"
                                            inputColor="#A0A0A0"
                                            iconVisibility={false}
                                            hideBorder={true}
                                            value={moment(item.open_time, 'HH:mm:ss')}
                                            format='HH:mm'
                                            onChange={(time) => handleTimeChange(time, item.id, 'open_time')}
                                            border={'0px solid #d9d9d9'}
                                        />
                                    </Stack>
                                    <Stack sx={{ width: "20%", display: "flex", flexDirection: 'column', justifyContent: "center", alignItems: "center", borderRight: '2px solid #D9D9D9', borderLeft: '2px solid #D9D9D9' }}>
                                        <Typography style={{ width: 'full', size: '20px', color: '#1F1F1F', padding: '8px 0px 8px 0px' }}>
                                            to
                                        </Typography>
                                    </Stack>
                                    <Stack sx={{ width: "40%" }}>
                                        <CustomTimePicker
                                            borderThickness="0"
                                            disabled={!checkPermission()}
                                            inputColor="#A0A0A0"
                                            iconVisibility={false}
                                            hideBorder={true}
                                            value={moment(item.close_time, 'HH:mm:ss')}
                                            format='HH:mm'
                                            onChange={(time) => handleTimeChange(time, item.id, 'close_time')}
                                            border={'0px solid #d9d9d9'}
                                        />
                                    </Stack>
                                </Stack>
                        }
                    </Box>
                    <Box sx={{ width: "20%", display: "flex", flexDirection: 'column', alignItems: "center", justifyContent: "center" }}>
                        <Tooltip title={item.open_by_appointment && item.is_closed ? t("Setting.tooltip1") : ''}>
                            <FSwitch
                                disabled={!checkPermission()}
                                checked={item.is_closed ? true : false}
                                onChange={() => handleOpenStatus(item.id)}
                               
                            />
                        </Tooltip>
                    </Box>

                    <Box sx={{ width: "20%", display: "flex", flexDirection: 'column', alignItems: "center", justifyContent: "center" }}>
                        <Tooltip title={!item.is_closed && !item.open_by_appointment ? t("Setting.tooltip2") : ''}>
                            <FSwitch
                                disabled={!checkPermission()}
                                checked={item.open_by_appointment ? true : false}
                                onChange={() => handleByAppointment(item.id)}
                              
                            />
                        </Tooltip>
                    </Box>
                </Box>
            ))}
        </React.Fragment>
    );
}
