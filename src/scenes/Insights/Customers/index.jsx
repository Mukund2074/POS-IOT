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
import increase from "../../../assets/increase.png";
import decrease from "../../../assets/decrease.png";
import { CustomerPieChart } from "../../../components/insight/charts/customerpiechart";
import { CustomerAreaChart } from "../../../components/insight/charts/customerareachart";
import { TopCustomers } from "../../../components/insight/top6customers";
import inflation from "../../../assets/Polygon 17.svg";
import deflation from "../../../assets/Polygon 17(1).svg";
import { formatPercentage } from "../../../utils/format-amout";
import DataBox from "../../../components/insight/DataBox";
import { t } from "i18next";

const CustomersPage = (props) => {
  const { allData, loading, selectedPage, startdate, endDate } = props;
  const Top_customer = allData?.top_6_spending_wise_customer;
  const Top_customer_per = allData?.top_6_spending_wise_customer ? allData?.top_6_spending_wise_customer.filter((obj) => obj.spend > 0) : null;

  const Area_chart_Data = allData?.date_booking_data;

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

  const dataBoxes = [
    {
      label: 'Total',
      heading: t("Common.Total"),
      value: allData?.total_customer,
      percentageDiff: allData?.total_customer_diff,
      icon: allData?.total_customer_diff >= 0 ? increase : decrease,
      formatValue: (val) => val,
    },
    {
      label: 'Customer return rate',
      heading: t("Insights.CustomerReturnRate"),
      value: allData?.returning_customer,
      percentageDiff: allData?.returning_customer_diff,
      icon: allData?.returning_customer_diff >= 0 ? increase : decrease,
      formatValue: (val) => formatPercentage(val),
    },
    {
      label: 'New Customers',
      heading: t("Insights.NewCustomers"),
      value: allData?.new_custromer,
      percentageDiff: allData?.new_customer_diff,
      icon: allData?.new_customer_diff >= 0 ? increase : decrease,
      formatValue: (val) => val,
    },
    {
      label: 'Conversion Rate',
      heading: t("Insights.ConversionRate2"),
      value: allData?.conversion_rate,
      percentageDiff: allData?.conversion_rate_diff,
      icon: allData?.conversion_rate_diff >= 0 ? increase : decrease,
      formatValue: (val) => formatPercentage(val),
    },
  ];

  return (
    <Box sx={{ width: '100%', display: "flex", flexDirection: "column", gap: 2 }}>

      <Typography variant="h6" color="black" display={'flex'} alignItems={'flex-end'} fontWeight={700}>{selectedPage}</Typography>

      <Grid2 container spacing={3} >

        {dataBoxes.map((box, index) => (
          <Grid2 size={{ xs: 12, md: 3 }}>
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

      <Grid2 container spacing={3} >
        <Grid2 size={{ xs: 12, lg: 6 }}>

          <Item
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              height: "fit-content",
              boxShadow: 'none'
            }}
          >
            <Typography variant="h6" color="black" fontWeight={700}>
              {t("Insights.TopCustomerPercentage")}
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
                loading || Top_customer_per === undefined ?
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
                  <CustomerPieChart data={Top_customer_per} />
              }
            </Box>
          </Item>

          <Item
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              height: "fit-content",
              boxShadow: 'none'
            }}
          >
            <Typography variant="h6" color="black" fontWeight={700}>
              {t("Insights.CustomerAmount")}
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
                        {t("Insights.CustomerAmount")}
                      </Typography>
                      <Typography
                        variant="h5"
                        fontWeight={700}
                        color="#1F1F1F"
                      >
                        {allData?.total_date_wise_customer}
                      </Typography>
                    </Stack>
                    <Stack flexDirection={'column'} justifyContent={'flex-end'} alignItems={'flex-end'}>
                      <Chip
                        sx={{
                          backgroundColor: allData?.date_wise_customer_diff >= 0 ? "#D1F3D4" : "#F5D7D7",
                          fontSize: 16,
                          fontWeight: 700,
                          color: allData?.date_wise_customer_diff >= 0 ? "#367B3D" : "#C74141",
                          borderRadius: '30px',
                          padding: "7px 2px 7px 10px",
                          gap: 0.5
                        }}
                        icon={<img height={12} src={allData?.date_wise_customer_diff >= 0 ? inflation : deflation} />}
                        label={allData?.date_wise_customer_diff >= 0 ? allData?.date_wise_customer_diff : Math.abs(allData?.date_wise_customer_diff)}
                      />
                      <Typography variant="subtitle1" color="#1F1F1F" fontWeight={400}>
                        {allData?.date_wise_customer_diff >= 0 ? t("Insights.UpToLastPeriod") : t("Insights.DownToLastPeriod")}
                      </Typography>
                    </Stack>

                  </Stack>
                  <CustomerAreaChart Area_chart_Data={Area_chart_Data} startdate={startdate} endDate={endDate} />
                </>
              }
            </Box>
          </Item>

        </Grid2>

        <Grid2 size={{ xs: 12, lg: 6 }}>

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
              {t("Insights.Top6Customers")}
            </Typography>

            <Box
              sx={{
                backgroundColor: "white",
                boxShadow: '0px 4px 55px 0px rgba(162, 164, 181, 0.20)',
                borderRadius: "15px",
                width: "100%",
              }}
            >
              {loading || Top_customer === undefined ?
                <Stack p={2.5}>
                  <Skeleton variant="text" height={40} />
                  <Skeleton variant="text" sx={{ marginTop: '-60px', marginBottom: '-60px' }} height={300} />
                </Stack> :
                <TopCustomers Top_customer={Top_customer} />
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
              width: '100%'
            }}
          >
            <Typography variant="h6" color="black" fontWeight={700}>
              {t("Insights.ProfilePage")}
            </Typography>

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
                width: '100%',
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
                          {t("Insights.PageVisits")}
                        </Typography>
                        <Chip
                          sx={{
                            backgroundColor: allData?.page_visit_diff >= 0 ? "#D1F3D4" : "#F5D7D7",
                            fontSize: 16,
                            fontWeight: 400,
                            color: allData?.page_visit_diff >= 0 ? "#367B3D" : "#C74141",
                            borderRadius: '30px',
                            padding: "7px 2px 7px 10px",
                          }}
                          icon={<img height={16} src={allData?.page_visit_diff >= 0 ? increase : decrease} />}
                          label={allData?.page_visit_diff >= 0 ? formatPercentage(allData?.page_visit_diff) : formatPercentage(Math.abs(allData?.page_visit_diff))}
                        />

                      </Stack>
                      <Stack flex={1} flexDirection={'column'} justifyContent={'flex-end'} width={'100%'}>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: "#1F1F1F", padding: 0, width: '100%' }}>
                          {allData?.page_visit}
                        </Typography>
                      </Stack>
                    </>
                  )
                }
              </Stack>

              <Stack p={4} sx={{
                height: "140px",
                width: '100%',
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
                          {t("Insights.WebsiteVisits")}
                        </Typography>
                        <Chip
                          sx={{
                            backgroundColor: allData?.website_visit_diff >= 0 ? "#D1F3D4" : "#F5D7D7",
                            fontSize: 16,
                            fontWeight: 400,
                            color: allData?.website_visit_diff >= 0 ? "#367B3D" : "#C74141",
                            borderRadius: '30px',
                            padding: "7px 2px 7px 10px",
                          }}
                          icon={<img height={16} src={allData?.website_visit_diff >= 0 ? increase : decrease} />}
                          label={allData?.website_visit_diff >= 0 ? formatPercentage(allData?.website_visit_diff) : formatPercentage(Math.abs(allData?.website_visit_diff))}
                        />

                      </Stack>
                      <Stack flex={1} flexDirection={'column'} justifyContent={'flex-end'} width={'100%'}>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: "#1F1F1F", padding: 0, width: '100%' }}>
                          {allData?.website_visit}
                        </Typography>
                      </Stack>
                    </>
                  )
                }
              </Stack>
            </Box>
          </Item>

        </Grid2>
      </Grid2>
    </Box >
  );
};

export default CustomersPage;
