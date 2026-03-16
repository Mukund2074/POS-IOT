import { Tab, Tabs } from '@mui/material';
import React from 'react';

export default function DynamicTabs({ activeTab, setActiveTab, tabOptions }) {
    return (
        <Tabs
            id="journal-tabs"
            value={activeTab}
            onChange={(event, newValue) => setActiveTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
                width: '100%',
                maxWidth: '100%',
                overflowX: 'auto',
                '& .MuiTabs-scrollButtons': {
                    // Optional styling for scroll buttons
                    display: { xs: 'none' },
                },
            }}
        >
            {tabOptions &&
                tabOptions
                    .sort((a, b) => a.tabSequence - b.tabSequence)
                    .map((tab) => (
                        <Tab
                            key={tab.tab_id}
                            label={tab.label}
                            value={tab.tab_id}
                            disableFocusRipple
                            disableRipple
                            sx={{
                                minWidth: 200,
                                textTransform: 'none',
                                color: tab.color,
                                fontWeight: 700,
                                bgcolor: tab.bgcolor,
                                borderTopLeftRadius: 20,
                                borderTopRightRadius: 20,
                                borderBottomLeftRadius: 10,
                                borderBottomRightRadius: 10,
                                border: 'none',
                                px: 3,
                                py: 1,
                                pb: 4,
                                opacity: activeTab === tab.tab_id ? 1 : 0.8,
                                zIndex: activeTab === tab.tab_id ? 2 : 0,
                                position: 'relative',
                                transition: 'z-index 0.3s ease',
                                '&:hover': {
                                    bgcolor: tab.bgcolor,
                                    opacity: 0.9,
                                },
                                '&.Mui-selected': {
                                    color: tab.color,
                                },
                            }}
                        />
                    ))}
        </Tabs>
    );
}
