import React from "react";
import { Box, Typography, useMediaQuery } from "@mui/material";
import Chart from "react-apexcharts";
import numeral from "numeral";
import { t } from "i18next";
import moment from "moment";
import { formatAmount } from "../../../utils/format-amout";

export const AreaChart = ({ Area_chart_Data, startdate, endDate }) => {

  const isLarge = useMediaQuery('lg');

  const calculateLabels = (start, end, data) => {
    const dayDifference = end.diff(start, "days");

    switch (true) {
      case dayDifference === 0:

        return {
          categories: Array.from({ length: 24 }, (_, i) => `${i + 1}`),
          seriesData: Array.from({ length: 24 }, (_, i) => {
            const hourData = data.filter((item) => {
              const [hour] = item.date.split(':').map(Number);
              return hour === i + 1;
            });

            return hourData.length > 0
              ? hourData.reduce((total, item) => total + parseFloat(item.earning), 0)
              : 0;
          }),
        };

      case dayDifference >= 1 && dayDifference < 7:
        // Labels in weekdays format: Mon, Tue, Wed, ..., Sun
        return {
          categories: Array.from({ length: dayDifference + 1 }, (_, i) =>
            start.clone().add(i, "days").format("ddd")
          ),
          seriesData: Array.from({ length: dayDifference + 1 }, (_, i) => {
            const date = start.clone().add(i, "days").format("YYYY-MM-DD");
            const dayData = data.find((item) => item.date === date);
            return dayData ? dayData.earning : 0;
          }),
        };

      case dayDifference >= 7 && dayDifference < 31:


        // Labels in days format: 1, 2, 3, ..., 31
        return {
          categories: Array.from({ length: dayDifference + 1 }, (_, i) => start.clone().add(i, "days").format("DD")),
          seriesData: Array.from({ length: dayDifference + 1 }, (_, i) => {
            const date = start.clone().add(i, "days").format("YYYY-MM-DD");
            const dayData = data.find((item) => item.date === date);

            return dayData ? dayData.earning : 0;
          }),
        };

      case dayDifference >= 31 && dayDifference < 365:
        return {
          categories: Array.from({ length: Math.ceil(dayDifference / 7) }, (_, i) => {
            const week = start.clone().add(i * 7, "days");
            return `${week.isoWeek()}, ${week.isoWeekYear()}`;
          }),
          seriesData: Array.from({ length: Math.ceil(dayDifference / 7) }, (_, i) => {
            const weekStart = start.clone().add(i * 7, "days").startOf("week");
            //const weekEnd = start.clone().add(i * 7, "days").endOf("week");
            const weekData = data.filter((item) => {
              const [weekNumber, year] = item.date.split(',').map(Number);
              return weekNumber === weekStart.isoWeek() && year === weekStart.year();
            });
            return weekData.reduce((sum, item) => sum + parseFloat(item.earning), 0);
          }),
        };

      case dayDifference >= 365:
        return {
          categories: Array.from({ length: Math.ceil(dayDifference / 30) }, (_, i) => {
            const month = start.clone().add(i, "months");
            return `${month.format("MMM, YYYY")}`;
          }),
          seriesData: Array.from({ length: Math.ceil(dayDifference / 30) }, (_, i) => {
            const monthStart = start.clone().add(i, "months").startOf("month").startOf("day");

            //const monthEnd = start.clone().add(i, "months").endOf("month").startOf("day");
            const monthData = data.filter((item) => {
              const [monthNumber, year] = item.date.split(',').map(Number);
              const date = moment({ year: year, month: monthNumber - 1 }); // month is 0-indexed in moment
              const itemMonthStart = monthStart.isSame(date, 'month') && item;
              return itemMonthStart;
            });

            return monthData.reduce((sum, item) => sum + parseFloat(item.earning), 0);
          }),
        };



      default:
        return { categories: [], seriesData: [] };
    }
  };
  const chartData = calculateLabels(startdate, endDate, Area_chart_Data);

  const [state, setState] = React.useState({
    series: [
      {
        name: "Earnings",
        data: chartData.seriesData,
      },
    ],
    options: {
      chart: {
        height: 350,
        type: "area",
        toolbar: {
          show: false,
        },
        zoom: {
          enabled: false,
        },
      },
      dataLabels: {
        enabled: false,
      },
      colors: ["#5565FF"],
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.5,
          opacityTo: 0.7,
          stops: [0, 90, 100],
        },
      },
      stroke: {
        curve: "smooth",
        width: 2,
      },
      xaxis: {
        categories: chartData.categories,
        labels: {
          formatter: (value) => value,
          style: {
            fontSize: isLarge ? "20px" : "7px",
          }
        },
      },
      yaxis: {
        labels: {
          formatter: (value) => numeral(value).format("0.[0]a"),
        },
      },
      tooltip: {
        theme: "dark",
        x: {
          formatter: (value, { dataPointIndex }) => {
            return `${chartData.categories[dataPointIndex]}` || "";
          },
        },
        y: {
          formatter: (value, { dataPointIndex }) => {
            return `${formatAmount(value)}` || "";
          },
        }
      },
    },
  });

  return (
    <Box minWidth="100%" height="100%">
      {(chartData.seriesData.length <= 0 || Area_chart_Data.length <= 0) || (chartData.seriesData.length > 0 && chartData.seriesData.every((item) => item === 0)) ? (
        <Typography variant="h7" color="#A0A0A0" fontWeight={500} pb={10}>
          {t("Insights.NoDataFound")}
        </Typography>
      ) : (
        <Chart
          options={state.options}
          series={state.series}
          height="100%"
          type="area"
          width="100%"
        />
      )}
    </Box>
  );
}; 
