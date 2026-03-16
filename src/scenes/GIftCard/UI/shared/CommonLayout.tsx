import POSHeading from '@/components/POS/Common/POSHeading';
import { Grid2, Typography } from '@mui/material';
import { CommonLayoutProps } from '../GIftCardSettings/Types/GiftCardSettings.types';

const CommonLayout = ({ children, HeadingText, descriptionText, text, error }: CommonLayoutProps) => {
    return (
        <Grid2
            container
            spacing={2}
            sx={{
                py: 5,
                px: 3,
                width: '100%',
                borderBottom: '1px solid #D9D9D9',
            }}
        >
            <Grid2
                size={{ xs: 12, md: 3.5 }}
                sx={{
                    pr: { xs: 0, md: 8 },
                }}
            >
                <POSHeading text={HeadingText} fontSize={15.5} />
                <POSHeading text={descriptionText} fontSize={14} fontColor="#666" sx={{ fontWeight: 500 }} />
            </Grid2>

            <Grid2 size={{ xs: 12, md: 7.5 }} px={{ sm: 0, md: 10 }}>
                {text && <POSHeading text={text} fontSize={15} sx={{ fontWeight: 600, my: 0 }} />}
                {children}
                {error && (
                    <Typography sx={{ color: 'red', mt: 1 }} variant="body2">
                        {error}
                    </Typography>
                )}
            </Grid2>
        </Grid2>
    );
};

export default CommonLayout;
