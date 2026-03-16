import React from 'react';
import { Accordion, AccordionSummary, AccordionDetails, SxProps } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface POSAccordionProps {
    title: React.ReactNode;
    children: React.ReactNode;
    expanded?: boolean;
    defaultExpanded?: boolean;
    onChange?: (event: React.SyntheticEvent, expanded: boolean) => void;
    sx?: SxProps;
    summarySx?: SxProps;
    detailsSx?: SxProps;
    summaryProps?: any;
    detailsProps?: any;
    accordionProps?: any;
    bgcolor?: string;
}

const POSAccordion: React.FC<POSAccordionProps> = ({
    title,
    children,
    expanded,
    defaultExpanded,
    onChange,
    sx = {},
    summarySx = {},
    detailsSx = {},
    summaryProps = {},
    detailsProps = {},
    accordionProps = {},
    bgcolor = 'rgba(240, 240, 240, 0.6)',
}) => {
    return (
        <Accordion
            expanded={expanded}
            defaultExpanded={defaultExpanded}
            onChange={onChange}
            sx={{
                p: 0,
                width: '100%',
                m: 0,
                '&.Mui-expanded': {
                    m: 0,
                    p: 0,
                },
                ...sx,
            }}
            {...accordionProps}
        >
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                    m: 0,
                    minHeight: 48,
                    '&.Mui-expanded': {
                        minHeight: 48,
                        m: 0,
                    },
                    '&:focus-within': {
                        outline: 'none',
                        bgcolor: bgcolor,
                    },
                    '& .MuiAccordionSummary-content': {
                        m: 0,
                        '&:focus-within': {
                            outline: 'none',
                            bgcolor: bgcolor,
                        },
                        '&.Mui-expanded': {
                            m: 0,
                        },
                    },
                    ...summarySx,
                }}
                {...summaryProps}
            >
                {title}
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0, m: 0, ...detailsSx }} {...detailsProps}>
                {children}
            </AccordionDetails>
        </Accordion>
    );
};

export default POSAccordion;
