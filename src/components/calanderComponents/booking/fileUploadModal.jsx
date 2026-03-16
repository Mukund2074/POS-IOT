import { CloudUpload } from '@mui/icons-material';
import { Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
import { t } from 'i18next';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import apiFetcher from '../../../utils/interCeptor';
import { toast } from 'react-toastify';

const FileUploadModal = ({ uploadedFiles, rescheduleProps }) => {
    const fileInputRef = useRef(null);
    const [error, setError] = useState('');
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const settingsFromStore = useSelector((state) => state?.settings?.data);
    const maxFiles = settingsFromStore?.OnlineBooking?.inspection_module?.file_upload_checkout?.max_files;
    const maxFileSize = 5 * 1024 * 1024; // 5MB

    // Upload files to server one by one
    const uploadFilesToServer = async (newFiles) => {
        for (const entry of newFiles) {
            const formData = new FormData();
            formData.append('file', entry.file);

            try {
                const response = await apiFetcher.post('api/v1/store/file', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });

                setSelectedFiles((prev) =>
                    prev.map((fileEntry) =>
                        fileEntry.file === entry.file
                            ? {
                                  ...fileEntry,
                                  uploading: false,
                                  fileId: response.data?.data?.id,
                                  fileUrl: response.data?.data?.url,
                                  file_name: response?.data?.data?.file_name,
                              }
                            : fileEntry,
                    ),
                );
            } catch (error) {
                setSelectedFiles((prev) =>
                    prev.map((fileEntry) =>
                        fileEntry.file === entry.file
                            ? {
                                  ...fileEntry,
                                  uploading: false,
                                  error: 'Upload failed',
                              }
                            : fileEntry,
                    ),
                );
            }
        }
    };

    const processFiles = async (files) => {
        const fileArray = Array.from(files);
        setError('');

        // Check file sizes
        const oversized = fileArray.filter((file) => file.size > maxFileSize);
        if (oversized.length > 0) {
            const fileNames = oversized.map((f) => f.name).join(', ');
            setError(t('Calendar.fileSizeExceeded', { fileName: fileNames, maxSize: '5MB' }));
            toast.error(t('Calendar.fileSizeExceeded', { fileName: fileNames, maxSize: '5MB' }));
            return;
        }

        // Check total file count
        const totalFiles = selectedFiles.length + fileArray.length;
        if (totalFiles > maxFiles) {
            setError(t('Calendar.maxFilesExceeded', { max: maxFiles }));
            toast.error(t('Calendar.maxFilesExceeded', { max: maxFiles }));
            return;
        }

        // Create new entries
        const newEntries = fileArray.map((file) => ({
            file,
            fileId: null,
            fileUrl: null,
            uploading: true,
            error: null,
        }));

        setSelectedFiles((prev) => [...prev, ...newEntries]);

        // Upload only the new files
        uploadFilesToServer(newEntries);
    };

    const handleFileChange = (e) => {
        if (e.target.files.length > 0) {
            processFiles(e.target.files);
            e.target.value = '';
        }
    };

    const handleRemoveFile = async (id) => {
        try {
            await apiFetcher.delete(`/api/v1/store/file/${id}`);
        } catch (error) {
            console.error('Error : ', error);
        }
        setSelectedFiles(selectedFiles?.filter((file) => file?.fileId !== id));
    };

    const handleDragEnter = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files.length > 0) {
            processFiles(e.dataTransfer.files);
        }
    };

    const formatFileSize = (bytes) => {
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 Bytes';
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
    };

    useEffect(() => {
        uploadedFiles(selectedFiles);
    }, [selectedFiles]);

    useEffect(() => {
        if (rescheduleProps?.inspection_data?.uploaded_files_at_checkout) {
            setSelectedFiles(rescheduleProps?.inspection_data?.uploaded_files_at_checkout);
        }
    }, [rescheduleProps]);

    return (
        <Box sx={{ px: 4, pb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                {t('Calendar.UploadFiles')}
            </Typography>

            <input ref={fileInputRef} type="file" multiple onChange={handleFileChange} style={{ display: 'none' }} />

            {/* Upload Zone */}
            <Box
                onClick={() => fileInputRef.current.click()}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                sx={{
                    border: '2px dashed #E0E0E0',
                    borderRadius: 2,
                    p: 3,
                    height: '30vh',
                    cursor: 'pointer',
                    bgcolor: isDragging ? 'action.hover' : 'transparent',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: '0.2s',
                }}
            >
                <CloudUpload sx={{ fontSize: 48, color: 'text.secondary' }} />
                <Typography>{t('Calendar.dragDropFiles')}</Typography>
                <Typography variant="body2" color="text.secondary">
                    {t('Calendar.orClickToSelect')}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    {t('Calendar.maxFileSizeInfo', { maxSize: '5MB', maxFiles })}
                </Typography>
            </Box>

            {/* Selected Files List */}
            {selectedFiles.length > 0 && (
                <Stack spacing={1} mt={2}>
                    <Typography variant="body2" color="text.secondary">
                        {t('Calendar.selectedFiles', { count: selectedFiles.length, max: maxFiles })}
                    </Typography>

                    {selectedFiles.map((fileEntry, index) => (
                        <Stack
                            key={index}
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            sx={{ p: 1, borderRadius: 1, bgcolor: 'action.hover' }}
                        >
                            <Stack sx={{ flex: 1 }}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Typography variant="body2" sx={{ fontSize: '12px' }}>
                                        {fileEntry?.file?.name || fileEntry?.fileName}
                                    </Typography>

                                    {/* Show loader while uploading */}
                                    {fileEntry.uploading && <CircularProgress size={12} />}

                                    {/* Show green check when done */}
                                    {!fileEntry.uploading && fileEntry.fileId && (
                                        <Typography sx={{ color: 'success.main', fontSize: '12px' }}>✓</Typography>
                                    )}
                                </Stack>

                                <Typography variant="caption" color="text.secondary">
                                    {rescheduleProps ? '' : formatFileSize(fileEntry?.file?.size)}
                                </Typography>

                                {fileEntry.error && (
                                    <Typography variant="caption" color="error.main">
                                        {fileEntry.error}
                                    </Typography>
                                )}
                            </Stack>

                            <Button
                                size="small"
                                disabled={fileEntry.uploading}
                                onClick={() => handleRemoveFile(fileEntry?.fileId)}
                            >
                                {t('Common.Remove')}
                            </Button>
                        </Stack>
                    ))}
                </Stack>
            )}
        </Box>
    );
};

export default FileUploadModal;
