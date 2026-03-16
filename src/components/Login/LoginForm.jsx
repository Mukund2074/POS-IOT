import { Button, IconButton, InputAdornment, Stack, TextField, Typography } from '@mui/material'
import { t } from 'i18next'
import React, { useState } from 'react'
import call from "../../assets/call.jpg";
import lock from "../../assets/lock.png";
import { formatPhoneNumber } from '../calanderComponents/booking/utils/functions';
import { Visibility, VisibilityOff } from '@mui/icons-material';

export default function LoginForm({ handlePhoneInput, phone, password, setPassword, handleLogin, handleResetPass }) {

    const [showPassword, setShowPassword] = useState(false);
    return (
        <Stack sx={{ width: "100%", maxWidth: "500px", backgroundColor: "white", borderRadius: "25px", display: "flex", flexDirection: "column", px: 4, py: 2, gap: 2, boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)", alignItems: "center", }} >

            {/* Title */}
            <Typography sx={{ fontSize: "25px", fontWeight: "400", color: "#6F6F6F", textAlign: "center", }} >
                {t("Common.LoginMT")}
            </Typography>

            {/* Phone Number Input */}
            <Stack sx={{ width: "100%", mt: 4 }} >

                <Stack sx={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 2, }} >
                    <Stack component="img" src={call} alt="call" sx={{ height: "17px" }} />
                    <Typography fontSize="17px" fontWeight="400" color="#6F6F6F">
                        {t("Common.LoginMNummEnt")}
                    </Typography>
                </Stack>

                <Stack sx={{ width: "100%", height: "40px", display: "flex", flexDirection: "row", alignItems: "center", border: "2px solid #BBB0A4", borderRadius: "10px", backgroundColor: "#F5F5F5", }} >

                    <TextField
                        type="tel"
                        variant="standard"
                        value={formatPhoneNumber(phone)}
                        onChange={handlePhoneInput}
                        placeholder="00 00 00 00"
                        InputProps={{
                            startAdornment: <Stack sx={{ pr: 2 }}>+45</Stack>,
                            disableUnderline: true,
                            style: {
                                width: "100%",
                                backgroundColor: "transparent",
                                paddingLeft: "10px",
                                fontSize: "19px",
                                fontWeight: "400",
                            },
                        }}

                        inputProps={{ maxLength: 11 }}
                        sx={{
                            width: "100%",
                            "& input": { border: "none", outline: "none" },
                        }}
                    />
                </Stack>
            </Stack>

            {/* Password Input */}
            <Stack sx={{ display: "flex", flexDirection: "column", width: "100%" }} >

                <Stack sx={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 2, }} >
                    <Stack component="img" src={lock} alt="lock" sx={{ height: "17px" }} />
                    <Typography fontSize="16px" fontWeight="400" color="#6F6F6F">
                        {t("Common.LoginPass")}
                    </Typography>
                </Stack>

                <Stack sx={{ width: "100%", height: "40px", display: "flex", alignItems: "center", border: "2px solid #BBB0A4", borderRadius: "10px", backgroundColor: "#F5F5F5", }} >
                    <TextField
                        type={showPassword ? "text" : "password"}
                        variant="standard"
                        placeholder={t("Common.LoginPass")}
                        value={password.replace(/\s/g, "")}
                        onChange={(e) =>
                            setPassword(e.target.value.replace(/\s/g, ""))
                        }
                        InputProps={{
                            disableUnderline: true,
                            style: {
                                width: "100%",
                                backgroundColor: "transparent",
                                paddingLeft: "10px",
                                fontSize: "16px",
                            },
                            endAdornment: (
                                <InputAdornment
                                    position="end"
                                    sx={{ marginRight: "10px" }}
                                >
                                    <IconButton
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <Visibility /> : <VisibilityOff />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            width: "100%",
                            "& input": { border: "none", outline: "none" },
                        }}
                    />
                </Stack>
            </Stack>

            {/* Login Button */}
            <Button
                sx={{ width: "100%", maxWidth: { xs: '100%', md: "210px" }, borderRadius: "25px", height: "40px", fontSize: "17px", mt: 2, fontWeight: "400", color: "white", backgroundColor: "#BBB0A4", textTransform: "capitalize", "&:hover": { backgroundColor: "#9C968B" } }} 
                onClick={handleLogin} >
                {t("Common.LogBtnT")}
            </Button>

            {/* Forgot Password */}
            <Typography
                onClick={() => handleResetPass()}
                sx={{ fontSize: "17px", fontWeight: "400", color: "#6F6F6F", textAlign: "center", cursor: "pointer", }}
            >
                {t("Common.LogForPass")}
            </Typography>

        </Stack >
    )
}
