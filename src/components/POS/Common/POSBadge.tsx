import { Stack } from '@mui/material';
import React from 'react';
import POSHeading from './POSHeading';

interface Props {
    text: string;
    fontSize?: string | number;
    fontColor?: string;
    fontWeight?: number;
    startDate?: string;
    badgeText?: string;
    onClick?: () => void;
    condition?: boolean;
}

const POSBadge = ({
    text,
    fontSize = 15,
    fontColor = 'gray',
    fontWeight = 400,
    // startDate,
    badgeText,
    onClick,
    condition = false,
}: Props) => {
    return (
        <Stack>
            <Stack
                sx={{
                    p: 2,
                    backgroundColor: '#fff',
                    boxShadow: '0px 2px 0px rgba(0, 0, 0, 0.1)',
                    width: 'auto',
                    py: 1,
                    borderRadius: 2,
                    minWidth: 'fit-content',
                    border : '1px solid #eee'
                }}
            >
                <POSHeading
                    sx={{
                        fontWeight,
                        fontSize,
                        mx: 'auto',
                        my: 'auto',
                        color: fontColor,
                    }}
                    text={text}
                />
            </Stack>

            {condition && (
                <POSHeading
                    onClick={onClick}
                    sx={{
                        fontWeight: 500,
                        fontSize: 16,
                        my: 'auto',
                        color: '#2e2e2e',
                        mt: 1,

                        textAlign: {
                            xs: 'start',
                            md: 'end',
                        },

                        '&:hover': {
                            cursor: 'pointer',
                        },
                    }}
                    text={badgeText || ''}
                />
            )}
        </Stack>
    );
};

export default POSBadge;
