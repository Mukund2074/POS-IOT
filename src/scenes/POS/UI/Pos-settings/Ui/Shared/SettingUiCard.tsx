import POSHeading from '@/components/POS/Common/POSHeading';
import { Divider, Grid2, Skeleton, SxProps } from '@mui/material';
import React from 'react';

export default function SettingUiCard({
    infoContent = null,
    processContent = null,
    bottomDivider = false,
    topDivider = false,
    title = '',
    description = '',
    containerSx = {},
}: {
    infoContent?: React.ReactNode | null;
    processContent?: React.ReactNode | null;
    bottomDivider?: boolean;
    topDivider?: boolean;
    title?: string;
    description?: string;
    containerSx?: SxProps;
}) {
    return (
        <React.Fragment>
            {topDivider && (
                <Divider sx={{ border: '2.5px solid #F3F3F3', backgroundColor: '#F3F3F3', width: '100%' }} />
            )}
            <Grid2 container sx={{ bgcolor: '#fff', ...containerSx }}>
                <Grid2 size={{ xs: 12, md: 4 }} sx={{ p: { xs: 2, md: 4 } }}>
                    {infoContent ? (
                        infoContent
                    ) : (
                        <React.Fragment>
                            <POSHeading text={title || ''} />
                            <POSHeading
                                text={description || ''}
                                sx={{ fontSize: 16, fontWeight: 400, color: '#666' }}
                            />
                        </React.Fragment>
                    )}
                </Grid2>
                <Grid2 size={{ xs: 12, md: 8 }} sx={{ p: { xs: 2, md: 4 } }}>
                    {processContent}
                </Grid2>
            </Grid2>
            {bottomDivider && (
                <Divider sx={{ border: '2.5px solid #F3F3F3', backgroundColor: '#F3F3F3', width: '100%' }} />
            )}
        </React.Fragment>
    );
}

// skeleton of 5 cards with 2 columns
export const SettingUiCardSkleton = () => {
    return (
        <React.Fragment>
            <Grid2 container sx={{ p: 2 }}>
                {Array.from({ length: 4 }).map((_, index) => (
                    <React.Fragment key={index}>
                        <Grid2 size={{ xs: 12, md: 4 }} sx={{ p: 2 }}>
                            <Skeleton variant="rectangular" height={20} />
                            <Skeleton variant="rectangular" height={40} sx={{ mt: 2 }} />
                        </Grid2>
                        <Grid2 size={{ xs: 12, md: 8 }} sx={{ p: 2 }}>
                            <Skeleton variant="rectangular" height={150} />
                        </Grid2>
                    </React.Fragment>
                ))}
            </Grid2>
        </React.Fragment>
    );
};
