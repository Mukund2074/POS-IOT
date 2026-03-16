import React, { useMemo, useState, useEffect } from "react";
import { Box, Button, Typography, Tooltip, Stack, Skeleton } from "@mui/material";
import { Doughnut } from "react-chartjs-2";
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip as ChartTooltip,
    Legend,
} from "chart.js";
import { formatPercentage } from "../../../../utils/format-amout";
import { drawCustomLabel } from "../utils/chartFunction";
import { t } from "i18next";

ChartJS.register(ArcElement, ChartTooltip, Legend);

const predefinedColors = [
    "#FFA009",
    "#32D74B",
    "#FF453A",
    "#1172D3",
    "#CD11D3",
    "#FFA009",
    "#32D74B",
    "#FF453A",
    "#1172D3",
    "#CD11D3",
    "#FFA009",
    "#32D74B",
    "#FF453A",
    "#1172D3",
    "#CD11D3",
    "#FFA009",
    "#32D74B",
    "#FF453A",
    "#1172D3",
    "#CD11D3",
    "#FFA009",
    "#32D74B",
    "#FF453A",
    "#1172D3",
    "#CD11D3",
    "#FFA009",
    "#32D74B",
    "#FF453A",
    "#1172D3",
    "#CD11D3",
    "#FFA009",
    "#32D74B",
    "#FF453A",
    "#1172D3",
    "#CD11D3",
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

export const CommonPieChart = ({ loading = true, Data = [], type = "" }) => {
    const [showMore, setShowMore] = useState(false);
    const [dataToDisplay, setDataToDisplay] = useState([]);
    const [colors, setColors] = useState(predefinedColors);

    // Update data and colors based on `type` and `Data`
    useEffect(() => {
        const displayedData = showMore ? Data : Data?.slice(0, 5) || [];

        if (type === "RevenueChart" || type === "BookingChart" || type === "CustomerChart") {
            const randomColors =
                displayedData.length > predefinedColors.length
                    ? Array.from({ length: displayedData.length - predefinedColors.length }, generateRandomColor)
                    : [];
            setColors([...predefinedColors, ...randomColors]);
        } else if (type === "BookingStatus") {
            const customLabels = ["Pending", "Completed", "Absence", "Cancelled"];
            const processedData = customLabels.map((label) => {
                const existingItem = Data.find((item) => item.status_name === label);
                return (
                    existingItem || {
                        status_name: label,
                        total_booking: 0,
                        share_percentage_by_bookings: 0,
                    }
                );
            });
            setDataToDisplay(processedData);
            setColors(predefinedColors);
        } else {
            setColors(predefinedColors);
        }

        setDataToDisplay(displayedData);
    }, [Data, showMore, type]);
    
    const chartData = {
        labels: dataToDisplay.map((item) => item.status_name),
        datasets: [
          {
            data: dataToDisplay.map((item) => item.share_percentage_by_bookings),
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
            sx={{ minHeight: 160 }}
        >
            <Stack flex={1} width={"100%"} alignItems={"center"} flexDirection={"row"} justifyContent={"space-between"}>
                <Stack justifyContent="flex-start" alignItems="flex-end" flexDirection="column">
                    {loading || dataToDisplay.length <= 0 ? (
                        <Typography variant="h5" color="#A0A0A0" fontWeight={500} width={250} pr={5}>
                             {t("Insights.NoDataFound")}
                        </Typography>
                    ) : (
                        <Doughnut data={chartData} options={chartOptions} plugins={[customLabelPlugin]} />
                    )}
                </Stack>

                {dataToDisplay.length > 0 && (
                    <Stack flex={1} justifyContent="space-between" alignItems="" flexDirection="column">
                        {dataToDisplay.map((item, index) => (
                            loading || dataToDisplay.length <= 0 ? (
                                <Stack
                                    key={index}
                                    flex={1}
                                    display={"flex"}
                                    flexDirection={"row"}
                                    width={"100%"}
                                    justifyContent={"space-between"}
                                >
                                    <Stack flex={0.8} flexDirection={"row"} alignItems="center">
                                        <Skeleton variant="text" height={30} width={"50%"} sx={{ borderRadius: "10px" }} />
                                    </Stack>
                                    <Stack flex={0.2} flexDirection={"row"} alignItems="flex-end">
                                        <Skeleton variant="text" height={30} width={"50%"} sx={{ borderRadius: "10px" }} />
                                    </Stack>
                                </Stack>
                            ) : (
                                <Stack
                                    key={index}
                                    flex={1}
                                    display={"flex"}
                                    flexDirection={"row"}
                                    width={"100%"}
                                    justifyContent={"space-between"}
                                >
                                    <Stack flex={0.8} flexDirection={"row"} alignItems="center">
                                        <Box
                                            width="14px"
                                            height="14px"
                                            bgcolor={colors[index]}
                                            marginRight="10px"
                                            borderRadius="50%"
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
                                            {formatPercentage(item.share_percentage_by_revenues)}
                                        </Typography>
                                    </Stack>
                                </Stack>
                            )
                        ))}
                    </Stack>
                )}
            </Stack>

            <Stack flex={1} width={"100%"} flexDirection={"row"} alignItems="flex-end" justifyContent="flex-end">
                <Button
                    variant="text"
                    onClick={() => setShowMore(!showMore)}
                    sx={{
                        paddingTop: 0,
                        paddingBottom: 0,
                        mt: 1,
                        "&:hover": {
                            backgroundColor: "transparent",
                        },
                    }}
                >
                    <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 500, color: "#A0A0A0", textTransform: "none" }}
                    >
                        {showMore ? t("Insights.ShowLess") :  t("Insights.ShowMore")}
                    </Typography>
                </Button>
            </Stack>
        </Stack>
    );
};
