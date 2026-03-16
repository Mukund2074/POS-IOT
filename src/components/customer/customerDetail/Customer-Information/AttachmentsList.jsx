import React from 'react';
import { TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, IconButton } from '@mui/material';
import { t } from 'i18next';
import moment from 'moment';
import { Link } from 'react-router-dom';
import Delete from '../../../../assets/Delete.svg';

export default function AttachmentsList({ uploadedFiles, handleRemoveFile }) {
    return (
        <TableContainer
            component={Paper}
            sx={{ mt: 2, boxShadow: 'none', border: '1px solid #e0e0e0', borderRadius: 4 }}
        >
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell
                            sx={{
                                fontWeight: 600,
                                color: '#1f1f1f',
                                borderBottom: '1px solid #e0e0e0',
                            }}
                        >
                            {t('Common.Date')}
                        </TableCell>
                        <TableCell
                            sx={{
                                fontWeight: 600,
                                color: '#1f1f1f',
                                borderBottom: '1px solid #e0e0e0',
                            }}
                        >
                            {t('Customer.File')}
                        </TableCell>
                        <TableCell
                            sx={{
                                fontWeight: 600,
                                color: '#1f1f1f',
                                borderBottom: '1px solid #e0e0e0',
                                width: '100px',
                            }}
                        >
                            {t('Customer.Action')}
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody sx={{ bgcolor: '#fff' }}>
                    {uploadedFiles.map((file) => (
                        <TableRow key={file.id}>
                            <TableCell sx={{ color: '#545454', borderBottom: '1px solid #e0e0e0' }}>
                                {moment.parseZone(file.denmark_created_at).format('YYYY-MM-DD HH:mm')}
                            </TableCell>
                            <TableCell sx={{ color: '#545454', borderBottom: '1px solid #e0e0e0' }}>
                                <Link
                                    to={`${process.env.REACT_APP_IMG_URL}${file.url}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        color: 'blue',
                                        textDecoration: 'underline',
                                    }}
                                >
                                    {file?.file_name}
                                </Link>
                            </TableCell>
                            <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>
                                <IconButton onClick={() => handleRemoveFile(file.id)} color="error" size="small">
                                    <img src={Delete} alt="delete" />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
