import { AppBar, Typography, Stack } from '@mui/material';

// @ts-ignore
import { useLayout } from '@/context/LayoutContext.js';

interface NavOptions {
    id: number;
    title: string;
    link: string;
}

interface NavbarProps {
    labels: NavOptions[];
    selectedButton: number;
    handleClick: (props: NavOptions) => void;
}

const POSNavbar = ({ labels, selectedButton, handleClick }: NavbarProps) => {
    // const location = useLocation();

    const { isCollapse, isMobile } = useLayout();

    const commonStyle = {
        marginLeft: { sx: '100px', sm: '100px', md: '100px' },
        padding: '10px 15px',
        cursor: 'pointer',
        fontWeight: 500,
        color: '#BBB0A4',
    };

    return (
        <AppBar
            sx={{
                backgroundColor: '#FFFFFF',
                position: 'fixed',
                top: 0,
                left: isMobile ? undefined : isCollapse ? 0 : 120,
                right: 0,
                zIndex: 10,
                pl: { xs: 5, md: 2 },
                boxShadow: '0px 1px 50px 0px rgba(0, 0, 0, 0.05)',
            }}
        >
            <Stack
                sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    pr: 8,
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
                            ...(String(selectedButton) === String(label.id) && {
                                borderBottom: '3px solid #BBB0A4',
                                fontWeight: 700,
                            }),
                        }}
                        onClick={() => handleClick(label)}
                    >
                        {label?.title}
                    </Typography>
                ))}
            </Stack>
        </AppBar>
    );
};

export default POSNavbar;
