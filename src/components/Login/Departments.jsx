import { Avatar, Button, Stack, Typography } from '@mui/material'
import { t } from 'i18next'
import React from 'react'
import tickImg from "../../assets/Vector (1).png";

export default function Departments({ locations, selectedLocation, handleSelectLocation, handleNext }) {
    return (
        <Stack sx={{ maxHeight: { xs: "80%", md: '70%' }, bgcolor: '#FFFFFF', width: { xs: "100%", md: "50%" }, display: "flex", flexDirection: "column", py: 10, px: 2, borderRadius: 5, position: "relative", overflow: 'hidden' }} >


            <Typography sx={{ textAlign: "center", color: '#6F6F6F', fontWeight: 400, fontSize: "27px", position: 'absolute', top: 0, left: 0, right: 0, p: 2 }} >
                {t("Common.LogChooseDepartment")}
            </Typography>

            <Stack sx={{ maxHeight: "100% ", width: "100%", bgcolor: '#FFFFFF', overflowY: "scroll", scrollbarWidth: 'thin', gap: 2, alignItems: "center" }} >
                {locations.map((location, index) => (
                    <Stack
                        key={index}
                        // className={`select-item ${selectedLocation === index ? "" : ""
                        //     } ${location.is_active ? "" : "inactive"}`} // Add 'inactive' class if not active
                        onClick={() =>
                            handleSelectLocation(index)
                        } // Only select if active
                        sx={{
                            // marginTop: "20px",
                            // height: "18%",
                            border: "3px solid #bbb0a4",
                            width: { xs: '100%', md: '80%' },
                            flexDirection: "row",
                            alignItems: "center",
                            p: 2, gap: 2,
                            borderRadius: 3,
                            bgcolor: !location.is_active && "#f0f0f0",
                            opacity: !location.is_active && 0.5,
                            // position: "relative",
                            cursor: location.is_active ? "pointer" : "not-allowed",
                        }} // Add 'not-allowed' cursor for inactive
                    >
                        {location.image && <Avatar src={location.image} />}
                        <Stack flex={1} display={"table-column"} >
                            <Typography variant="small" sx={{ fontSize: "1rem", color: "#545454", fontWeight: 700 }} >
                                {location.name}
                            </Typography>
                            <Typography variant="h6" sx={{ fontSize: "0.85rem" }}>
                                {location.email}
                            </Typography>
                        </Stack>
                        {location.is_active && selectedLocation === index && (
                            <img src={tickImg} alt="Selected" style={{ width: "20px", height: "17px", }} />
                        )}
                    </Stack>
                ))}
            </Stack>
            <Stack
                sx={{
                    position: 'absolute',
                    bottom: 0, left: 0, right: 0,
                    p: 2, bgcolor: '#FFFFFF',
                    display: "flex", justifyContent: "center", alignItems: "center",
                    width: "100%"
                }}>
                <Button
                    sx={{
                        py: 1,
                        px: 4,
                        color: '#fff',
                        fontWeight: 500,
                        bgcolor: selectedLocation === null ? "#ccc" : "#a2907c",
                        borderRadius: 50,
                        minWidth: "20%",
                        width: { xs: '100%', md: "auto" },
                    }}
                    disabled={selectedLocation === null}
                    onClick={handleNext}
                >
                    {t("Common.LogNext")}
                </Button>
            </Stack>
        </Stack>
    )
}
