import {
  Box,
  Chip,
  Grid2,
  Paper,
  Skeleton,
  Stack,
  styled,
  Typography,
} from "@mui/material";
import React from "react";
import { PieChart } from "../../../components/insight/charts/revenuepiechart";
import increase from "../../../assets/increase.png";
import decrease from "../../../assets/decrease.png";
import { TopEmployee } from "../../../components/insight/topEmployee";
import { AreaChart } from "../../../components/insight/charts/earningslinechart";
import { BookingPieChart } from "../../../components/insight/charts/bookingstatuspiechart";
import { Topservices } from "../../../components/insight/top7services";
import { BarChart } from "../../../components/insight/charts/bookingchannels";
import inflation from "../../../assets/Polygon 17.svg";
import deflation from "../../../assets/Polygon 17(1).svg";
import { formatAmount, formatPercentage } from "../../../utils/format-amout";
import { OverLay } from "../../../components/insight/OverLay";
import DataBox from "../../../components/insight/DataBox";
import { BookingPercentagePieChart } from "../../../components/insight/charts/bookingPiechart";
import { t } from "i18next";

const GeneralPage = (props) => {
  const { allData, loading, topEmployee, selectedButton, selectedPage, hasNoProPlan, startdate, endDate } = props;


  const Top_booking_per = allData?.top_booking_wise_service;
  const Top_revenue_per = allData?.top_revenue_wise_service ? allData?.top_revenue_wise_service.filter((obj) => obj.earning > 0) : null;
  const Top_seven_services = allData?.top_revenue_wise_service;
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

  const dummyData = {
    "top_3_booking_wise_employee": [
      {
        "employee_id": 231,
        "employee_name": "Employee1",
        "total_booking": 21,
        "earning": "5235.0"
      },
      {
        "employee_id": 313,
        "employee_name": "Employee2",
        "total_booking": 19,
        "earning": "500.0"
      },
      {
        "employee_id": 273,
        "employee_name": "Employee3",
        "total_booking": 14,
        "earning": "149.0"
      }
    ],
    "top_3_revenue_wise_employee": [
      {
        "employee_id": 231,
        "employee_name": "Employee1",
        "total_booking": 21,
        "earning": "895.0"
      },
      {
        "employee_id": 313,
        "employee_name": "Employee2",
        "total_booking": 9,
        "earning": "600.0"
      },
      {
        "employee_id": 173,
        "employee_name": "Employee3",
        "total_booking": 11,
        "earning": "499.0"
      }
    ]
  }

  const RevenueDummyData = [
    { date: "2024-12-20", booking_count: 4, earning: "183.0", customer: 4 },
    { date: "2024-12-21", booking_count: 2, earning: "158.0", customer: 2 },
    { date: "2024-12-23", booking_count: 1, earning: "23.0", customer: 1 },
    { date: "2024-12-25", booking_count: 2, earning: "20.0", customer: 2 },
    { date: "2024-12-26", booking_count: 5, earning: "250.0", customer: 5 },
    { date: "2024-12-27", booking_count: 3, earning: "120.0", customer: 3 },
    { date: "2024-12-28", booking_count: 4, earning: "300.0", customer: 4 },
    { date: "2024-12-29", booking_count: 2, earning: "100.0", customer: 2 },
    { date: "2024-12-30", booking_count: 6, earning: "450.0", customer: 6 },
    { date: "2024-12-31", booking_count: 3, earning: "200.0", customer: 3 }
  ];

  const dataBoxes = [
    {
      label: "Bookings",
      heading: t("Common.Bookings"),
      value: allData?.total_bookings,
      percentageDiff: allData?.total_booking_percentage_diff,
      icon: allData?.total_booking_percentage_diff >= 0 ? increase : decrease,
      formatValue: (val) => val,
    },
    {
      label: "Revenue",
      heading: t("Insights.Revenue"),
      value: allData?.total_revenue,
      percentageDiff: parseFloat(allData?.total_revenue_percentage_diff),
      icon: allData?.total_revenue_percentage_diff >= 0 ? increase : decrease,
      formatValue: (val) => formatAmount(val),
    },
    {
      label: "New Customers",
      heading: t("Insights.NewCustomers"),
      value: allData?.new_custromer,
      percentageDiff: allData?.new_customer_diff,
      icon: allData?.new_customer_diff >= 0 ? increase : decrease,
      formatValue: (val) => val,
    },
    {
      label: 'Conversion Rate',
      heading: t("Insights.ConversionRate1"),
      value: allData?.conversion_rate,
      percentageDiff: allData?.conversion_rate_diff,
      icon: allData?.conversion_rate_diff >= 0 ? increase : decrease,
      formatValue: (val) => formatPercentage(val),
    },
  ];




  return (
    <Stack>

      {/* Visible when user has proplan and hidden when user has normal plan */}
      {
        !hasNoProPlan &&
        <Grid2 container spacing={2}>
          <Grid2 size={12}>
            <Typography variant="h6" color="black" display={'flex'} alignItems={'flex-end'} fontWeight={700}>{selectedPage}</Typography>
          </Grid2>

          {dataBoxes.map((box, index) => (
            <Grid2 size={{ xs: 12, sm: 6, lg: 3 }} >
              <DataBox
                key={index}
                label={box.label}
                heading={box.heading}
                value={box.value}
                percentageDiff={box.percentageDiff}
                loading={loading}
                icon={box.icon}
                formatValue={box.formatValue}
              />
            </Grid2>
          ))}


        </Grid2>
      }

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", lg: "row" },
          gap: 2,
          width: "100%",
        }}
      >
        <Stack
          sx={{
            flex: 1,
            width: { xs: "100%", lg: "100%" },
          }}
          gap={2}
        >

          {/* Booking and revenue card for lock user with real data */}
          {
            hasNoProPlan &&
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
                  flexDirection: "row",
                  justifyContent: "space-between",
                  gap: '4%',
                  alignItems: "center",
                }}
              >
                <Stack p={4} sx={{
                  height: "140px",
                  width: "100%",
                  borderRadius: "10px",
                  backgroundColor: "white",
                  boxShadow: '0px 1px 50px 0px rgba(0, 0, 0, 0.05)',
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
                            label={allData?.total_booking_percentage_diff >= 0 ? formatPercentage(allData?.total_booking_percentage_diff) : formatPercentage(Math.abs(allData?.total_booking_percentage_diff))}
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
                  boxShadow: '0px 1px 50px 0px rgba(0, 0, 0, 0.05)',
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
                            {t("Insights.Revenue")}
                          </Typography>
                          <Chip
                            sx={{
                              backgroundColor: allData?.total_revenue_percentage_diff >= 0 ? "#D1F3D4" : "#F5D7D7",
                              fontSize: 16,
                              fontWeight: 400,
                              color: allData?.total_revenue_percentage_diff >= 0 ? "#367B3D" : "#C74141",
                              borderRadius: '30px',
                              padding: "7px 2px 7px 10px",
                            }}
                            icon={<img height={16} src={allData?.total_revenue_percentage_diff >= 0 ? increase : decrease} />}
                            label={allData?.total_revenue_percentage_diff >= 0 ? formatPercentage(parseFloat(allData?.total_revenue_percentage_diff)) : formatPercentage(Math.abs(parseFloat(allData?.total_revenue_percentage_diff)))}
                          />

                        </Stack>
                        <Stack flex={1} flexDirection={'column'} justifyContent={'flex-end'} width={'100%'}>
                          <Typography variant="h5" sx={{ fontWeight: 700, color: "#1F1F1F", padding: 0, width: '100%' }}>
                            {formatAmount(parseFloat(allData?.total_revenue))}
                          </Typography>
                        </Stack>
                      </>
                    )
                  }


                </Stack>
              </Box>
            </Item>
          }

          {/* Revenue doughnut chart for pro user */}
          {
            !hasNoProPlan &&
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
                {t("Insights.TopRevenuePercentage")}
              </Typography>
              <Box
                sx={{
                  backgroundColor: "white",
                  filter: 'drop-shadow(0px 1px 50px rgba(0, 0, 0, 0.05))',
                  //boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                  borderRadius: "15px",
                  width: "100%",
                  position: 'relative'
                }}
                p={1.7}
              >
                {
                  loading || Top_revenue_per === undefined ?
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
                                <Stack display={'flex'} justifyContent={'space-between'} alignItems={'center'} flexDirection={'row'} width={'100%'}><Skeleton variant="text" height={40} width={"100%"} /> <Skeleton variant="text" height={40} width={"20%"} /></Stack>
                              )
                            })
                          }
                        </Stack>
                      </Stack>
                    </Stack>
                    :
                    <PieChart Data={Top_revenue_per} loading={loading} />
                }
              </Box>
            </Item>
          }

          {/* revenue Area chart for pro user */}
          {
            !hasNoProPlan &&
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
                {t("Insights.Earnings")}
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
                          {t("Insights.Revenue")}
                        </Typography>
                        <Typography
                          variant="h5"
                          fontWeight={700}
                          color="#1F1F1F"
                        >
                          {formatAmount(allData?.total_date_wise_earning)}
                        </Typography>
                      </Stack>
                      <Stack flexDirection={'column'} justifyContent={'flex-end'} alignItems={'flex-end'}>
                        <Chip
                          sx={{
                            backgroundColor: allData?.date_wise_revenue_diff >= 0 ? "#D1F3D4" : "#F5D7D7",
                            fontSize: 16,
                            fontWeight: 700,
                            color: allData?.date_wise_revenue_diff >= 0 ? "#367B3D" : "#C74141",
                            borderRadius: '30px',
                            padding: "7px 2px 7px 10px",
                            gap: 0.5
                          }}
                          icon={<img height={12} src={allData?.date_wise_revenue_diff >= 0 ? inflation : deflation} />}
                          label={allData?.date_wise_revenue_diff >= 0 ? formatAmount(allData?.date_wise_revenue_diff) : formatAmount(allData?.date_wise_revenue_diff)}
                        />
                        <Typography variant="subtitle1" color="#1F1F1F" fontWeight={400}>
                          {allData?.date_wise_revenue_diff >= 0 ? t("Insights.UpToLastPeriod") : t("Insights.DownToLastPeriod")}
                        </Typography>
                      </Stack>

                    </Stack>
                    <AreaChart Area_chart_Data={Area_chart_Data} startdate={startdate} endDate={endDate} />
                  </>
                }
              </Box>
            </Item>
          }

          {/*Avg. revenue per customer and Avg. revenue per booking with real data for pro user */}
          {
            !hasNoProPlan &&
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
                {t("Insights.Revenue")}
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: 'column', md: "row" },
                  justifyContent: "space-between",
                  gap: 2,
                  alignItems: "center",
                }}
              >

                <Stack p={4} sx={{
                  height: "140px",
                  width: { xs: "100%", md: "100%" },
                  borderRadius: "10px",
                  backgroundColor: "white",
                  boxShadow: " 0px 1px 50px 0px rgba(0, 0, 0, 0.05)",
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
                          <Skeleton variant="text" height={40} width={'70%'} sx={{ borderRadius: "10px" }} />
                          <Skeleton variant="text" height={40} width={'29%'} sx={{ borderRadius: "10px", ml: 2 }} />
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
                            {t("Insights.AvgRevenuePerCustomer")}
                          </Typography>
                          <Chip
                            sx={{
                              backgroundColor: allData?.avg_revenue_per_customer_diff >= 0 ? "#D1F3D4" : "#F5D7D7",
                              fontSize: 16,
                              fontWeight: 400,
                              color: allData?.avg_revenue_per_customer_diff >= 0 ? "#367B3D" : "#C74141",
                              borderRadius: '30px',
                              padding: "7px 2px 7px 10px",
                            }}
                            icon={<img height={16} src={allData?.avg_revenue_per_customer_diff >= 0 ? increase : decrease} />}
                            label={allData?.avg_revenue_per_customer_diff >= 0 ? formatPercentage(parseFloat(allData?.avg_revenue_per_customer_diff)) : (formatPercentage(Math.abs(parseFloat(allData?.avg_revenue_per_customer_diff))))}
                          />

                        </Stack>
                        <Stack flex={1} flexDirection={'column'} justifyContent={'flex-end'} width={'100%'}>
                          <Typography variant="h5" sx={{ fontWeight: 700, color: "#1F1F1F", padding: 0, width: '100%' }}>
                            {formatAmount((parseFloat(allData?.avg_revenue_per_customer)))}
                          </Typography>
                        </Stack>
                      </>
                    )
                  }
                </Stack>
                <Stack p={4} sx={{
                  height: "140px",
                  width: { xs: "100%", md: "100%" },
                  borderRadius: "10px",
                  backgroundColor: "white",
                  boxShadow: " 0px 1px 50px 0px rgba(0, 0, 0, 0.05)",
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
                          <Skeleton variant="text" height={40} width={'70%'} sx={{ borderRadius: "10px" }} />
                          <Skeleton variant="text" height={40} width={'29%'} sx={{ borderRadius: "10px", ml: 2 }} />
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
                            {t("Insights.AvgRevenuePerBooking")}
                          </Typography>
                          <Chip
                            sx={{
                              backgroundColor: allData?.avg_revenue_per_booking_diff >= 0 ? "#D1F3D4" : "#F5D7D7",
                              fontSize: 16,
                              fontWeight: 400,
                              color: allData?.avg_revenue_per_booking_diff >= 0 ? "#367B3D" : "#C74141",
                              borderRadius: '30px',
                              padding: "7px 2px 7px 10px",
                            }}
                            icon={<img height={16} src={allData?.avg_revenue_per_booking_diff >= 0 ? increase : decrease} />}
                            label={allData?.avg_revenue_per_booking_diff >= 0 ? formatPercentage(parseFloat(allData?.avg_revenue_per_booking_diff)) : (formatPercentage(Math.abs(parseFloat(allData?.avg_revenue_per_booking_diff))))}
                          />

                        </Stack>
                        <Stack flex={1} flexDirection={'column'} justifyContent={'flex-end'} width={'100%'}>
                          <Typography variant="h5" sx={{ fontWeight: 700, color: "#1F1F1F", padding: 0, width: '100%' }}>
                            {formatAmount(parseFloat(allData?.avg_revenue_per_booking))}
                          </Typography>
                        </Stack>
                      </>
                    )
                  }


                </Stack>

              </Box>
            </Item>
          }

          {/* Booking Channels for all with real data */}
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


              {loading || Booking_Channel === undefined ?
                <Stack sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', gap: '5%', marginBottom: '10px' }}>
                  <Skeleton variant="rounded" height={140} width={100} />
                  <Skeleton variant="rounded" height={170} width={100} />
                  <Skeleton variant="rounded" height={100} width={100} />
                </Stack> :
                <>
                  <Typography
                    variant="h7"
                    fontWeight={400}
                    color="#1F1F1F"
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

          {/* Top bookings for lock user with real data */}
          {
            hasNoProPlan &&
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
              <Typography variant="h2" color="black" fontWeight={600}>
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
                {
                  loading || Top_booking_per === undefined ?
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
                                <Stack display={'flex'} justifyContent={'space-between'} alignItems={'center'} flexDirection={'row'} width={'100%'}><Skeleton variant="text" height={40} width={"100%"} /> <Skeleton variant="text" height={40} width={"20%"} /></Stack>
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
          }

          {/* Locked Avg. revenue per customer and Avg. revenue per booking with dummy data */}
          {
            hasNoProPlan &&
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
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  gap: "4%",
                  alignItems: "center",
                }}
              >
                <Stack p={4} sx={{
                  height: "140px",
                  width: "100%",
                  borderRadius: "10px",
                  backgroundColor: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: 1.5,
                  paddingLeft: 2,
                  paddingRight: 2,
                  paddingBlock: 2,
                  position: 'relative'
                }}>
                  <OverLay showText={false} />
                  <Stack flex={1} width={'100%'} flexDirection={'row'} justifyContent={'space-between'} alignContent={'flex-start'}>
                    <Typography variant="h7" sx={{ fontWeight: 400, color: "#1F1F1F", paddingRight: 2 }}>
                      {t("Insights.AvgRevenuePerCustomer")}
                    </Typography>
                    <Chip
                      sx={{
                        backgroundColor: "#F5D7D7",
                        fontSize: 16,
                        fontWeight: 400,  
                        color: "#C74141",
                        borderRadius: '30px',
                        padding: "7px 2px 7px 10px",
                      }}
                      icon={<img height={16} src={decrease} />}
                      label={formatPercentage('34')}
                    />

                  </Stack>
                  <Stack flex={1} flexDirection={'column'} justifyContent={'flex-end'} width={'100%'}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: "#1F1F1F", padding: 0, width: '100%' }}>
                      {formatAmount(675.34)}
                    </Typography>
                  </Stack>

                </Stack>
                <Stack p={4} sx={{
                  height: "140px",
                  width: "100%",
                  borderRadius: "10px",
                  backgroundColor: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: 1.5,
                  paddingLeft: 2,
                  paddingRight: 2,
                  paddingBlock: 2,
                  position: 'relative',
                }}>
                  <OverLay showText={false} />
                  <Stack flex={1} width={'100%'} flexDirection={'row'} justifyContent={'space-between'} alignContent={'flex-start'} sx={{ filter: 'blur(5px)' }}>
                    <Typography variant="h7" sx={{ fontWeight: 400, color: "#1F1F1F", paddingRight: 2 }}>
                      {t("Insights.AvgRevenuePerBooking")}
                    </Typography>
                    <Chip
                      sx={{
                        backgroundColor: "#D1F3D4",
                        fontSize: 16,
                        fontWeight: 400,
                        color: "#367B3D",
                        borderRadius: '30px',
                        padding: "7px 2px 7px 10px",
                      }}
                      icon={<img height={20} src={increase} />}
                      label={formatPercentage('54')}
                    />

                  </Stack>
                  <Stack flex={1} flexDirection={'column'} justifyContent={'flex-end'} width={'100%'} sx={{ filter: 'blur(5px)' }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: "#1F1F1F", padding: 0, width: '100%' }}>
                      {formatAmount(142.76)}
                    </Typography>
                  </Stack>

                </Stack>
              </Box>
            </Item>
          }

          {/* Locked revenue Area chart for lock user with dummy data */}
          {
            hasNoProPlan &&
            <Item
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                height: "fit-content",
                boxShadow: "none",
                width: "100%",

              }}
            >
              <Box
                sx={{
                  backgroundColor: "white",
                  borderRadius: "15px",
                  width: "100%",
                  padding: 2,
                  paddingLeft: 3,
                  paddingRight: 3,
                  position: 'relative'
                }}
                p={3.7}
              >
                <OverLay />
                <Stack flex={1} flexDirection={'row'} justifyContent={'space-between'} sx={{ zIndex: 1, position: "relative" }}>
                  <Stack flexDirection={'column'} justifyContent={'flex-start'} alignItems={'flex-start'} >
                    <Typography
                      variant="h7"
                      fontWeight={400}
                      color="#1F1F1F"
                    >
                      {t("Insights.Revenue")}
                    </Typography>
                    <Typography
                      variant="h5"
                      fontWeight={700}
                      color="#1F1F1F"
                    >
                      {formatAmount(566.73)}
                    </Typography>
                  </Stack>
                  <Stack flexDirection={'column'} justifyContent={'flex-end'} alignItems={'flex-end'}>
                    <Chip
                      sx={{
                        backgroundColor: "#D1F3D4",
                        fontSize: 16,
                        fontWeight: 700,
                        color: "#367B3D",
                        borderRadius: '30px',
                        padding: "7px 2px 7px 10px",
                        gap: 0.5
                      }}
                      icon={<img height={18} src={inflation} />}
                      label={formatAmount(2175.33)}
                    />
                    <Typography variant="subtitle1" color="#1F1F1F" fontWeight={400}>
                      {t("Insights.UpToLastPeriod")}
                    </Typography>
                  </Stack>

                </Stack>
                <Stack sx={{ zIndex: 1, position: "relative" }}>
                  <AreaChart Area_chart_Data={RevenueDummyData} startdate={startdate} endDate={endDate} />
                </Stack>

              </Box>
            </Item>
          }

        </Stack>

        <Stack
          sx={{
            flex: 1,
            width: { xs: "100%", md: "100%" },
          }}
          gap={2}
        >
          {/* Top 3 Employees for pro user */}
          {
            !hasNoProPlan &&
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
                    <TopEmployee topEmployee={topEmployee} selectedPage={selectedButton} loading={loading} />
                    :
                    <Stack display={'flex'} alignItems={'flex-end'} justifyContent={'center'} flexDirection={'row'} gap={1}>
                      <Skeleton variant="rounded" width={100} height={150} />
                      <Skeleton variant="rounded" width={100} height={170} />
                      <Skeleton variant="rounded" width={100} height={120} />
                    </Stack>
                }

              </Box>
            </Item>
          }

          {/* Booking status for all users */}
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
                            <Stack display={'flex'} justifyContent={'space-between'} alignItems={'center'} flexDirection={'row'} width={'100%'}><Skeleton variant="text" height={40} width={"100%"} /> <Skeleton variant="text" height={40} width={"20%"} /></Stack>
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

          {/* Top 7 services for all users */}
          <Item
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              height: "fit-content",
              boxShadow: 'none',
              width: "100%",

            }}
          >
            <Typography variant="h6" color="black" fontWeight={700}>
              {t("Insights.Top7Services")}
            </Typography>

            <Box
              sx={{
                backgroundColor: "white",
                boxShadow: '0px 4px 55px 0px rgba(162, 164, 181, 0.20);',
                borderRadius: "15px",
                width: "100%",
              }}
            >
              {loading || Top_seven_services === undefined ?
                <Stack p={2.5}>
                  <Skeleton variant="text" height={40} />
                  <Skeleton variant="text" sx={{ marginTop: '-60px', marginBottom: '-60px' }} height={300} />
                </Stack>
                :
                <Topservices Top_data={Top_seven_services} selectedButton={selectedButton} />
              }
            </Box>
          </Item>

          {/* Top 3 Employees for lock user with dummy data */}
          {
            hasNoProPlan &&
            <Item
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                boxShadow: "none",
                width: "100%",
              }}
            >
              <Box
                sx={{
                  backgroundColor: "white",
                  borderRadius: "15px",
                  height: "100%",
                  width: "100%",
                  position: "relative",
                }}
                p={3.7}
              >
                <OverLay />
                <Box sx={{
                  position: "relative",
                  zIndex: 1,
                }}>
                  <TopEmployee topEmployee={dummyData} selectedButton={selectedButton} />
                </Box>

              </Box>
            </Item>
          }

          {/* Locked  New Customers and  Conversion Rate Online Booking with dummy data */}
          {
            hasNoProPlan &&
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
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  gap: "4%",
                  alignItems: "center",
                }}
              >
                <Stack p={4} sx={{
                  height: "140px",
                  width: "100%",
                  borderRadius: "10px",
                  backgroundColor: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: 1.5,
                  paddingLeft: 2,
                  paddingRight: 2,
                  paddingBlock: 2,
                  position: 'relative'
                }}>
                  <OverLay showText={false} />
                  <Stack flex={1} width={'100%'} flexDirection={'row'} justifyContent={'space-between'} alignContent={'flex-start'}>
                    <Typography variant="h7" sx={{ fontWeight: 400, color: "#1F1F1F", paddingRight: 2 }}>
                      {t("Insights.NewCustomers")}
                    </Typography>
                    <Chip
                      sx={{
                        backgroundColor: "#F5D7D7",
                        fontSize: 16,
                        fontWeight: 400,
                        color: "#C74141",
                        borderRadius: '30px',
                        padding: "7px 2px 7px 10px",
                      }}
                      icon={<img height={20} src={decrease} />}
                      label={formatPercentage('34')}
                    />

                  </Stack>
                  <Stack flex={1} flexDirection={'column'} justifyContent={'flex-end'} width={'100%'}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: "#1F1F1F", padding: 0, width: '100%' }}>
                      {13}
                    </Typography>
                  </Stack>

                </Stack>
                <Stack p={4} sx={{
                  height: "140px",
                  width: "100%",
                  borderRadius: "10px",
                  backgroundColor: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: 1.5,
                  paddingLeft: 2,
                  paddingRight: 2,
                  paddingBlock: 2,
                  position: 'relative',
                }}>
                  <OverLay showText={false} />
                  <Stack flex={1} width={'100%'} flexDirection={'row'} justifyContent={'space-between'} alignContent={'flex-start'}>
                    <Typography variant="h7" sx={{ fontWeight: 400, color: "#1F1F1F", paddingRight: 2 }}>
                      {t("Insights.ConversionRate1")}
                    </Typography>
                    <Chip
                      sx={{
                        backgroundColor: "#D1F3D4",
                        fontSize: 16,
                        fontWeight: 400,
                        color: "#367B3D",
                        borderRadius: '30px',
                        padding: "7px 2px 7px 10px",
                      }}
                      icon={<img height={20} src={increase} />}
                      label={formatPercentage('24')}
                    />

                  </Stack>
                  <Stack flex={1} flexDirection={'column'} justifyContent={'flex-end'} width={'100%'}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: "#1F1F1F", padding: 0, width: '100%' }}>
                      {formatPercentage(42.76)}
                    </Typography>
                  </Stack>

                </Stack>
              </Box>
            </Item>
          }

          {
            !hasNoProPlan &&
            <Item
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                height: "fit-content",
                boxShadow: 'none',
                width: '100%'
              }}
            >
              <Typography variant="h6" color="black" fontWeight={700}>
                {t("Insights.Confirmation&Remainder")}
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: 'column', md: "row" },
                  justifyContent: "space-between",
                  gap: 2,
                  alignItems: "center",
                    mb: 10,
                    width: '100%'
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
                            {t("Insights.SMSSent")}
                          </Typography>
                          <Chip
                            sx={{
                              backgroundColor: allData?.sms_wise_message_diff >= 0 ? "#D1F3D4" : "#F5D7D7",
                              fontSize: 16,
                              fontWeight: 400,
                              color: allData?.sms_wise_message_diff >= 0 ? "#367B3D" : "#C74141",
                              borderRadius: '30px',
                              padding: "7px 2px 7px 10px",
                            }}
                            icon={<img height={16} src={allData?.sms_wise_message_diff >= 0 ? increase : decrease} />}
                            label={allData?.sms_wise_message_diff >= 0 ? formatPercentage(allData?.sms_wise_message_diff) : (formatPercentage(Math.abs(allData?.sms_wise_message_diff)))}
                          />

                        </Stack>
                        <Stack flex={1} flexDirection={'column'} justifyContent={'flex-end'} width={'100%'}>
                          <Typography variant="h5" sx={{ fontWeight: 700, color: "#1F1F1F", padding: 0, width: '100%' }}>
                            {allData?.sms_wise_message}
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
                            {t("Insights.EmailSent")}
                          </Typography>
                          <Chip
                            sx={{
                              backgroundColor: allData?.email_wise_message_diff >= 0 ? "#D1F3D4" : "#F5D7D7",
                              fontSize: 16,
                              fontWeight: 400,
                              color: allData?.email_wise_message_diff >= 0 ? "#367B3D" : "#C74141",
                              borderRadius: '30px',
                              padding: "7px 2px 7px 10px",
                            }}
                            icon={<img height={16} src={allData?.email_wise_message_diff >= 0 ? increase : decrease} />}
                            label={allData?.email_wise_message_diff >= 0 ? formatPercentage(allData?.email_wise_message_diff) : (formatPercentage(Math.abs(allData?.email_wise_message_diff)))}
                          />

                        </Stack>
                        <Stack flex={1} flexDirection={'column'} justifyContent={'flex-end'} width={'100%'}>
                          <Typography variant="h5" sx={{ fontWeight: 700, color: "#1F1F1F", padding: 0, width: '100%' }}>
                            {allData?.email_wise_message}
                          </Typography>
                        </Stack>
                      </>
                    )
                  }
                </Stack>
              </Box>
            </Item>
          }
        </Stack>
      </Box>
    </Stack>
  );
};

export default GeneralPage;
