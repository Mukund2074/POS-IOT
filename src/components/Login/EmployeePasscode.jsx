import { Button, CircularProgress, Stack, TextField, Typography } from '@mui/material'
import { LoadingButton } from '@mui/lab'
import { t } from 'i18next'
import React from 'react'

export default function EmployeePasscode({ isLoading, selectedEmployee, employees, passcode, handlePasscodeChange, handleBackspace, handleNext }) {
    return (
        <Stack sx={{ maxHeight: { xs: "80%", md: '70%' }, bgcolor: '#FFFFFF', width: { xs: "100%", md: "auto" }, display: "flex", flexDirection: "column", py: 10, px: 2, borderRadius: 5, position: "relative", overflow: 'hidden' }} >

            <Typography sx={{ textAlign: "center", color: '#6F6F6F', fontWeight: 400, fontSize: "27px", position: 'absolute', top: 0, left: 0, right: 0, p: 2 }} >
                {t("Common.OtpT")}
            </Typography>

            {selectedEmployee !== null && (
                <Typography variant="h6" sx={{ fontSize: "1.3rem", color: "#545454", textAlign: 'center' }} >
                    {t("Common.OTPD")}{" "}
                    {employees[selectedEmployee].name}
                </Typography>
            )}
            <Stack
                direction="row"
                justifyContent="center"
                spacing={2}
                sx={{
                    width: "100%",
                    p: 2,
                }}
            >
                {passcode.map((digit, index) => (
                    <TextField
                        key={index}
                        id={`passcode-${index}`}
                        type="text"
                      
                        inputProps={{
                            maxLength: 1, pattern: "[0-9]*",
                            inputMode: "numeric", style: { textAlign: "center" } }}
                        value={digit}
                        onChange={(e) => handlePasscodeChange(e, index)}
                        onKeyDown={(e) => handleBackspace(e, index)}
                        sx={{
                            "& .MuiOutlinedInput-notchedOutline": {
                                border: "none",
                            },
                            width: { xs: "40px", md: "55px" },
                            fontSize: { xs: "18px", md: "22px" },
                            border: "1px solid #A79C92",
                            borderRadius: "13px",
                            boxShadow: "0px 4px 4px 0px #00000040",
                        }}
                    />
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
                <LoadingButton
                    loading={isLoading}
                    loadingIndicator={<CircularProgress size={20} sx={{ color: '#fff' }} />}
                    sx={{
                        py: 1,
                        px: 4,
                        color: '#fff',
                        fontWeight: 500,
                        bgcolor: passcode.join("").length < 6 || isLoading ? "#ccc" : "#a2907c",
                        borderRadius: 50,
                        minWidth: "20%",
                        width: { xs: '100%', md: "auto" },
                    }}
                    disabled={(passcode.join("").length < 6) === null && isLoading}
                    onClick={handleNext}
                >
                    {t("Common.LogNext")}
                </LoadingButton>
            </Stack>

        </Stack >
    )
}
