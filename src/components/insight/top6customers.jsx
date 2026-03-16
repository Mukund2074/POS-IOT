import { Box, Button, Stack, Typography } from "@mui/material";
import React, { useState } from "react";
import { formatAmount } from "../../utils/format-amout";
import { t } from "i18next";

export const TopCustomers = ({ Top_customer }) => {
    const [showMore, setShowMore] = useState(false); // Track whether to show more
    let TopCustomers = showMore ? Top_customer : Top_customer.slice(0, 6);

    TopCustomers = TopCustomers.filter((itemObj) => itemObj.total_revenue_wise_booking > 0)

    const Booking_sum = TopCustomers.reduce((sum, item) => sum + (item?.total_revenue_wise_booking || 0), 0);
    const Earning_sum = TopCustomers.reduce((sum, item) => sum + parseFloat(item?.spend || 0), 0);


    return (
        <Box sx={{ borderRadius: '15px', overflow: 'hidden' }}>
            <Box sx={{ overflowX: 'auto', scrollbarWidth: 'none' }}>
                <Stack sx={{ minWidth: 450 }}>

                    <Stack direction={'row'} width={'100%'} textAlign={'center'} borderBottom={'1px solid #DDE0F4'}>
                        <Box sx={{ minWidth: 150, backgroundColor: '#ffff', color: '#545454', paddingLeft: '50px', width: '100%', borderRadius: '15px 0px 0px 0px', display: 'flex', justifyContent: 'start', alignItems: 'center', height: '60px' }}><Typography variant="h7" fontWeight={400}>{t("Insights.Customer")}</Typography></Box>
                        <Box sx={{ minWidth: 150, backgroundColor: '#ffff', color: '#545454', width: '100%', borderRadius: '0px', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60px' }}><Typography variant="h7" fontWeight={400} minWidth={'40%'} textAlign={'left'}>{t("Insights.Booking")}</Typography></Box>
                        <Box sx={{ minWidth: 150, backgroundColor: '#ffff', color: '#545454', width: '100%', borderRadius: '0px 15px 0px 0px', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60px' }}><Typography variant="h7" fontWeight={400}>{t("Insights.Earning")}</Typography></Box>
                    </Stack>
                    {
                        !Top_customer || Top_customer.length === 0 ?
                            (
                                <Box sx={{ textAlign: 'center', padding: '20px' }}>
                                    <Typography variant="h7" color="#A0A0A0" fontWeight={500}>{t("Insights.NoDataFound")}</Typography>
                                </Box>
                            )
                            :
                            (
                                <React.Fragment >
                                    {
                                        TopCustomers.map((value, index) => {
                                            return (
                                                <Stack key={index} direction={'row'} width={'100%'} textAlign={'center'} borderTop={'1px solid #DDE0F4'} paddingTop={1.2} paddingBottom={1.2} >
                                                    <Box sx={{ minWidth: 150, backgroundColor: '#ffff', color: '#1F1F1F', paddingLeft: '50px', width: '100%', display: 'flex', justifyContent: 'start', alignItems: 'center' }}>
                                                        <Typography noWrap variant="h7" fontWeight={400} sx={{
                                                            whiteSpace: 'nowrap',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            width: '150px',
                                                            textAlign: 'left'
                                                        }}>
                                                            {value?.customer_name}
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{ minWidth: 150, backgroundColor: '#ffff', color: '#1F1F1F', borderRadius: '0px', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Typography noWrap variant="h7" fontWeight={400} minWidth={'40%'} textAlign={'left'}>{value?.total_revenue_wise_booking}</Typography></Box>
                                                    <Box sx={{ minWidth: 150, backgroundColor: '#ffff', color: '#1F1F1F', borderRadius: '0px', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Typography noWrap variant="h7" fontWeight={400}>{formatAmount(value?.spend)}</Typography></Box>
                                                </Stack>
                                            );
                                        })
                                    }
                                    <Stack direction={'row'} width={'100%'} textAlign={'center'} borderTop={'1px solid #38383B'}>
                                        <Box sx={{ minWidth: 150, backgroundColor: '#ffff', color: '#1F1F1F', paddingLeft: '50px', borderRadius: '0px 0px 0px 15px', width: '100%', display: 'flex', justifyContent: 'start', alignItems: 'center', height: '60px', boxShadow: 'none' }}><Typography variant="h7" fontWeight={500}>{t("Common.Total")}</Typography></Box>
                                        <Box sx={{ minWidth: 150, backgroundColor: '#ffff', color: '#1F1F1F', borderRadius: '0px', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60px', boxShadow: 'none' }}><Typography variant="h7" fontWeight={500} minWidth={'40%'} textAlign={'left'}>{Booking_sum}</Typography></Box>
                                        <Box sx={{ minWidth: 150, backgroundColor: '#ffff', color: '#1F1F1F', borderRadius: '0px 0px 15px 0px', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60px', boxShadow: 'none' }}><Typography variant="h7" fontWeight={500}>{formatAmount(Earning_sum)}</Typography></Box>
                                    </Stack>
                                    {
                                        Top_customer.length <= 6 ? null :
                                            <Stack direction={'row'} width={'100%'} textAlign={'center'} borderTop={'none'}>
                                                <Box sx={{ backgroundColor: '#ffff', paddingLeft: '50px', borderRadius: '0px 0px 0px 15px', width: '100%', height: '0px', boxShadow: 'none' }}></Box>
                                                <Box sx={{ backgroundColor: '#ffff', borderRadius: '0px', width: '100%', height: '30px', boxShadow: 'none' }}></Box>
                                                <Box sx={{ backgroundColor: '#ffff', borderRadius: '0px 0px 15px 0px', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '5px', boxShadow: 'none' }}>
                                                    <Button sx={{ ml: 'auto', bottom: -5, right: 10 }} onClick={() => setShowMore(!showMore)}>
                                                        <Typography variant="subtitle2" sx={{ fontWeight: 500, color: "#A0A0A0", textTransform: "none" }}>
                                                            {showMore ? t("Insights.ShowLess") : t("Insights.ShowMore")}
                                                        </Typography>
                                                    </Button>
                                                </Box>
                                            </Stack>
                                    }
                                </React.Fragment>
                            )
                    }

                </Stack>
            </Box>
        </Box >
    );
}
