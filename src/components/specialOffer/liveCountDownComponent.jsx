import React, { useState, useEffect } from 'react';
import { Box, Typography, Skeleton } from '@mui/material';
import moment from 'moment';

const formatTime = (createdAt) => {
    const now = new Date();
    const targetTime = new Date(createdAt + 'Z').getTime() + 24 * 60 * 60 * 1000;
    const timeLeft = targetTime - now.getTime();

    if (timeLeft <= 0) return '00:00:00';

    const duration = moment.duration(timeLeft, 'milliseconds');
    return moment.utc(duration.asMilliseconds()).format('HH:mm:ss');
};

const getTextColor = (createdAt) => {
    const now = new Date();
    const targetTime = new Date(createdAt + 'Z').getTime() + 24 * 60 * 60 * 1000;
    const timeLeft = targetTime - now.getTime();

    return timeLeft < 3600 * 1000 ? '#ff0000' : '#3f51b5';
};

const CountdownTimer = ({ createdAt, isLoading }) => {
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
            width: '100px'
        }}>
            {isLoading ? (
                <Skeleton variant="text" width={150} height={20} />
            ) : (
                <Typography sx={{
                    width: 150,
                    fontWeight: 400,
                    fontSize: '20px',
                    color: getTextColor(createdAt),
                    marginLeft: 2,
                }}>
                    {timeLeft}
                </Typography>
            )}
        </Box>
    );
};

export default CountdownTimer;