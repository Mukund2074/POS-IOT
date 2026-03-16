import React from "react";
import { Box, Skeleton, Stack, Typography, Tooltip as MuiTooltip } from "@mui/material"; // Import Tooltip as MuiTooltip
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { t } from "i18next";
import { drawCustomLabel } from "./utils/chartFunction";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

export const CustomerPieChart = ({ data, loading }) => {

  const colors = ["#FFA009", "#32D74B", "#FF453A", "#1172D3", "#CD11D3"]; // Custom colors for slices
  const topFive = data?.slice(0, 5) || [];
  const totalValue = topFive.reduce((acc, item) => acc + parseFloat(item.spend), 0);

  const customLabelPlugin = {
    id: "customLabel",
    beforeDraw(chart) {
      if (chart.config.data.datasets[0].data.length > 0) {
        const totalValue = chart.config.data.datasets[0].data.reduce(
          (sum, value) => sum + parseFloat(value),
          0
        );
        drawCustomLabel(chart, totalValue);
      }
    },
  };

  const chartData = {
    labels: topFive.map((item) => item.customer_name), // Labels from data
    datasets: [
      {
        data: topFive.map((item) => ((item.spend / totalValue) * 100).toFixed(2)), // Values from data
        backgroundColor: colors, // Slice colors
        borderColor: "#FFFFFF", // Border color
        borderWidth: 3, // Border width
        hoverOffset: 10, // Hover effect
        borderRadius: 25,
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: {
        display: false, // Hide legend
      },
      datalabels: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem) =>
            `${tooltipItem.label}: ${tooltipItem.raw}%`, // Custom tooltip
        },
      },
    },
    cutout: "89%",
    aspectRatio: 2.2,
  };

  return (
    <Stack
      flex={1}
      flexDirection="column"
      alignItems="center"
      justifyContent="space-between"
      paddingRight={2}
      sx={{ minHeight: 160 }}
    >
      <Stack
        flex={1}
        width="100%"
        alignItems="center"
        flexDirection={{ xs: 'column', lg: "row" }}
        justifyContent="space-between"
        // sx={{
        //   marginLeft: -5,
        // }}
      >
        <Stack justifyContent="flex-start" alignItems="flex-end" flexDirection="column">
          {loading || topFive.length === 0 ? (
            <Typography
              variant="h7" color="#A0A0A0" fontWeight={500} pl={3} pr={5} mb={'50%'}>
              {t("Insights.NoDataFound")}
            </Typography>
          ) : (
            <Doughnut
              data={chartData}
              options={chartOptions}
              plugins={[customLabelPlugin]}
            />
          )}
        </Stack>

        {topFive.length > 0 && (
          <Stack flex={1} justifyContent="space-between" flexDirection="column" width="100%">
            {topFive.map((item, index) => {
              const percentage = (totalValue > 0 ? ((item.spend / totalValue) * 100) : 0).toFixed(2);

              return loading ? (
                <Stack
                  key={index}
                  flex={1}
                  flexDirection="row"
                  width="100%"
                  justifyContent="space-between"
                >
                  <Stack flex={0.8} flexDirection="row" alignItems="center">
                    <Skeleton
                      variant="text"
                      height={30}
                      width="50%"
                      sx={{ borderRadius: "10px" }}
                    />
                  </Stack>
                  <Stack flex={0.2} flexDirection="row" alignItems="flex-end">
                    <Skeleton
                      variant="text"
                      height={30}
                      width="50%"
                      sx={{ borderRadius: "10px" }}
                    />
                  </Stack>
                </Stack>
              ) : (
                <Stack
                  key={index}
                  display={'flex'}
                  flexDirection="row"
                  width={"100%"}
                    justifyContent="space-between"
                >
                  <Stack flex={0.8} flexDirection="row" alignItems="center">
                    <Box
                      width="14px"
                      height="14px"
                      bgcolor={colors[index]}
                      marginRight="10px"
                      borderRadius="50%"
                    />
                    <MuiTooltip title={item.customer_name} arrow>
                      <Typography
                        variant="subtitle1"
                        textAlign="right"
                        fontWeight={500}
                        color="#1F1F1F"
                        sx={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: { xs: "100px", md: "190px" },
                        }}
                      >
                        {item.customer_name}
                      </Typography>
                    </MuiTooltip>
                  </Stack>

                  <Stack flex={0.2} flexDirection="row" alignItems="flex-end">
                    <Typography
                      width="100%"
                      variant="subtitle1"
                      textAlign="right"
                      fontWeight={700}
                      color="#545454"
                    >
                      {percentage}%
                    </Typography>
                  </Stack>
                </Stack>
              );
            })}
          </Stack>
        )}
      </Stack>
    </Stack>
  );
};
