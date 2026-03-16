import { Stack } from '@mui/material';
import POSHeading from '@/components/POS/Common/POSHeading';
import { FaInfoCircle } from 'react-icons/fa';

interface Props {
    title: string;
    text: string;
    showBottomBorder?: boolean;
    showTopBorder?: boolean;
    sx?: object;
    titleStyle?: object;
    textStyle?: object;
    textContainerStyle?: object;
    renderIcon?: boolean;
    conditionalRender?: boolean;
    onClick?: () => void;
}

const POSCashDrawerText = ({
    title,
    text,
    showBottomBorder = false,
    showTopBorder = true,
    sx,
    titleStyle,
    textStyle,
    textContainerStyle,
    renderIcon = true,
    onClick,
    conditionalRender = false,
}: Props) => {
    return (
        <Stack
            className="print-cashdrawer-reconcilation"
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{
                backgroundColor: '#fff',
                borderBottom: showBottomBorder ? '1px solid #e6e6e6' : 'none',
                borderTop: showTopBorder ? '1px solid #e6e6e6' : 'none',
                minHeight: 50,
                width: '100%',
                px: 2,
                boxSizing: 'border-box',
                flexWrap: 'nowrap',
                gap: 1,
                ...sx,
            }}
        >
            {/* Title */}
            <Stack
                sx={{
                    flex: 1,
                    minWidth: 0,
                    flexDirection: 'row',
                }}
            >
                <POSHeading
                    text={title}
                    sx={{
                        fontWeight: 600,
                        fontSize: 14,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',

                        ...titleStyle,
                    }}
                />
            </Stack>

            {/* Text */}
            <Stack
                sx={{
                    flex: 1,
                    textAlign: {
                        xs: 'right',
                        md: 'left',
                    },
                    minWidth: 0,
                    ...textContainerStyle,
                }}
            >
                <POSHeading
                    text={text}
                    sx={{
                        fontWeight: 300,
                        fontSize: 14,
                        whiteSpace: 'nowrap',
                        overflow: 'auto',
                        scrollbarWidth: 'thin',

                        ...textStyle,
                    }}
                />
            </Stack>

            {/* Icon */}
            {renderIcon && (
                <Stack
                    sx={{
                        flexShrink: 0,
                        pl: 1,
                        display: 'flex',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                        width: '20px',

                        '&:hover': {
                            cursor: 'pointer',
                        },
                    }}
                >
                    {conditionalRender && <FaInfoCircle size={14} color="#666" onClick={onClick} />}
                </Stack>
            )}
        </Stack>
    );
};

export default POSCashDrawerText;
