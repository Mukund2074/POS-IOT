import React from 'react';
import { Box, keyframes } from '@mui/material';

const circleAnimation = keyframes`
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.9;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const checkmarkAnimation = keyframes`
  0% {
    stroke-dashoffset: 50;
  }
  100% {
    stroke-dashoffset: 0;
  }
`;

const pulseAnimation = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.4);
  }
  70% {
    box-shadow: 0 0 0 8px rgba(76, 175, 80, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0);
  }
`;

interface AnimatedTickProps {
    size?: number;
    color?: string;
    duration?: number;
    showPulse?: boolean;
}

export default function AnimatedTick({
    size = 60,
    color = '#4caf50',
    duration = 0.8,
    showPulse = true,
}: AnimatedTickProps) {
    return (
        <Box
            sx={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: size,
                height: size,
                borderRadius: '50%',
                backgroundColor: `${color}20`,
                animation: showPulse ? `${pulseAnimation} 1.5s ease-out` : 'none',
            }}
        >
            <Box
                sx={{
                    width: size * 0.8,
                    height: size * 0.8,
                    borderRadius: '50%',
                    backgroundColor: color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: `${circleAnimation} ${duration}s ease-out`,
                }}
            >
                <svg
                    width={size * 0.4}
                    height={size * 0.4}
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M9 12L11 14L15 10"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray="50"
                        strokeDashoffset="50"
                        style={{
                            animation: `${checkmarkAnimation} ${duration * 0.5}s ease-out ${duration * 0.4}s forwards`,
                        }}
                    />
                </svg>
            </Box>
        </Box>
    );
}
