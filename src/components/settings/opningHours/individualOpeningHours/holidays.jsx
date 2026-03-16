import { Accordion, AccordionDetails, AccordionSummary, IconButton, Stack, Typography } from '@mui/material';
import React from 'react';
import { holidayData } from '../utils/holiday';
import DeleteImg from '../../../../assets/DeleteIcon.png';
import moment from 'moment';
import { ExpandMore } from '@mui/icons-material';
import { t } from 'i18next';

export default function HolidaysList({ data, setData }) {

    const filteredHolidayData = holidayData.filter(item =>
        item?.detail?.some(detail => detail?.off_days && detail.off_days.length > 0)
    );

    return (
        <Stack width={'100%'} flex={1} flexDirection={'column'} >
            <Typography variant='body1' sx={{ fontWeight: 700, color: '#1F1F1F' }}>
                {t("Setting.IndiviOff")}
            </Typography>

            <Stack p={4} mt={2} borderRadius={4} border={'1px solid #D9D9D9'} sx={{ maxHeight: '60dvh', overflowY: 'scroll' }}>
                <Stack gap={2} borderRadius={4}>
                    {filteredHolidayData && filteredHolidayData.map((item, index) => (
                        <Accordion
                            key={index}
                            sx={{
                                boxShadow: "none",
                                display: "flex",
                                flexDirection: "column",
                                bgcolor: "#fff",
                                borderRadius: "15px",
                                border: "1px solid #D9D9D9",
                                scrollbarWidth: "none",
                                overflowX: "hidden",
                                width: "100%",
                            }}
                        >
                            <AccordionSummary sx={{ borderBottom: '1px solid #D9D9D9' }} expandIcon={<ExpandMore />}>
                                {item?.name}
                            </AccordionSummary>

                            <AccordionDetails sx={{ maxHeight: '20dvh', overflow: 'auto' }}>
                                {item?.detail && item?.detail.map((detail, index) => (
                                    <Stack direction={'column'} key={index} gap={2}>
                                        {detail.off_days.map((day, index) => (
                                            <Stack border={'1px solid #D9D9D9'} p={2} direction={'row'} key={index} gap={4}>
                                                <Stack width={'47.5%'} flex={1} flexDirection={'column'}>
                                                    {moment(day, "YYYY-MM-DD").format("dddd")}
                                                </Stack>
                                                <Stack width={'47.5%'} flex={1} flexDirection={'column'}>
                                                    {day}
                                                </Stack>
                                                <Stack width={'5%'} flex={1} flexDirection={'column'}>
                                                    <IconButton
                                                        onClick={() => { }}
                                                        sx={{
                                                            background: "#ffff",
                                                            border: "none",
                                                            marginLeft: 'auto',
                                                            borderRadius: "50%",
                                                            padding: 0,
                                                        }}
                                                    >
                                                        <img src={DeleteImg} alt="Delete" width={18} />
                                                    </IconButton>
                                                </Stack>
                                            </Stack>
                                        )
                                        )}
                                    </Stack>
                                ))}
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </Stack>
            </Stack>
        </Stack>
    );
}
