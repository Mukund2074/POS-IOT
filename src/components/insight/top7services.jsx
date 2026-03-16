import { Box, Button, Stack, styled, Typography, Tooltip, Divider } from "@mui/material";
import React, { useState } from "react"; // Import useState
import Paper from '@mui/material/Paper';
import { formatAmount } from "../../utils/format-amout";
import { t } from "i18next";

export const Topservices = ({ Top_data, selectedButton }) => {
    const [showMore, setShowMore] = useState(false);

    const topSeven = selectedButton === '2' ? Top_data.slice(0, 6) : Top_data.slice(0, 7);
    let topItemsToDisplay = showMore ? Top_data : topSeven;


    if (selectedButton == 0 || selectedButton == 2) {

        topItemsToDisplay = topItemsToDisplay.filter((itemObj) => itemObj.total_revenue_wise_booking > 0)
    }


    const Booking_sum = topItemsToDisplay.reduce((sum, item) => sum + ((selectedButton == 0 || selectedButton == 2) ? item?.total_revenue_wise_booking : item?.total_booking || 0), 0);
    const Earning_sum = topItemsToDisplay.reduce((sum, item) => sum + parseFloat(item?.earning || 0), 0);



    // const Item = styled(Paper)(({ theme }) => ({
    //     backgroundColor: '#fff',
    //     ...theme.typography.body2,
    //     padding: theme.spacing(1),
    //     textAlign: 'center',
    //     color: theme.palette.text.secondary,
    // }));

    return (
        <Box sx={{ borderRadius: '15px', overflow: 'hidden' }}>
            <Box sx={{ overflowX: 'auto', scrollbarWidth: 'none' }}>
                <Stack sx={{ minWidth: 450 }}>
                    <Stack direction={'row'} width={'100%'} textAlign={'center'} borderBottom={'1px solid #DDE0F4'}>
                        <Box sx={{ minWidth: 150, backgroundColor: '#ffff', color: '#545454', paddingLeft: '50px', width: '100%', borderRadius: '15px 0px 0px 0px', display: 'flex', justifyContent: 'start', alignItems: 'center', height: '60px' }}>
                            <Typography variant="h7" fontWeight={400}>{t("Common.Service")}</Typography>
                        </Box>
                        <Box sx={{ minWidth: 150, backgroundColor: '#ffff', color: '#545454', width: '100%', borderRadius: selectedButton === '1' ? '0px 15px 0px 0px' : '0px', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60px' }}>
                            <Typography variant="h7" fontWeight={400} minWidth={selectedButton === '1' ? '20%' : '40%'} textAlign={'left'} >{t("Insights.Booking")}</Typography>
                        </Box>
                        <Box sx={{ minWidth: 150, backgroundColor: '#ffff', color: '#545454', width: '100%', borderRadius: '0px 15px 0px 0px', display: selectedButton === '1' ? 'none' : 'flex', justifyContent: 'center', alignItems: 'center', height: '60px' }}>
                            <Typography variant="h7" fontWeight={400}>{t("Insights.Earning")}</Typography>
                        </Box>
                    </Stack>

                    {Top_data.length === 0 ? (
                        <Box sx={{ textAlign: 'center', padding: '20px' }}>
                            <Typography variant="h7" color="#A0A0A0" fontWeight={500}>{t("Insights.NoDataFound")}</Typography>
                        </Box>
                    ) : (
                        <>
                            {topItemsToDisplay.map((item, index) => (
                                <Stack key={index} direction={'row'} width={'100%'} textAlign={'center'} borderTop={'1px solid #DDE0F4'} paddingTop={1.2} paddingBottom={1.2}>
                                    <Box sx={{ minWidth: 150, backgroundColor: '#ffff', color: '#1F1F1F', paddingLeft: '50px', width: '100%', display: 'flex', justifyContent: 'start', alignItems: 'center' }}>
                                        <Tooltip title={item?.service_name} arrow>
                                            <Typography
                                                variant="h7"
                                                fontWeight={400}
                                                sx={{
                                                    whiteSpace: "nowrap",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    maxWidth: selectedButton === '1' ? "250px" : "170px",
                                                }}
                                            >
                                                {item?.service_name}
                                            </Typography>
                                        </Tooltip>
                                    </Box>
                                    <Box sx={{ minWidth: 150, backgroundColor: '#ffff', color: '#1F1F1F', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', }}>
                                        <Typography variant="h7" minWidth={selectedButton === '1' ? '20%' : '40%'} textAlign={'left'} fontWeight={400}>{(selectedButton == 0 || selectedButton == 2) ? item?.total_revenue_wise_booking : item?.total_booking}</Typography>
                                    </Box>
                                    <Box sx={{ minWidth: 150, backgroundColor: '#ffff', color: '#1F1F1F', width: '100%', display: selectedButton === '1' ? 'none' : 'flex', justifyContent: 'center', alignItems: 'center', }}>
                                        <Typography variant="h7" fontWeight={400}>{formatAmount(item?.earning)}</Typography>
                                    </Box>
                                </Stack>
                            ))}

                            <Stack direction={'row'} width={'100%'} textAlign={'center'} borderTop={'1px solid #38383B'}>
                                <Box sx={{ minWidth: 150, color: '#1F1F1F', borderRadius: '0px 0px 0px 15px', boxShadow: 'none', backgroundColor: '#ffff', paddingLeft: '50px', width: '100%', height: '60px', display: 'flex', justifyContent: 'start', alignItems: 'center' }}>
                                    <Typography variant="h7" fontWeight={500}>{t("Common.Total")}</Typography>
                                </Box>
                                <Box sx={{ minWidth: 150, color: '#1F1F1F', borderRadius: '0px', boxShadow: 'none', backgroundColor: '#ffff', width: '100%', height: '60px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <Typography variant="h7" fontWeight={500} minWidth={selectedButton === '1' ? '20%' : '40%'} textAlign={'left'} >{Booking_sum}</Typography>
                                </Box>
                                <Box sx={{ minWidth: 150, color: '#1F1F1F', borderRadius: '0px 0px 15px 0px', boxShadow: 'none', backgroundColor: '#ffff', width: '100%', height: '60px', display: selectedButton === '1' ? 'none' : 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <Typography variant="h7" fontWeight={500}>{formatAmount(Earning_sum)}</Typography>
                                </Box>
                            </Stack>
                            {(Top_data.length > 6 && selectedButton === '2') && (
                                <Stack direction={'row'} width={'100%'} textAlign={'center'} borderTop={'none'}>
                                    <Box sx={{ minWidth: 150, backgroundColor: '#ffff', paddingLeft: '50px', borderRadius: '0px 0px 0px 15px', width: '100%', height: '0px', boxShadow: 'none' }}></Box>
                                    <Box sx={{ minWidth: 150, backgroundColor: '#ffff', borderRadius: '0px', width: '100%', height: '30px', boxShadow: 'none' }}></Box>
                                    <Box sx={{ minWidth: 150, backgroundColor: '#ffff', borderRadius: '0px 0px 15px 0px', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '5px', boxShadow: 'none' }}>
                                        <Button onClick={() => setShowMore(!showMore)} sx={{ ml: 'auto', bottom: -5, right: 10 }}><Typography variant="subtitle2" sx={{ fontWeight: 500, color: "#A0A0A0", textTransform: "none" }}>{showMore ? "Show less" : "Show more"}</Typography></Button>
                                    </Box>
                                </Stack>
                            )}

                            {Top_data.length > 7 && selectedButton === '1' && (
                                <Stack direction={'row'} width={'100%'} textAlign={'center'} borderTop={'none'}>
                                    <Box sx={{ backgroundColor: '#ffff', paddingLeft: '50px', borderRadius: '0px 0px 0px 15px', width: '100%', height: '0px', boxShadow: 'none' }}></Box>
                                    <Box sx={{ backgroundColor: '#ffff', borderRadius: '0px', width: '100%', height: '30px', boxShadow: 'none' }}></Box>
                                    <Box sx={{ backgroundColor: '#ffff', borderRadius: '0px 0px 15px 0px', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '5px', boxShadow: 'none' }}>
                                        <Button onClick={() => setShowMore(!showMore)} sx={{ ml: 'auto', bottom: -5, right: 10 }}><Typography variant="subtitle2" sx={{ fontWeight: 500, color: "#A0A0A0", textTransform: "none" }}>{showMore ? t("Insights.ShowLess") : t("Insights.ShowMore")}</Typography></Button>
                                    </Box>
                                </Stack>
                            )}
                        </>
                    )}
                </Stack>
            </Box>
        </Box>
    );
};