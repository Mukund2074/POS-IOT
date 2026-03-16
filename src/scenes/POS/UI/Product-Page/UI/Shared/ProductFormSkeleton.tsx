import React from 'react';
import { Grid2, Skeleton, Stack } from '@mui/material';
import { Divider } from '@mui/material';

export const POSFormSkeleton = () => {
    return (
        <React.Fragment>
            <Grid2 container spacing={{ xs: 0, md: 3 }} sx={{ mt: 2, p: { xs: 2, md: 4 } }}>
                <Grid2 size={{ xs: 12, md: 4 }}>
                    <Skeleton variant="text" width="60%" height={30} />
                    <Skeleton variant="text" width="80%" height={20} sx={{ mt: 1 }} />
                </Grid2>

                <Grid2
                    size={{ xs: 12, md: 4 }}
                    sx={{
                        mt: { xs: 2, md: 0 },
                        display: 'flex',
                        flexDirection: 'column',
                        gap: { xs: 2, md: 4, xl: 5 },
                    }}
                >
                    {[...Array(5)].map((_, index) => (
                        <Stack key={index}>
                            <Skeleton variant="text" width="40%" height={20} />
                            <Skeleton variant="rectangular" width="100%" height={40} />
                        </Stack>
                    ))}
                </Grid2>

                <Grid2
                    size={{ xs: 12, md: 4 }}
                    sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, md: 4, xl: 5 } }}
                >
                    {[...Array(3)].map((_, index) => (
                        <Stack key={index}>
                            <Skeleton variant="text" width="40%" height={20} />
                            <Skeleton variant="rectangular" width="100%" height={40} />
                        </Stack>
                    ))}
                    <Stack>
                        <Skeleton variant="text" width="40%" height={20} />
                        <Skeleton variant="rectangular" width="100%" height={120} />
                    </Stack>
                    <Stack>
                        <Skeleton variant="text" width="40%" height={20} />
                        <Skeleton variant="rectangular" width={100} height={100} />
                    </Stack>
                </Grid2>
            </Grid2>

            <Divider sx={{ borderWidth: 2, width: '100%', borderColor: '#D2D2D2', my: 2 }} />

            <Grid2 container spacing={{ xs: 0, md: 3 }} sx={{ p: { xs: 3, md: 4 } }}>
                <Grid2 size={{ xs: 12, md: 4 }}>
                    <Skeleton variant="text" width="60%" height={30} />
                    <Skeleton variant="text" width="80%" height={20} sx={{ mt: 1 }} />
                </Grid2>

                <Grid2
                    size={{ xs: 12, md: 8 }}
                    sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, md: 4, xl: 5 } }}
                >
                    <Skeleton variant="text" width="30%" height={25} />
                    <Stack>
                        <Skeleton variant="text" width="40%" height={20} />
                        <Skeleton variant="rectangular" width="100%" height={40} />
                    </Stack>
                </Grid2>
            </Grid2>
        </React.Fragment>
    );
};
