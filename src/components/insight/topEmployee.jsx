import { Box, Skeleton, Stack, Typography } from "@mui/material";
import React from "react";
import firstEmp from "../../assets/firstEmp.png";
import secondEmp from "../../assets/secondEmp.png";
import thirdEmp from "../../assets/thirdEmp.png";
import { formatAmount } from "../../utils/format-amout";
import { t } from "i18next";

const employeeImages = [firstEmp, secondEmp, thirdEmp];

export const TopEmployee = ({ topEmployee, selectedPage, loading }) => {


  const TopEmplist = selectedPage == "2"
    ? (topEmployee?.top_3_revenue_wise_employee ? topEmployee?.top_3_revenue_wise_employee.filter((obj) => obj.earning > 0) : null)
    : topEmployee?.top_3_booking_wise_employee;

  if (!TopEmplist || TopEmplist.length === 0 || !TopEmplist.some(employee => employee.employee_name)) {
    return (
      <Stack width={'100%'}>
        <Typography variant="h7" width={'100%'} color="#A0A0A0" fontWeight={500} textAlign={'center'}>
          {t("Insights.NoDataFound")}
        </Typography>
      </Stack>
    );
  }


  // const validEmployees = TopEmplist.filter(
  //   (employee) => employee?.employee_name
  // );

  const displayOrder = [1, 0, 2];

  const employeeBoxes = [];
  for (let index of displayOrder) {
    if (index >= TopEmplist.length) continue;
    const employee = TopEmplist[index];

    // if (!employee?.employee_name) continue;

    const height = index === 0 ? "240px" : index === 1 ? "200px" : "160px";
    const borderRadius =
      TopEmplist.length === 1
        ? "10px 10px 10px 10px"
        : TopEmplist.length === 2
          ? index === 0
            ? "10px 10px 10px 0px"
            : "10px 10px 0px 10px"
          : index === 0
            ? "10px 10px 0px 0px"
            : index === 1
              ? "10px 10px 0px 10px"
              : "10px 10px 10px 0px";

    employeeBoxes.push(
      <Box
        key={index}
        sx={{
          display: "flex",
          justifyContent: "start",
          alignItems: "center",
          flexDirection: "column",
          backgroundColor: "#61A2FD",
          boxShadow: "0px 0px 20px 0px rgba(0, 0, 0, 0.25)",
          borderRadius,
          width: { xs: '30%', md: "20%" },
          height,
          color: "black",
          zIndex: index === 0 ? 1 : 0,
        }}
      >
        <Box component="img"
          src={employeeImages[index] || firstEmp}
          alt=""
          sx={{
            width: { xs: "80%",  },
            borderRadius: "5px 5px 0px 0px",
            paddingX: "20px"
          }} />
        <Typography
          variant="h7"
          sx={{ textAlign: "center", color: "#FFFFFF", fontWeight: 700 }}
        >
          {employee.employee_name}
        </Typography>
        {selectedPage == "2" ? (
          <Typography
            variant="subtitle2"
            sx={{ textAlign: "center", color: "#FFFFFF", fontWeight: 400 }}
          >
            {formatAmount(employee.earning, true)}
          </Typography>
        ) : (
          <Typography
            variant="subtitle2"
            sx={{ textAlign: "center", color: "#FFFFFF", fontWeight: 400 }}
          >
            {employee.total_booking} {employee.total_booking > 1 ? t("Common.Bookings") : t("Insights.Booking")}
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        zIndex: 0,
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "end",
        flexDirection: "row",
        borderBottom: "1px solid #DDE0F4",
        height: "100%",
      }}
    >
      {employeeBoxes}
    </Box>
  );
};
