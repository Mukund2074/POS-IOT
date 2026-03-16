import { Box, Typography } from "@mui/material";
import React from "react";
import proImg from "../../assets/lock.svg"
import { t } from "i18next";

export const OverLay = ({ showText = true }) => {

    return (
        <Box bgcolor={'rgba(205, 205, 205, 0.80)'} borderRadius={'15px'} position={'absolute'} height={'100%'} width={'100%'} zIndex={10} top={0} bottom={0} left={0} right={0} display={'flex'} justifyContent={'center'} alignItems={'center'} flexDirection={'column'} gap={5} sx={{backdropFilter: 'blur(10px)'}}>
            {showText && <Typography color="#FFFFFF" variant="h3" fontWeight={700}>
                {t("Insights.PROPackageRequired")}
            </Typography>}
            <img src={proImg} height={50} width={50} />
        </Box>
    );
}