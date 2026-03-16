import React, { useState } from 'react';
import { IconButton, Menu, MenuItem, ListItemIcon, ListItemText, SxProps } from '@mui/material';
import { MoreHoriz } from '@mui/icons-material';

export type POSMenuItem = {
    label: string;
    onClick: (event: React.MouseEvent) => void;
    icon?: React.ReactNode;
    disabled?: boolean;
    itemSx?: SxProps; // optional styles for the menu item
};

type POSMenuProps = {
    items: POSMenuItem[];
    stopPropagation?: boolean; // useful inside tables
    menuSx?: SxProps; // optional styles for the menu
};

export default function POSMenu({ items, stopPropagation = true, menuSx }: POSMenuProps) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        if (stopPropagation) event.stopPropagation();
        setAnchorEl(event.currentTarget);
    };

    const handleClose = (event?: React.MouseEvent) => {
        if (stopPropagation) event?.stopPropagation();
        setAnchorEl(null);
    };

    return (
        <>
            <IconButton onClick={handleClick} size="small">
                <MoreHoriz />
            </IconButton>
            <Menu
                PaperProps={{
                    sx: {
                        ...menuSx,
                    },
                }}
                anchorEl={anchorEl}
                open={open}
                onClose={(event: React.MouseEvent, reason) => {
                    if (stopPropagation) {
                        // prevent row onClick firing when clicking outside
                        event.stopPropagation();
                    }
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
                            item.onClick(event);
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
