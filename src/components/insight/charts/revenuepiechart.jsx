import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Tooltip,
  Stack,
  Skeleton,
} from "@mui/material";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js";
import { formatPercentage } from "../../../utils/format-amout";
import { drawCustomLabel } from "./utils/chartFunction";
import { t } from "i18next";

ChartJS.register(ArcElement, ChartTooltip, Legend);
const predefinedColors = [
  "#FFA009",
  "#32D74B",
  "#FF453A",
  "#1172D3",
  "#CD11D3",
];

// Function to generate random color in HEX format
const generateRandomColor = () => {
  const randomColor = Math.floor(Math.random() * 16777215).toString(16);
  return `#${randomColor.padStart(6, "0")}`;
};

export const PieChart = ({ Data, loading }) => {
  const [showMore, setShowMore] = useState(false);

  const { dataToDisplay, colors } = useMemo(() => {
    const displayedData = showMore ? Data : Data?.slice(0, 5) || [];
    const randomColors =
      displayedData.length > 5
        ? Array.from({ length: displayedData.length - 5 }, generateRandomColor)
        : [];
    const allColors = [...predefinedColors, ...randomColors];

    return { dataToDisplay: displayedData, colors: allColors };
  }, [showMore, Data]);

  const chartData = useMemo(
    () => ({
      labels: dataToDisplay.map((item) => item.service_name),
      datasets: [
        {
          data: dataToDisplay.map((item) => item.share_percentage_by_revenues),
          backgroundColor: colors,
          borderColor: "#FFFFFF",
          borderWidth: 3,
          hoverOffset: 10,
          borderRadius: 25,
        },
      ],
    }),
    [dataToDisplay, colors]
  );

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
          label: (tooltipItem) => `${tooltipItem.label}: ${tooltipItem.raw}%`,
        },
      },
    },
    cutout: "89%",
    aspectRatio: 2.2,
  };
  return (
    <Stack
      flex={1}
      flexDirection={"column"}
      alignItems="center"
      justifyContent="space-between"
      paddingRight={2}
      sx={{ minHeight: 100 }}
      position={"relative"}
    >
      <Stack
        flex={1}
        width={"100%"}
        height={"100%"}
        alignItems={{ xs: "", lg: "center" }}
        flexDirection={{ xs: "column", lg: "row" }}
        justifyContent={"space-between"}
      >
        <Stack
          justifyContent="flex-start"
          alignItems="center"
          flexDirection="column"
          width={{ xs: "100%", lg: "30%" }}
          sx={{
            // marginLeft: -5,
            mx: "auto",
          }}
        >
          {loading || dataToDisplay.length <= 0 || Data === undefined ? (
            <Typography
              sx={{
                height: "100%",
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              variant="h7"
              color="#A0A0A0"
              fontWeight={500}
              pl={5}
              width={"100%"}
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

        <Stack
          flex={1}
          justifyContent="space-between"
          alignItems=""
          flexDirection="column"
          width={{ xs: "100%", lg: "70%" }}
        >
          {dataToDisplay.map((item, index) => (
            <Stack
              flex={1}
              display={"flex"}
              flexDirection={"row"}
              width={"100%"}
              justifyContent={"space-between"}
            >
              <Stack
                flex={0.8}
                key={index}
                flexDirection={"row"}
                alignItems="center"
              >
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
                      maxWidth: { xs: "100px", md: "190px" },

                      marginBottom: 0,
                    }}
                  >
                    {item.service_name}
                  </Typography>
                </Tooltip>
              </Stack>

              <Stack flex={0.2} flexDirection={"row"} alignItems="flex-end">
                <Typography
                  width={"100%"}
                  variant="subtitle1"
                  textAlign={"right"}
                  fontWeight={700}
                  color="#545454"
                >
                  {item.share_percentage_by_revenues}%
                </Typography>
              </Stack>
            </Stack>
          ))}
        </Stack>
      </Stack>

      <Stack
        flex={1}
        width={"100%"}
        flexDirection={"row"}
        alignItems="flex-end"
        justifyContent="flex-end"
      >
        {dataToDisplay.length > 4 && (
          <Button
            variant="text"
            onClick={() => setShowMore(!showMore)}
            sx={{
              paddingTop: 0,
              paddingBottom: 0,
              mt: 1,
              mr: 0,
              pr: 0,
              pl: 0,
              "&:hover": { backgroundColor: "transparent" },
            }}
          >
            {loading ||
            dataToDisplay.length <= 0 ||
            Data === undefined ? null : (
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 500,
                  color: "#A0A0A0",
                  textTransform: "none",
                }}
              >
                {showMore ? t("Insights.ShowLess") : t("Insights.ShowMore")}
              </Typography>
            )}
          </Button>
        )}
      </Stack>
    </Stack>
  );
};
