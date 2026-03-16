import React from 'react';
import { Box, keyframes } from '@mui/material';
import { CheckCircle } from '@mui/icons-material';

const bounceIn = keyframes`
  0% {
    transform: scale(0.3);
    opacity: 0;
  }
  50% {
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.4);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(76, 175, 80, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0);
  }
`;

interface SimpleSuccessAnimationProps {
    size?: number;
    color?: string;
}

export default function SimpleSuccessAnimation({ size = 80, color = '#4caf50' }: SimpleSuccessAnimationProps) {
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: size,
                height: size,
                borderRadius: '50%',
                backgroundColor: `${color}20`,
                animation: `${pulse} 1.5s ease-out`,
            }}
        >
            <CheckCircle
                sx={{
                    fontSize: size * 0.6,
                    color: color,
                    animation: `${bounceIn} 0.6s ease-out`,
                }}
            />
        </Box>
    );
}
