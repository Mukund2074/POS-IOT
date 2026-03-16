import { Box, Card, CardContent, Chip, Divider, Grid2, Paper, Skeleton, Stack, styled, Typography } from "@mui/material";
import React from "react";
import { BarChart } from "../../../components/insight/charts/bookingchannels";
import { TopEmployee } from "../../../components/insight/topEmployee";
import { BookingPieChart } from "../../../components/insight/charts/bookingstatuspiechart";
import { Topservices } from "../../../components/insight/top7services";
import increase from "../../../assets/increase.png";
import decrease from "../../../assets/decrease.png";
import inflation from "../../../assets/Polygon 17.svg";
import deflation from "../../../assets/Polygon 17(1).svg";
import { BookingAreaChart } from "../../../components/insight/charts/bookingareachart";
import { BookingPercentagePieChart } from "../../../components/insight/charts/bookingPiechart";
import { formatPercentage } from "../../../utils/format-amout";
import { CommonPieChart } from "../../../components/insight/charts/piechart/PieChart";
import { t } from "i18next";

const BookingsPage = (props) => {
    const { allData, loading, topEmployee, selectedPage, selectedButton, startdate, endDate } = props;
    const Top_booking_per = allData?.top_booking_wise_service;
    const Area_chart_Data = allData?.date_booking_data;
    const Booking_Status = allData?.status_wise_booking;
    const Booking_Channel = allData?.source_wise_booking;


    const Item = styled(Paper)(({ theme }) => ({
        backgroundColor: "transparent",
        ...theme.typography.body2,
        padding: theme.spacing(1),
        textAlign: "letf",
        color: theme.palette.text.secondary,
        ...theme.applyStyles("dark", {
            backgroundColor: "transparent",
        }),
    }));


    return (
        <Box sx={{ width: '100%', display: "flex", flexDirection: "column", gap: "40px" }}>
            <Stack gap={2} width={'100%'} direction={{ xs: 'column', lg: "row" }} >
                <Stack gap={2} sx={{ width: "100%" }}>

                    <Item
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "10px",
                            height: "fit-content",
                            boxShadow: 'none',
                            width: "100%"
                        }}
                    >
                        <Typography variant="h6" color="black" display={'flex'} alignItems={'flex-end'} fontWeight={700}>{selectedPage}</Typography>

                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: { xs: "column", lg: "row" },
                                justifyContent: "space-between",
                                gap: 2,
                                alignItems: "center",
                            }}
                        >

                            <Stack p={4} sx={{
                                height: "140px",
                                width: "100%",
                                borderRadius: "10px",
                                backgroundColor: "white",
                                boxShadow: "0px 1px 50px 0px rgba(0, 0, 0, 0.05)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                paddingTop: 1.5,
                                paddingLeft: 2,
                                paddingRight: 2,
                                paddingBlock: 2,
                            }}>
                                {loading ?
                                    (
                                        <>
                                            <Stack flex={1} width={'100%'} flexDirection={'row'} justifyContent={'space-between'} alignContent={'flex-start'}>
                                                <Skeleton variant="text" height={40} width={"70%"} sx={{ borderRadius: "10px" }} />
                                                <Skeleton variant="text" height={40} width={"29%"} sx={{ borderRadius: "10px", ml: 2 }} />
                                            </Stack>
                                            <Stack flex={1} flexDirection={'column'} justifyContent={'flex-end'} width={'100%'}>
                                                <Skeleton variant="text" height={60} width={'100%'} sx={{ borderRadius: "10px" }} />
                                            </Stack>
                                        </>
                                    )
                                    :
                                    (
                                        <>
                                            <Stack flex={1} width={'100%'} flexDirection={'row'} justifyContent={'space-between'} alignContent={'flex-start'}>
                                                <Typography variant="h7" sx={{ fontWeight: 400, color: "#1F1F1F", paddingRight: 2 }}>
                                                    {t("Common.Bookings")}
                                                </Typography>
                                                <Chip
                                                    sx={{
                                                        backgroundColor: allData?.total_booking_percentage_diff >= 0 ? "#D1F3D4" : "#F5D7D7",
                                                        fontSize: 16,
                                                        fontWeight: 400,
                                                        color: allData?.total_booking_percentage_diff >= 0 ? "#367B3D" : "#C74141",
                                                        borderRadius: '30px',
                                                        padding: "7px 2px 7px 10px",
                                                    }}
                                                    icon={<img height={16} src={allData?.total_booking_percentage_diff >= 0 ? increase : decrease} />}
                                                    label={allData?.total_booking_percentage_diff >= 0 ? formatPercentage(allData?.total_booking_percentage_diff) : (formatPercentage(Math.abs(allData?.total_booking_percentage_diff)))}
                                                />

                                            </Stack>
                                            <Stack flex={1} flexDirection={'column'} justifyContent={'flex-end'} width={'100%'}>
                                                <Typography variant="h5" sx={{ fontWeight: 700, color: "#1F1F1F", padding: 0, width: '100%' }}>
                                                    {allData?.total_bookings}
                                                </Typography>
                                            </Stack>
                                        </>
                                    )
                                }
                            </Stack>

                            <Stack p={4} sx={{
                                height: "140px",
                                width: "100%",
                                borderRadius: "10px",
                                backgroundColor: "white",
                                boxShadow: "0px 1px 50px 0px rgba(0, 0, 0, 0.05)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                paddingTop: 1.5,
                                paddingLeft: 2,
                                paddingRight: 2,
                                paddingBlock: 2,
                            }}>
                                {loading ?
                                    (
                                        <>
                                            <Stack flex={1} width={'100%'} flexDirection={'row'} justifyContent={'space-between'} alignContent={'flex-start'}>
                                                <Skeleton variant="text" height={40} width={"70%"} sx={{ borderRadius: "10px" }} />
                                                <Skeleton variant="text" height={40} width={"29%"} sx={{ borderRadius: "10px", ml: 2 }} />
                                            </Stack>
                                            <Stack flex={1} flexDirection={'column'} justifyContent={'flex-end'} width={'100%'}>
                                                <Skeleton variant="text" height={60} width={'100%'} sx={{ borderRadius: "10px" }} />
                                            </Stack>
                                        </>
                                    )
                                    :
                                    (
                                        <>
                                            <Stack flex={1} width={'100%'} flexDirection={'row'} justifyContent={'space-between'} alignContent={'flex-start'}>
                                                <Typography variant="h7" sx={{ fontWeight: 400, color: "#1F1F1F", paddingRight: 2 }}>
                                                    {t("Insights.BookingFromNewCutomer")}
                                                </Typography>
                                                <Chip
                                                    sx={{
                                                        backgroundColor: allData?.new_customer_booking_diff >= 0 ? "#D1F3D4" : "#F5D7D7",
                                                        fontSize: 16,
                                                        fontWeight: 400,
                                                        color: allData?.new_customer_booking_diff >= 0 ? "#367B3D" : "#C74141",
                                                        borderRadius: '30px',
                                                        padding: "7px 2px 7px 10px",
                                                    }}
                                                    icon={<img height={16} src={allData?.new_customer_booking_diff >= 0 ? increase : decrease} />}
                                                    label={allData?.new_customer_booking_diff >= 0 ? formatPercentage(allData?.new_customer_booking_diff) : Math.abs(formatPercentage(allData?.new_customer_booking_diff))}
                                                />

                                            </Stack>
                                            <Stack flex={1} flexDirection={'column'} justifyContent={'flex-end'} width={'100%'}>
                                                <Typography variant="h5" sx={{ fontWeight: 700, color: "#1F1F1F", padding: 0, width: '100%' }}>
                                                    {allData?.new_customer_booking}
                                                </Typography>
                                            </Stack>
                                        </>
                                    )
                                }
                            </Stack>

                        </Box>
                    </Item>

                    <Item
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "10px",
                            height: "fit-content",
                            boxShadow: 'none',
                            width: "100%"
                        }}
                    >
                        <Typography variant="h6" color="black" fontWeight={700}>
                            {t("Insights.TopBookingPercentage")}
                        </Typography>
                        <Box
                            sx={{
                                backgroundColor: "white",
                                filter: 'drop-shadow(0px 1px 50px rgba(0, 0, 0, 0.05))',
                                borderRadius: "15px",
                                width: "100%",
                                position: 'relative'
                            }}
                            p={1.7}
                        >
                            {loading ?
                                <Stack flex={1}
                                    flexDirection={'column'}
                                    alignItems="center"
                                    justifyContent="space-between"
                                    padding={1}
                                    sx={{ minHeight: 160 }}>
                                    <Stack flex={1} width={'100%'} alignItems={'center'} flexDirection={'row'} justifyContent={'space-between'}>
                                        <Stack flex={0.3}><Skeleton variant="rounded" height={150} width={160} /></Stack>
                                        <Stack flex={0.7} display={'flex'} justifyContent={'center'} alignItems={'center'} flexDirection={'column'} width={'100%'}>
                                            {
                                                Array.from({ length: 4 }).map((_, index) => {
                                                    return (
                                                        <Stack display={'flex'} justifyContent={'space-between'} alignItems={'center'} flexDirection={'row'} width={'100%'}><Skeleton variant="text" height={40} width={"50%"} /> <Skeleton variant="text" height={40} width={"20%"} /></Stack>
                                                    )
                                                })
                                            }
                                        </Stack>
                                    </Stack>
                                </Stack>
                                :
                                <BookingPercentagePieChart Top_booking_per={Top_booking_per} loading={loading} />
                            }

                        </Box>
                    </Item>

                    <Item
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "10px",
                            height: "fit-content",
                            boxShadow: 'none',
                            width: "100%"
                        }}
                    >
                        <Typography variant="h6" color="black" fontWeight={700}>
                            {t("Common.Bookings")}
                        </Typography>
                        <Box
                            sx={{
                                backgroundColor: "white",
                                boxShadow: '0px 1px 50px 0px rgba(0, 0, 0, 0.05)',
                                borderRadius: "15px",
                                width: "100%",
                                padding: 2,
                                paddingLeft: 3,
                                paddingRight: 3
                            }}
                            p={3.7}
                        >

                            {loading || Area_chart_Data === undefined ?
                                <>
                                    <Stack flex={1} flexDirection={'row'} justifyContent={'space-between'}>
                                        <Skeleton variant="text" height={40} width={'30%'} />
                                        <Skeleton variant="text" height={40} width={'30%'} />
                                    </Stack>
                                    <Skeleton variant="text" height={150} width={'100%'} />
                                </>
                                :
                                <>
                                    <Stack flex={1} flexDirection={'row'} justifyContent={'space-between'}>
                                        <Stack flexDirection={'column'} justifyContent={'flex-start'} alignItems={'flex-start'} >
                                            <Typography
                                                variant="h7"
                                                fontWeight={400}
                                                color="#1F1F1F"
                                            >
                                                {t("Common.Bookings")}
                                            </Typography>
                                            <Typography
                                                variant="h5"
                                                fontWeight={700}
                                                color="#1F1F1F"
                                            >
                                                {allData?.total_date_wise_booking}
                                            </Typography>
                                        </Stack>
                                        <Stack flexDirection={'column'} justifyContent={'flex-end'} alignItems={'flex-end'}>
                                            <Chip
                                                sx={{
                                                    backgroundColor: allData?.date_wise_booking_diff >= 0 ? "#D1F3D4" : "#F5D7D7",
                                                    fontWeight: 700,
                                                    color: allData?.date_wise_booking_diff >= 0 ? "#367B3D" : "#C74141",
                                                    borderRadius: '30px',
                                                    padding: "7px 2px 7px 10px",
                                                    gap: 0.5
                                                }}
                                                icon={<img height={12} src={allData?.date_wise_booking_diff >= 0 ? inflation : deflation} />}
                                                label={
                                                    allData?.date_wise_booking_diff >= 0
                                                        ? allData?.date_wise_booking_diff
                                                        : Math.abs(allData?.date_wise_booking_diff)
                                                }
                                            />
                                            <Typography variant="subtitle1" color="#1F1F1F" fontWeight={400}>
                                                {allData?.date_wise_booking_diff >= 0 ? t("Insights.UpToLastPeriod") : t("Insights.DownToLastPeriod")}
                                            </Typography>
                                        </Stack>

                                    </Stack>
                                    <BookingAreaChart Area_chart_Data={Area_chart_Data} startdate={startdate} endDate={endDate} />
                                </>
                            }

                        </Box>
                    </Item>


                    <Item sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px", height: "fit-content", boxShadow: 'none', width: "100%"
                    }}>
                        <Typography variant="h6" color="black" fontWeight={700}>
                            {t("Insights.BookingsBasedOnChannels")}
                        </Typography>
                        <Box
                            sx={{
                                backgroundColor: "white",
                                boxShadow: '0px 1px 50px 0px rgba(0, 0, 0, 0.05)',
                                borderRadius: "15px",
                                width: "100%",
                            }}
                            paddingTop={2}
                            paddingLeft={2}
                        // p={3.7}
                        >
                            {loading ?
                                <Stack sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', gap: '5%', marginBottom: '10px' }}>
                                    <Skeleton variant="rounded" height={140} width={100} />
                                    <Skeleton variant="rounded" height={170} width={100} />
                                    <Skeleton variant="rounded" height={100} width={100} />
                                </Stack> :
                                <>
                                    <Typography
                                        variant="h7"
                                        fontWeight={400}
                                        color="black"
                                    >
                                        {t("Insights.BookingChannels")}
                                    </Typography>
                                    <BarChart
                                        data={Booking_Channel}
                                        selectedButton={selectedButton}
                                    />
                                </>

                            }
                        </Box>
                    </Item>

                </Stack>

                <Stack gap={2} sx={{ width: "100%" }}>

                    <Item
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "10px",
                            boxShadow: 'none',
                            width: "100%"
                        }}
                    >
                        <Typography variant="h6" color="black" fontWeight={700}>
                            {t("Insights.Top3Employee")}
                        </Typography>
                        <Box
                            sx={{
                                backgroundColor: "white",
                                filter: 'drop-shadow(0px 1px 50px rgba(0, 0, 0, 0.05))',
                                borderRadius: "15px",
                                height: "100%",
                                width: '100%',
                            }}
                            p={3.7}
                        >
                            {
                                !loading && topEmployee !== undefined ?
                                    <TopEmployee topEmployee={topEmployee} selectedButton={selectedButton} loading={loading} />
                                    :
                                    <Stack display={'flex'} alignItems={'flex-end'} justifyContent={'center'} flexDirection={'row'} gap={1}>
                                        <Skeleton variant="rounded" width={100} height={150} />
                                        <Skeleton variant="rounded" width={100} height={170} />
                                        <Skeleton variant="rounded" width={100} height={120} />
                                    </Stack>
                            }
                        </Box>
                    </Item>

                    <Item
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "10px",
                            height: "fit-content",
                            boxShadow: 'none',
                            width: "100%"
                        }}
                    >
                        <Typography variant="h6" color="black" fontWeight={700}>
                            {t("Insights.BookingStatus")}
                        </Typography>
                        <Box
                            sx={{
                                backgroundColor: "white",
                                filter: 'drop-shadow(0px 1px 50px rgba(0, 0, 0, 0.05))',
                                borderRadius: "15px",
                                width: "100%",
                                padding: 2
                            }}
                            p={3.7}
                        >

                            {loading || Booking_Status === undefined ?
                                <Stack flex={1}
                                    flexDirection={'column'}
                                    alignItems="center"
                                    justifyContent="space-between"
                                    padding={1}
                                    sx={{ minHeight: 160 }}>
                                    <Stack flex={1} width={'100%'} alignItems={'center'} flexDirection={'row'} justifyContent={'space-between'}>
                                        <Stack flex={0.3}><Skeleton variant="rounded" height={150} width={160} /></Stack>
                                        <Stack flex={0.7} display={'flex'} justifyContent={'center'} alignItems={'center'} flexDirection={'column'} width={'100%'}>
                                            {
                                                Array.from({ length: 4 }).map((_, index) => {
                                                    return (
                                                        <Stack display={'flex'} justifyContent={'space-between'} alignItems={'center'} flexDirection={'row'} width={'100%'}><Skeleton variant="text" height={40} width={"50%"} /> <Skeleton variant="text" height={40} width={"20%"} /></Stack>
                                                    )
                                                })
                                            }
                                        </Stack>
                                    </Stack>
                                </Stack>
                                :
                                <BookingPieChart data={Booking_Status} loading={loading} />
                            }
                        </Box>
                    </Item>

                    <Item
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "10px",
                            height: "fit-content",
                            boxShadow: 'none',
                            width: "100%"
                        }}
                    >
                        <Typography variant="h6" color="black" fontWeight={700}>
                            {t("Insights.Top7Services")}
                        </Typography>

                        <Box
                            sx={{
                                backgroundColor: "white",
                                boxShadow: '0px 4px 55px 0px rgba(162, 164, 181, 0.20)',
                                borderRadius: "15px",
                                width: "100%",
                                position: 'relative'
                            }}
                        >
                            {loading ?
                                <Stack p={2.5}>
                                    <Skeleton variant="text" height={40} />
                                    <Skeleton variant="text" sx={{ marginTop: '-60px', marginBottom: '-60px' }} height={300} />
                                </Stack> :
                                <Topservices Top_data={Top_booking_per} selectedButton={selectedButton} />
                            }
                        </Box>
                    </Item>

                </Stack>
            </Stack>
        </Box>
    );
}

export default BookingsPage;