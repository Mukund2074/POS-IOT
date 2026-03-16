import { Stack, Typography } from '@mui/material';
import moment from 'moment';
import React from 'react';
import ArrowDown from '../../../assets/arrow-down.svg';

export default function WeeklyHeader({ empToShow, employees, handleHeaderClick, props, selectedDate, anchorEl }) {
    return (
        <Stack
            id={empToShow[0]}
            key={`${props.label}-${empToShow[0]}`}
            name={employees?.find((employee) => employee.id == empToShow[0])?.name}
            onClick={handleHeaderClick}
            sx={{
                display: 'flex',
                borderRight: '1px solid #ddd',
                flexDirection: 'row',
                alignItems: 'flex-start',
                justifyContent: 'center',
                cursor: 'pointer',
                width: '100%',
                height: '100%',
                gap: 1,
                minHeight: '50px',
                p: 1,
                position: 'relative',
            }}
        >
            <Stack
                style={{
                    pointerEvents: 'none',
                    userSelect: 'none',
                }}
            >
                <Typography variant="body1" sx={{ fontSize: '1rem', fontWeight: 300 }}>
                    {props.label}
                </Typography>
            </Stack>
            <img
                src={ArrowDown}
                style={{
                    transform:
                        anchorEl &&
                        (anchorEl?.id == empToShow[0] ||
                            moment(props.date).format('YYYY-MM-DD') == moment(selectedDate).format('YYYY-MM-DD')) &&
                        'rotate(180deg)',
                    pointerEvents: 'none',
                }}
                alt=""
            />
        </Stack>
    );
}


