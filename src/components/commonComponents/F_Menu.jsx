import React, { useState } from 'react';
import { IconButton, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { MoreHoriz } from '@mui/icons-material';

export default function FCommonMenu({ items, stopPropagation = true, menuSx, paperSx }) {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleClick = (event) => {
        if (stopPropagation) event.stopPropagation();
        setAnchorEl(event.currentTarget);
    };

    const handleClose = (event) => {
        if (stopPropagation && event) event.stopPropagation();
        setAnchorEl(null);
    };

    return (
        <>
            {/* 3-dot icon button */}
            <IconButton
                onClick={handleClick}
                size="small"
                sx={{ ...menuSx }}
            >
                <MoreHoriz />
            </IconButton>

            {/* Popup menu */}
            <Menu
                PaperProps={{
                    sx: {
                        ...paperSx, // style only for menu popup
                    },
                }}
                anchorEl={anchorEl}
                open={open}
                onClose={(event) => {
                    if (stopPropagation) event.stopPropagation();
                    setAnchorEl(null);
                }}
            >
                {items.map((item, index) => (
                    <MenuItem
                        key={index}
                        sx={{
                            borderTop: index !== 0 ? '1px solid #eee' : undefined,
                            ...item.itemSx,
                        }}
                        onClick={(event) => {
                            if (stopPropagation) event.stopPropagation();
                            handleClose(event);
                            item.onClick?.(event); // safe call
                        }}
                        disabled={item.disabled}
                    >
                        {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
                        <ListItemText>{item.label}</ListItemText>
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
}
