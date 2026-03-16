import POSSelect from '@/components/POS/Common/POSSelect';
import { Box, Divider, Typography } from '@mui/material';
import React from 'react';
import { CoaConfigType } from '../Types/Integration-type';

interface PropsTypes {
    title: string;
    description: string;
    items: any;
    setFormData: React.Dispatch<React.SetStateAction<CoaConfigType>>;
}

interface ItemsDataType {
    label: string;
    stateKey: string;
    value: string | null | number;
}

const ConfigSection = ({ title, description, items, setFormData }: PropsTypes) => {
    return (
        <>
            <Box
                sx={{
                    background: '#fff',
                    display: { xs: 'block', sm: 'block', md: 'flex' },
                    p: { xs: 2, sm: 2, md: 4 },
                }}
            >
                {/* Left Description Box */}
                <Box
                    sx={{
                        width: { xs: '100%', sm: '100%', md: '30%' },
                        pr: 3,
                    }}
                >
                    <Typography sx={{ fontSize: 22, fontWeight: 700 }}>{title}</Typography>
                    <Typography sx={{ fontSize: 16, fontWeight: 400, color: '#666' }}>{description}</Typography>
                </Box>

                {/* Right Side Inputs */}
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                            xs: 'repeat(1,100%)',
                            md: `repeat(2,${items.length === 1 ? '100%' : '50%'})`,
                        },
                        width: '100%',
                        gap: 2,
                    }}
                >
                    {items.map(({ label, stateKey, value }: ItemsDataType) => (
                        <Box>
                            <Typography sx={{ fontWeight: 700 }}>{label}</Typography>

                            <POSSelect
                                value={value ?? '0'}
                                options={[{ label: value ?? '0', value: value ?? '0' }]}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        [stateKey]: Number(e.target.value),
                                    }))
                                }
                                showPlaceHolder={false}
                            />
                        </Box>
                    ))}
                </Box>
            </Box>

            <Divider
                sx={{
                    border: '2.5px solid #D9D9D9',
                    backgroundColor: '#F3F3F3',
                    width: '100%',
                }}
            />
        </>
    );
};

export default ConfigSection;
