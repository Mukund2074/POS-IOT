import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { Box, Button, IconButton, Typography } from "@mui/material";
import React from "react";
import { shiftWeek } from '../../utils/Functions';

import { t } from "i18next";

export default function Shifter({ controller, setController }) {
    const handleClick = ({ type }) => {
        const newDate = shiftWeek(controller.date, controller.format, type);
        setController((prev) => ({
            ...prev,
            date: newDate[0],
            weekNumber: newDate[1].weekNumber,
            weekDates: newDate[1].weekDates,
            weekArray: newDate[1].weekArray
        }));
    };

    return (
        <Box width={"100%"} display={"flex"} flexDirection={{ xs: 'column', lg: 'row' }} alignItems={{ lg: 'center' }} >
            <Box
                width={{ xs: '100%', lg: 'auto' }}
                display={"flex"}
                flexDirection={"row"}
                alignItems={"center"}
                justifyContent={"space-between"}
                gap={1}
                height={35}
                border={"1px solid #D9D9D9"}
                borderRadius={"13px"}
                sx={{ mt: 3, mb: 2 }}
            >
                <IconButton disableRipple onClick={() => handleClick({ type: "previous" })}>
                    <ChevronLeft />
                </IconButton>

                <Typography variant="body2" sx={{ fontWeight: 700 }}>

                    {controller.weekNumber ? `${t('Setting.Weeks')} ${controller.weekNumber}` : `${t('Setting.Weeks')} 1`}
                </Typography>

                <IconButton disableRipple onClick={() => handleClick({ type: "next" })}>
                    <ChevronRight />
                </IconButton>
            </Box>

            <Box
                marginLeft={"auto"}
                width={{ xs: '100%', lg: 'auto' }}
                display={"flex"}
                flexDirection={{ xs: 'column', lg: 'row' }}
                alignItems={"center"}
                gap={1}
                my={{ xs: 2, lg: 0 }}
            >
                <Button
                    size="small"
                    onClick={() => setController((prev) => ({ ...prev, format: "all" }))}
                    sx={{
                        color: controller.format === "all" ? "#ffffff" : "",
                        backgroundColor: controller.format === "all" ? "#44B904" : "",
                        borderRadius: "13px",
                        px: 2,
                        width: '100%',
                        textTransform: 'capitalize',
                        textWrap: 'nowrap',
                        fontWeight: 700,
                        // padding: "10px 15px ",
                        border: controller.format != "all" && "1px solid #D9D9D9",
                    }}
                >
                    {t("Setting.AllWeeks")}
                </Button>

                <Button
                    size="small"
                    onClick={() => setController((prev) => ({ ...prev, format: "evenweek" }))}
                    sx={{
                        color: controller.format === "evenweek" ? "#ffffff" : "",
                        backgroundColor: controller.format === "evenweek" ? "#44B904" : "",
                        borderRadius: "13px",
                        px: 2,
                        width: '100%',
                        textTransform: 'capitalize',
                        textWrap: 'nowrap',
                        fontWeight: 700,
                        // padding: "10px 15px ",
                        // border: "1px solid #D9D9D9",
                        border: controller.format != "evenweek" && "1px solid #D9D9D9",
                    }}
                >
                    {t("Setting.EvenWeeks")}
                </Button>

                <Button
                    size="small"
                    onClick={() => setController((prev) => ({ ...prev, format: "oddweek" }))}
                    sx={{
                        color: controller.format === "oddweek" ? "#ffffff" : "",
                        backgroundColor: controller.format === "oddweek" ? "#44B904" : "",
                        borderRadius: "13px",
                        px: 2,
                        width: '100%',
                        textTransform: 'capitalize',
                        textWrap: 'nowrap',
                        fontWeight: 700,
                        // padding: "10px 15px ",
                        border: controller.format != "oddweek" && "1px solid #D9D9D9",
                    }}
                >
                    {t("Setting.OddWeeks")}
                </Button>
            </Box>
        </Box>
    );
}
