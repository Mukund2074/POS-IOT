import { Stack, Typography } from '@mui/material';

export default function NotificationItem({ item, label }) {
    return (
        <Stack gap={1} flexDirection={'row'}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#6f6f6f' }}>
                {label}:
            </Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                {item}
            </Typography>
        </Stack>
    );
}
