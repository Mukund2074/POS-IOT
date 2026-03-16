import { Stack, Typography } from '@mui/material';
import React from 'react';
import ArrowDown from '../../../assets/arrow-down.svg';

export default function ResourceHeader({ employee, empToShow, view, setAnchorEl, CalendarHandler, anchorEl }) {
    return (
        <Stack
            id={employee.id}
            key={employee.id}
            name={employee.name}
            onClick={(e) => {
                if (empToShow?.length >= (view === 'day' ? 1 : 2)) {
                    CalendarHandler.handleClickResource({ e, setAnchorEl });
                }
            }}
            sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: empToShow?.length >= (view === 'day' ? 1 : 2) && 'pointer',
                width: '100%',
                height: '100%',
                gap: 1,
                borderRight: '1px solid #ddd',
            }}
        >
            <Typography>{employee?.name}</Typography>
            {empToShow?.length >= (view === 'day' ? 1 : 2) && (
                <img
                    src={ArrowDown}
                    style={{
                        transform: anchorEl?.id == employee.id && 'rotate(180deg)',
                    }}
                    alt=""
                />
            )}
        </Stack>
    );
}
