import POSHeading from '@/components/POS/Common/POSHeading';
import { Grid2, SxProps } from '@mui/material';
import React from 'react';

export default function IntegrationCard({
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
            <Grid2
                container
                sx={{
                    bgcolor: '#fff',
                    borderTopLeftRadius: topDivider ? 26 : 0,
                    borderTopRightRadius: topDivider ? 26 : 0,
                    borderBottomLeftRadius: bottomDivider ? 26 : 0,
                    borderBottomRightRadius: bottomDivider ? 26 : 0,
                    overflow: 'hidden', // optional but helps
                    ...containerSx,
                }}
            >
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
        </React.Fragment>
    );
}
