import React, { useEffect, useState } from 'react';
import { AppBar, Typography, Stack, Avatar } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { t } from 'i18next';
import { useLayout } from '../context/LayoutContext';

const AppbarComponent = ({ labels, selectedButton, handleClick, ShowUser = false, userName, UserImage }) => {
    const location = useLocation();
    const [isCustomer, setIsCustomer] = useState(false);
    const { isCollapse, isMobile } = useLayout();

    const commonStyle = {
        marginLeft: { sx: '100px', sm: '100px', md: '100px' },
        padding: '10px 15px',
        cursor: 'pointer',
        fontWeight: 500,
        color: '#BBB0A4',
    };

    useEffect(() => {
        setIsCustomer(location.pathname.includes('/customer'));
    }, [selectedButton]);

    return (
        <AppBar
            sx={{
                backgroundColor: '#FFFFFF',
                position: 'fixed',
                top: 0,
                left: !isMobile && (isCollapse ? 0 : 120),
                right: 0,
                zIndex: 10,
                pl: { xs: 5, md:  2 },
                boxShadow: '0px 1px 50px 0px rgba(0, 0, 0, 0.05)',
            }}
        >
            {ShowUser && (
                <Stack
                    display={'flex'}
                    flexDirection={'row'}
                    alignItems={'center'}
                    p={2}
                    paddingLeft={isMobile ? 2 : isCollapse ? 7 : 5}
                    gap={2}
                    sx={{ backgroundColor: '#FFFFFF' }}
                >
                    {UserImage ? (
                        <Avatar
                            src={UserImage}
                            alt={userName || ''}
                            onError={(e) => {
                                e.target.src = (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="35"
                                        height="35"
                                        viewBox="0 0 200 200"
                                    >
                                        <circle
                                            cx="100"
                                            cy="100"
                                            r="90"
                                            fill="white"
                                            stroke="#BBB0A4"
                                            stroke-width="5"
                                        />
                                        <circle cx="100" cy="80" r="25" fill="#0FA628" />
                                        <ellipse cx="100" cy="135" rx="35" ry="25" fill="#0FA628" />
                                    </svg>
                                );
                            }}
                            sx={{
                                width: 33.34,
                                height: 33.34,
                                outlineOffset: '1px',
                                outlineStyle: 'solid',
                                outlineWidth: '1px',
                                outlineColor: '#BBB0A4',
                            }}
                        />
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 200 200">
                            <circle cx="100" cy="100" r="90" fill="white" stroke="#BBB0A4" stroke-width="5" />
                            <circle cx="100" cy="80" r="25" fill="#0FA628" />
                            <ellipse cx="100" cy="135" rx="35" ry="25" fill="#0FA628" />
                        </svg>
                    )}

                    <Typography variant="h6" color="#545454">
                        {userName || ''}
                    </Typography>
                </Stack>
            )}
            <Stack
                sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'flex-start',
                    alignItems: 'center',

                    maxWidth: '100%',
                    overflowX: 'auto',
                    scrollbarWidth: 'none',
                }}
            >
                {labels.map((label, index) => (
                    <Typography
                        key={index}
                        variant="body1"
                        noWrap
                        minWidth={'max-content'}
                        sx={{
                            ...commonStyle,
                            ...(isCustomer
                                ? location.pathname.split('/')[3] === 'journalgroups' &&
                                  String(label) === t('Common.JournalGroups')
                                    ? { borderBottom: '3px solid #bbb0a4', fontWeight: 700 }
                                    : selectedButton === String(label) &&
                                      location.pathname.split('/')[3] !== 'journalgroups' && {
                                          borderBottom: '3px solid #BBB0A4',
                                          fontWeight: 700,
                                      }
                                : selectedButton === String(label) && {
                                      borderBottom: '3px solid #BBB0A4',
                                      fontWeight: 700,
                                  }),
                        }}
                        onClick={() => handleClick(String(label))}
                    >
                        {label}
                    </Typography>
                ))}
            </Stack>
        </AppBar>
    );
};

export default AppbarComponent;
