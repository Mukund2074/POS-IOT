import React, { useState } from "react";
import { Box, Button, Typography, Tooltip, Stack, Skeleton } from "@mui/material";
import { Doughnut } from "react-chartjs-2";
import { formatPercentage } from "../../../utils/format-amout";
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend } from "chart.js";
import { t } from "i18next";
import { drawCustomLabel } from "./utils/chartFunction";

ChartJS.register(ArcElement, ChartTooltip, Legend);

const predefinedColors = ["#FFA009", "#32D74B", "#FF453A", "#1172D3", "#CD11D3"];

// Function to generate random color in HEX format
const generateRandomColor = () => {
  const randomColor = Math.floor(Math.random() * 16777215).toString(16);
  return `#${randomColor.padStart(6, "0")}`;
};

export const BookingPercentagePieChart = ({ Top_booking_per, loading }) => {
  const [showMore, setShowMore] = useState(false);

  // Handle data for display
  const dataToDisplay = showMore ? Top_booking_per : Top_booking_per.slice(0, 5);
  const randomColors = dataToDisplay.length > 5
    ? Array.from({ length: dataToDisplay.length - 5 }, generateRandomColor)
    : [];
  const colors = [...predefinedColors, ...randomColors];

  const topFive = dataToDisplay;

  // Data structure for Chart.js
  const chartData = {
    labels: topFive.map((item) => item.service_name),
    datasets: [
      {
        data: topFive.map((item) => item?.share_percentage_by_bookings.toFixed(2)),
        backgroundColor: colors,
        borderColor: "#FFFFFF",
        borderWidth: 3,
        hoverOffset: 10,
        borderRadius: 25,
      },
    ],
  };

  const customLabelPlugin = {
    id: "customLabel",
    beforeDraw(chart) {
      const totalValue = chart.config.data.datasets[0].data.reduce(
        (sum, value) => sum + value,
        0
      );
      drawCustomLabel(chart, totalValue);
    },
  };
  const chartOptions = {
    plugins: {
      legend: {
        display: false,
      },
      datalabels: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem) =>
            `${tooltipItem.label}: ${tooltipItem.raw}%`,
        },
      },
    },
    cutout: "89%",
    aspectRatio: 2.2,
  };

  return (

    <Stack flex={1}
      flexDirection={'column'}
      alignItems="center"
      justifyContent="space-between"
      paddingRight={2}
      sx={{ minHeight: 160 }}

    >
      <Stack flex={1} width={'100%'} alignItems={{ xs: '', md: 'center' }} flexDirection={{ xs: 'column', md: "row" }} justifyContent={'space-between'}>

        <Stack
          justifyContent="flex-start"
          alignItems="center"
          flexDirection="column"

          sx={{
            // marginLeft: -5, 
          }}
        >
          {loading || topFive.length <= 0 || Top_booking_per === undefined || Top_booking_per.length < 0 ? (
            <Typography variant="h7" color="#A0A0A0" fontWeight={500} pl={{ xs: 0, md: 5 }} pr={{ xs: 0, md: 5 }}>
              {t("Insights.NoDataFound")}
            </Typography>
          ) : (
            <Doughnut data={chartData} options={chartOptions} plugins={[customLabelPlugin]} />
          )}
        </Stack>

        {Top_booking_per.length > 0 && (

          <Stack
            flex={1}
            justifyContent="space-between"
            alignItems=""
            flexDirection="column"
          >
            {topFive.map((item, index) => (

              loading || Top_booking_per.length <= 0 ?

                <Stack flex={1} display={'flex'} flexDirection={'row'} width={'100%'} justifyContent={'space-between'} >
                  <Stack flex={0.8} key={index} flexDirection={'row'} alignItems="center" >
                    <Skeleton variant="text" height={30} width={'50%'} sx={{ borderRadius: '10px' }} />
                  </Stack>

                  <Stack flex={0.2} flexDirection={'row'} alignItems="flex-end" >
                    <Skeleton variant="text" height={30} width={'50%'} sx={{ borderRadius: '10px' }} />
                  </Stack>
                </Stack>

                :

                <Stack flex={1} display={'flex'} flexDirection={'row'} width={'100%'} justifyContent={'space-between'} >

                  <Stack flex={0.8} key={index} flexDirection={'row'} alignItems="center" >
                    <Box
                      width="14px"
                      height="14px"
                      bgcolor={colors[index]}
                      marginRight="10px"
                      borderRadius="50%"
                      paddingTop={0}
                      paddingBottom={0}
                    />
                    <Tooltip title={item.service_name} arrow>
                      <Typography
                        variant="subtitle1"
                        textAlign={"right"}
                        fontWeight={500}
                        color="#1F1F1F"
                        sx={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: { xs: '100px', md: "190px" },

                          marginBottom: 0
                        }}
                      >
                        {item.service_name.length > 15
                          ? `${item.service_name.slice(0, 12)}...`
                          : item.service_name}
                        <span style={{ fontWeight: 400, color: "#1F1F1F" }}>
                          &nbsp;({item.total_booking})
                        </span>
                      </Typography>
                    </Tooltip>
                  </Stack>

                  <Stack flex={0.2} flexDirection={'row'} alignItems="flex-end" >

                    <Typography
                      width={'100%'}
                      variant="subtitle1"
                      textAlign={"right"}
                      fontWeight={700}
                      color="#545454"
                    >
                      {item?.share_percentage_by_bookings}%
                    </Typography>
                  </Stack>
                </Stack>
            ))}
          </Stack>
        )}
      </Stack>

      {
        Top_booking_per.length <= 5 ? null :

          <Stack flex={1}
            width={'100%'}
            flexDirection={'row'}
            alignItems="flex-end"
            justifyContent="flex-end"

          >
            <Button variant="text" onClick={() => setShowMore(!showMore)} sx={{
              paddingTop: 0, paddingBottom: 0, mt: 1, mr: 0, pr: 0, pl: 0,
              "&:hover": {
                //you want this to be the same as the backgroundColor above
                backgroundColor: "transparent"
              }
            }} >
              {loading || dataToDisplay.length <= 0 || topFive === undefined ? null :
                <Typography variant="subtitle2" sx={{ fontWeight: 500, color: "#A0A0A0", textTransform: "none" }} >
                  {showMore ? t("Insights.ShowLess") : t("Insights.ShowMore")}
                </Typography>
              }
            </Button>
          </Stack>
      }
    </Stack>
  );
};
