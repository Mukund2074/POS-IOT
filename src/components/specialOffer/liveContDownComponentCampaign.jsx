import React, { useState, useEffect } from 'react';
import { Box, Typography, Skeleton } from '@mui/material';
import moment from 'moment';

const formatTime = (endDateTime) => {
    const now = new Date();
    const targetTime = new Date(endDateTime).getTime();
    const timeLeft = targetTime - now.getTime();

    if (timeLeft <= 0) return '00:00:00';

    const duration = moment.duration(timeLeft, 'milliseconds');

    const days = Math.floor(duration.asDays());
    const hours = duration.hours();
    const minutes = duration.minutes();
    const seconds = duration.seconds();

    if (days > 0) {
        return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    } else if (hours > 0) {
        return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
    } else {
        return `${seconds}s`;
    }
};

const getTextColor = (endDateTime) => {
    const now = new Date();
    const targetTime = new Date(endDateTime).getTime();
    const timeLeft = targetTime - now.getTime();

    // return timeLeft < 3600 * 1000 ? '#ff0000' : '#3f51b5';
    return timeLeft < 24 * 60 * 60 * 1000 ? '#ff0000' : '#3f51b5';
};

const CountdownTimerCampaign = ({ createdAt, isLoading }) => {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const intervalId = setInterval(() => {
            setTimeLeft(formatTime(createdAt));
        }, 1000);

        return () => clearInterval(intervalId);
    }, [createdAt]);

    return (
        <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#D9D9D9',
            borderRadius: '6px',
            height: '28px',
            width: '90px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            textAlign: 'center',
        }}>
            {isLoading ? (
                <Skeleton variant="text" width={150} height={20} />
            ) : (
                    <Typography
                        variant="body2"
                        sx={{
                            fontWeight: 400,
                            // fontSize: '20px',
                            color: getTextColor(createdAt),
                            // marginLeft: 2,
                            width: '80%',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}>
                        {timeLeft}
                    </Typography>
            )}
        </Box>

    );
};

export default CountdownTimerCampaign;
