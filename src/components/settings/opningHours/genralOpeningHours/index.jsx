import React from 'react'
import PrimaryHeading from '../../commonPrimaryHeading'
import SecondaryHeading from '../../commonSecondaryHeading'
import { Box, Grid2, Skeleton, Stack, Typography } from '@mui/material'
import GenralStoreOpeningHoursList from './GenralStoreOpeningHours'
import { t } from 'i18next'

export default function GenralOpeningHoursComponent({ loading, data, setData, handleOpenStatus, handleByAppointment }) {
    return (
        <Grid2 container spacing={3} sx={{ p: { xs: 2, lg: 5 } }}>

            <Grid2 size={{ xs: 12, lg: 4 }}  >
                <PrimaryHeading text={t("Setting.GeneralStoreOpeningHours")} />
                <SecondaryHeading text={t('Setting.DescreptionOfGenralStoreOpeningHours')} />
            </Grid2>


            <Grid2 size={{ xs: 12, lg: 8 }} sx={{ overflowX: 'scroll', scrollbarWidth: 'none', overflowY: 'hidden', width: '100%', height: '100%' }} >
                <Stack sx={{ minWidth: { xs: 750, lg: 'auto' }, gap: 1 }}>
                    <Stack sx={{ width: "100%", display: "flex", flexDirection: "row", justifyContent: "between", alignItems: "center", borderRadius: "10px", }} >

                        <Typography sx={{ width: "20%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", ml: 'auto' }} >
                            {/* <PrimaryHeading text={t("Settings.Closed")} /> */}
                            <Typography variant='body1' sx={{ fontWeight: 700, color: '#1F1F1F' }}>
                                {t("Setting.Closed")}
                            </Typography>
                        </Typography>

                        <Typography sx={{ width: "20%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", }} >
                            {/* <PrimaryHeading text={t("Settings.OpenByAppointment")} /> */}
                            <Typography noWrap variant='body1' sx={{ fontWeight: 700, color: '#1F1F1F' }}>
                                {t("Setting.OpenByAppointment")}
                            </Typography>
                        </Typography>

                    </Stack>
                    {loading ?
                        <Stack width="100%" spacing={1}>
                            {[...Array(7)].map((_, index) => (
                                <Box key={index} sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 4 }}>
                                    <Box sx={{ width: '52%', display: 'flex', alignItems: 'center', mr: 2 }}>
                                        <Skeleton variant="rounded" width="100%" height={48} />
                                    </Box>
                                    <Stack direction="row" spacing={2} sx={{ width: '40%', justifyContent: 'space-evenly' }}>
                                        <Skeleton variant="circular" width={40} height={40} />
                                        <Skeleton variant="circular" width={40} height={40} />
                                    </Stack>
                                </Box>
                            ))}
                        </Stack>

                        :
                        <GenralStoreOpeningHoursList
                            data={data}
                            setData={setData}
                            handleOpenStatus={handleOpenStatus}
                            handleByAppointment={handleByAppointment}
                        />
                    }
                </Stack>
            </Grid2>

        </Grid2>
    )
}
