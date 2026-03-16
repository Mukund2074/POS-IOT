import React from "react";
import { Box, Typography, Stack, Tooltip, Skeleton } from "@mui/material";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js";
import { drawCustomLabel } from "./utils/chartFunction";
import { formatPercentage } from "../../../utils/format-amout";
import { t } from "i18next";

ChartJS.register(ArcElement, ChartTooltip, Legend);

export const BookingPieChart = ({ loading, data }) => {
  const colors = ["#FFA009", "#32D74B", "#FF453A", "#1172D3", "#CD11D3"];
  const customLabels = ["Pending", "Completed", "Absence", "Cancelled"];

  const processedData = customLabels.map((label) => {
    if (label === "Completed") {
      // Combine 'Completed' and 'AUTOCOMPLETED'
      const completedItem = data?.find(
        (item) => item.status_name === "Completed"
      );
      const autoCompletedItem = data?.find(
        (item) => item.status_name === "AUTOCOMPLETED"
      );

      const total_booking =
        (completedItem?.total_booking || 0) +
        (autoCompletedItem?.total_booking || 0);
      const share_percentage_by_bookings =
        (completedItem?.share_percentage_by_bookings || 0) +
        (autoCompletedItem?.share_percentage_by_bookings || 0);

      return {
        status_name: "Completed",
        total_booking,
        share_percentage_by_bookings,
      };
    }

    const existingItem = data?.find((item) => item.status_name === label);
    return (
      existingItem || {
        status_name: label,
        total_booking: 0,
        share_percentage_by_bookings: 0,
      }
    );
  });

  const totalValue = processedData.reduce(
    (acc, item) => acc + item.total_booking,
    0
  );

  const chartData = {
    labels: processedData.map((item) => item.status_name),
    datasets: [
      {
        data: processedData.map((item) =>
          totalValue > 0 ? item.share_percentage_by_bookings : 0
        ),
        backgroundColor: colors,
        borderColor: "#FFFFFF",
        borderWidth: 3,
        hoverOffset: 8,
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
      legend: { display: false },
      datalabels: { display: false },
      tooltip: {
        callbacks: {
          label: (tooltipItem) =>
            `${tooltipItem.label || "Unknown"}: ${tooltipItem.raw || 0}%`,
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
      paddingRight={1}
      paddingTop={0}
      // sx={{ minHeight: 160 }}
    >
      <Stack
        flex={1}
        width="100%"
        alignItems="center"
        flexDirection={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        sx={{
          marginLeft: -5,
        }}
      >
        <Stack
          justifyContent="flex-start"
          alignItems="flex-end"
          flexDirection="column"
        >
          {data?.length <= 0 ? (
            <Typography
              variant="h7"
              color="#A0A0A0"
              fontWeight={500}
              pl={5}
              pr={5}
            >
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

        {processedData.length > 0 && (
          <Stack flex={1} justifyContent="space-between" flexDirection="column">
            {processedData.map((item, index) => {
              const percentage = totalValue
                ? ((item.total_booking / totalValue) * 100).toFixed(2)
                : "0.0";

              return (
                <Stack
                  key={index}
                  flex={1}
                  flexDirection="row"
                  width="100%"
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
                    <Tooltip title={item.status_name} arrow>
                      <Typography
                        variant="subtitle1"
                        fontWeight={500}
                        color="#1F1F1F"
                        sx={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: { xs: "100px", md: "190px" },
                        }}
                      >
                        {item.status_name} ({item.total_booking})
                      </Typography>
                    </Tooltip>
                  </Stack>

                  <Stack
                    flex={0.2}
                    width={"100%"}
                    display={"flex"}
                    justifyContent={"end"}
                    flexDirection="row"
                    alignItems="flex-end"
                  >
                    <Typography
                      variant="subtitle1"
                      textAlign="right"
                      fontWeight={700}
                      color="#545454"
                    >
                      {item.share_percentage_by_bookings}%
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
