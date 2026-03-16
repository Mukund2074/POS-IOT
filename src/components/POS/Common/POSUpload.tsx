import { Button } from '@mui/material'
import { t } from 'i18next'
import React from 'react'
// import Upload from '../../../../assets/uploadFile.svg';
const Upload = require("../../../assets/uploadFile.svg").default

interface UploadProps {
    handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export default function POSUpload({
    handleFileUpload,
}: UploadProps) {
    return (
        <Button
            variant="outlined"
            component="label"
            sx={{
                width: { xs: '100%', md: 'auto' },
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                borderRadius: 3,
                textTransform: 'none',
                borderColor: '#D9D9D9',
                color: '#1f1f1f',
                '&:hover': {
                    backgroundColor: 'rgba(31, 31, 31, 0.04)',
                },
            }}
        >
            <img src={Upload} alt="upload" style={{ height: '20px', width: '20px' }} />
            {t('Customer.ChsFiles')}
            <input type="file" multiple hidden accept="*/*" onChange={handleFileUpload} />
        </Button>
    )
}