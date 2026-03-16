import React from 'react';
import { Box, Card, CardContent, Chip, Divider, Grid2, Skeleton, Stack, Typography } from '@mui/material';
import { formatPercentage } from '../../utils/format-amout';


const DataBox = ({ label, heading, value, percentageDiff, loading, icon, formatValue, sx }) => {

    return (
        <Stack p={4} sx={{
            height: "140px",
            // width: "25%",
            borderRadius: "10px",
            backgroundColor: "white",
            boxShadow: "0px 1px 50px 0px rgba(0, 0, 0, 0.05)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 1.5,
            paddingLeft: 2,
            paddingRight: 2,
            paddingBlock: 2,
            ...sx
        }}>
            {loading || value === undefined ?
                (
                    <>
                        <Stack flex={1} width={'100%'} flexDirection={'row'} justifyContent={'space-between'} alignContent={'flex-start'}>
                            <Skeleton variant="text" height={40} width={'70%'} sx={{ borderRadius: "10px" }} />
                            <Skeleton variant="text" height={40} width={'29%'} sx={{ borderRadius: "10px", ml: 2 }} />
                        </Stack>
                        <Stack flex={1} flexDirection={'column'} justifyContent={'flex-end'} width={'100%'}>
                            <Skeleton variant="text" height={60} width={'100%'} sx={{ borderRadius: "10px" }} />
                        </Stack>
                    </>
                )
                :
                (
                    <>
                        <Stack flex={1} width={'100%'} flexDirection={'row'} justifyContent={'space-between'} alignContent={'flex-start'}>
                            <Typography variant="h7" sx={{ fontWeight: 400, color: "#1F1F1F", paddingRight: 2 }}>
                                {heading}
                            </Typography>
                            <Chip
                                sx={{
                                    backgroundColor: percentageDiff >= 0 ? "#D1F3D4" : "#F5D7D7",
                                    fontSize: 16,
                                    fontWeight: 400,
                                    color: percentageDiff >= 0 ? "#367B3D" : "#C74141",
                                    borderRadius: '30px',
                                    padding: "7px 2px 7px 10px",
                                }}
                                icon={<img height={16} src={icon} />}
                                label={percentageDiff >= 0 ? formatPercentage(percentageDiff) : formatPercentage(Math.abs(percentageDiff))}
                            />

                        </Stack>
                        <Stack flex={1} flexDirection={'column'} justifyContent={'flex-end'} width={'100%'}>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: "#1F1F1F", padding: 0, width: '100%' }}>
                                {formatValue ? formatValue(value) : value}
                            </Typography>
                        </Stack>
                    </>
                )
            }


        </Stack>
    );

    // <Box
    //     p={4}
    //     sx={{
    //         height: "140px",
    //         width: "25%",
    //         borderRadius: "10px",
    //         backgroundColor: "white",
    //         boxShadow: "0px 4px 4px 0px #00000040",
    //         display: "flex",
    //         alignItems: "center",
    //         justifyContent: "center",
    //     }}
    // >
    //     <Grid2
    //         container
    //         sx={{
    //             display: "flex",
    //             flexDirection: "row",
    //             justifyContent: "space-between",
    //             width: '100%'
    //         }}
    //     >
    //         <Grid2 item size={6}>
    //             <Grid2
    //                 container
    //                 sx={{
    //                     display: "flex",
    //                     flexDirection: "column",
    //                     justifyContent: "space-around",
    //                     alignItems: "top",

    //                 }}
    //             >
    //                 <Grid2 item sx={{ minHeight: '85px' }}>
    //                     <Typography variant="h7" sx={{ fontWeight: 400, color: "#1F1F1F" }}>
    //                         {heading}
    //                     </Typography>
    //                 </Grid2>
    //                 <Grid2 item>
    //                     <Typography variant="h5" sx={{ fontWeight: 700, color: "#1F1F1F" }}>
    //                         {formatValue ? formatValue(value) : value}
    //                     </Typography>
    //                 </Grid2>
    //             </Grid2>
    //         </Grid2>
    //         <Grid2 item size={6} display="flex" mt="-10px" mr="-20px" justifyContent="end" >
    //             <Chip
    //                 sx={{
    //                     backgroundColor: percentageDiff >= 0 ? "#D1F3D4" : "#F5D7D7",
    //                     fontSize: 16,
    //                     fontWeight: 400,
    //                     color: percentageDiff >= 0 ? "#367B3D" : "#C74141",
    //                     borderRadius: '30px',
    //                     padding: "7px 5px 7px 5px",
    //                 }}
    //                 icon={<img height={16} src={icon} />}
    //                 label={percentageDiff >= 0 ? formatPercentage(percentageDiff) : formatPercentage(percentageDiff).slice(1)}
    //             />
    //         </Grid2>
    //     </Grid2>
    // </Box>
};

export default DataBox;
