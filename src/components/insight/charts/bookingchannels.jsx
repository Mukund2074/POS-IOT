import React from "react";
import { Box, Typography } from "@mui/material";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { formatAmount } from "../../../utils/format-amout";
import { t } from "i18next";
import numeral from "numeral";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  Title,
  ChartDataLabels
);

export const BarChart = ({ data, selectedButton }) => {


  const mainData = data
    ?.filter((item) => item?.source_name)
    ?.sort((a, b) => {
      const order = ["STOREAPP", "DIRECTWEBSTORE", "WEBMARKETPLACE"];
      return order.indexOf(a.source_name) - order.indexOf(b.source_name);
    }) || [];

  const labelMapping = {
    STOREAPP: t("Insights.Manual"),
    DIRECTWEBSTORE: t("Insights.DirectLink"),
    WEBMARKETPLACE: t("Insights.MarkertPlace"),
  };

  const shadowPlugin = [{
    id: 'shadow',
    beforeDraw: (chart) => {
      const { ctx } = chart;
      const _fill = ctx.fill;
      ctx.fill = function () {
        ctx.save();
        // ctx.shadowColor = 'black';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.50)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 2;
        _fill.apply(this, arguments);
        ctx.restore();
      };
    },
  }];

  const chartData = {
    labels: mainData.map(
      (item) => labelMapping[item.source_name] || item.source_name
    ),
    datasets: [
      {
        data: mainData.map((item) =>
          selectedButton === "2" ? item.earning : item.total_booking
        ),
        backgroundColor: "#1E88E5",
        borderRadius: 10,
        //maxBarThickness: 95,
        minBarLength: 40,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: { top: 30 },

    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.raw;
            return selectedButton === "2"
              ? `Earnings: ${formatAmount(value)}`
              : `Bookings: ${value}`;
          },
        },
      },
      datalabels: {
        labels: {
          inside: {
            display: true,
            color: "#FFFFFF",
            anchor: "end",
            align: "start",
            offset: 10,
            font: {
              size: selectedButton === "2" ? 12 : 16,
              weight: "bold",
            },
            formatter: (value) => {
              return selectedButton === "2"
                ? formatAmount(value, true)
                : value;
            },
          },
          outside: {
            display: true,
            color: "#1F1F1F",
            anchor: "end",
            align: "end",
            offset: -5,
            font: {
              size: 18,
            },
            formatter: (value, context) => {
              const label =
                context.chart.data.labels[context.dataIndex];
              return label;
            },
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { display: false },
        border: { display: true },
        barPercentage: 0.7,
        categoryPercentage: 0.7,
      },
      y: {
        grid: { display: false },
        ticks: {
          display: false,
          min: 0,
        },
        border: { display: false },
        suggestedMin: 10,
        beginAtZero: true,
      },
    },
  };
  return (
    <Box height="170px" px={{ xs: 3, md: 15 }} zIndex={0} display="flex" alignItems="center" justifyContent="center">
      {mainData.length > 0 ? (
        <Bar data={chartData} options={chartOptions} plugins={shadowPlugin} />
      ) : (
        <Typography variant="h7" color="#A0A0A0" fontWeight={500}>
          {t("Insights.NoDataFound")}
        </Typography>
      )}
    </Box>
  );
};
