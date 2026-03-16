import { IconButton, Stack, Typography } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import FButton from '../../../../commonComponents/F_Button';
import { SwapHorizRounded } from '@mui/icons-material';
import EditImage from '../popup/EditImage';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import apiFetcher from '../../../../../utils/interCeptor';
import { HttpStatusCode } from 'axios';
import { t } from 'i18next';

export default function DynamicUpload({
    field,
    formik,
    compairImage,
    name = 'upload',
    advancedJournalId = null,
    isCreating = false,
    setAllImagesForCompair,
    allImagesForCompair,
    autoSave,
}) {
    const [images, setImages] = useState([]);
    const [showEditor, setShowEditor] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const fileInputRef = useRef(null);

    const user = useSelector((state) => state.user.data);
    const handleFileChange = (e) => {
        const files = e.target.files;

        if (files.length > 4) {
            toast.error(t('Customer.ADVJournalMaxFileToast'));
            return;
        }

        const body = {
            advance_journal_id: advancedJournalId,
            employee_id: user.id,
        };

        if (files.length) {
            const fileArray = Array.from(files);
            let uploadedCount = 0;
            let allUploadedImages = [...images]; // Track all uploaded images
            const toastId = toast.loading(`${t('Common.Uploading')} 0/${fileArray.length}...`);

            const uploadNext = (index) => {
                const file = fileArray[index];
                const payload = new FormData();
                payload.append('attachment', file);
                payload.append('req_body', JSON.stringify(body));

                apiFetcher
                    .post(`api/v1/store/advance_journal/attachment`, payload, {
                        onUploadProgress: (progressEvent) => {
                            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                            toast.update(toastId, {
                                render: `${t('Common.Uploading')} ${uploadedCount}/${
                                    fileArray.length
                                } (${percentCompleted}%)`,
                                isLoading: true,
                            });
                        },
                    })
                    .then((response) => {
                        if (response.status === HttpStatusCode.Created || response.status === HttpStatusCode.Ok) {
                            const newImage = {
                                id: response?.data?.data?.id,
                                attachment: response?.data?.data?.attachment,
                            };
                            allUploadedImages = [...allUploadedImages, newImage];
                            setImages(allUploadedImages);
                            setAllImagesForCompair((prev) => [...prev, newImage]);
                            formik.setFieldValue(name, allUploadedImages, false);
                        }
                    })
                    .catch(() => {
                        toast.update(toastId, {
                            render: `${t('Customer.AttachError')} (${uploadedCount}/${fileArray.length})`,
                            type: 'error',
                            isLoading: false,
                            autoClose: 2000,
                        });
                    })
                    .finally(() => {
                        uploadedCount++;
                        if (uploadedCount < fileArray.length) {
                            uploadNext(uploadedCount);
                        } else {
                            // All files uploaded - call autoSave once with all images
                            toast.update(toastId, {
                                render: t('Customer.AttachSuccess'),
                                type: 'success',
                                isLoading: false,
                                autoClose: 2000,
                            });
                            // Auto-save with all uploaded images after all uploads complete
                            // Show loading toast immediately before setTimeout
                            const saveToastId = toast.loading(t('Customer.Saving'));
                            setTimeout(() => {
                                if (autoSave) {
                                    autoSave({ [name]: allUploadedImages }, saveToastId);
                                }
                            }, 500);
                        }
                    });
            };

            uploadNext(0); // Start the chain
        }
    };

    const handleButtonClick = () => {
        if (fileInputRef) {
            fileInputRef.current.click();
        } else {
            // toast.error("File input reference is not available");
        }
    };

    const handleRemoveImage = (id) => {
        let newImages = images.filter((image) => image.id !== id);

        apiFetcher
            .delete(`api/v1/store/advance_journal/attachment/${id}`)
            .then((response) => {
                setImages(newImages);
                setAllImagesForCompair(allImagesForCompair.filter((image) => image.id !== id));
                formik.setFieldValue(name, newImages, false);
                // Auto-save with updated images directly
                // Show loading toast immediately before setTimeout
                const saveToastId = toast.loading(t('Customer.Saving'));
                setTimeout(() => {
                    if (autoSave) {
                        autoSave({ [name]: newImages }, saveToastId);
                    }
                }, 500);
            })
            .catch((error) => {});
    };

    // Update images state when field value or formik initialValues change (e.g., after page reload)
    useEffect(() => {
        // Prioritize field.value (comes from API) over formik initialValues
        const sourceValue = field?.value || formik?.initialValues?.[name] || [];
        if (Array.isArray(sourceValue)) {
            setImages(sourceValue);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [field?.value, formik?.initialValues?.[name]]);

    return (
        <Stack>
            <Typography fontWeight={700} variant="body1">
                {field?.name}
            </Typography>
            {!formik?.values?.disabled && (
                <Stack mt={1} ml={{ xs: 0, md: 2 }}>
                    <Stack
                        border={'2px dashed #D9D9D9'}
                        borderRadius={2}
                        p={4}
                        spacing={2}
                        alignItems="center"
                        justifyContent="center"
                        sx={{ minHeight: 150 }}
                    >
                        <svg width="39" height="28" viewBox="0 0 39 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M30.1214 27.1477H24.0912H22.4673H22.1166V19.059H24.762C25.4329 19.059 25.8293 18.2967 25.4329 17.7478L20.287 10.6273C19.9592 10.1699 19.2807 10.1699 18.9528 10.6273L13.8069 17.7478C13.4105 18.2967 13.7993 19.059 14.4778 19.059H17.1232V27.1477H16.7725H15.1487H8.15781C4.15542 26.9266 0.96875 23.1834 0.96875 19.1276C0.96875 16.3298 2.48585 13.8902 4.73481 12.5713C4.52898 12.0148 4.42224 11.4202 4.42224 10.795C4.42224 7.93618 6.7322 5.62622 9.59105 5.62622C10.2086 5.62622 10.8032 5.73295 11.3597 5.93879C13.0141 2.43193 16.5819 0 20.7291 0C26.0962 0.00762361 30.5179 4.11675 31.021 9.35417C35.1454 10.0632 38.2787 13.8826 38.2787 18.2052C38.2787 22.8251 34.6803 26.8275 30.1214 27.1477Z"
                                fill="#D9D9D9"
                            />
                        </svg>

                        <Typography variant="caption">{t('Customer.UploadImageText')}</Typography>

                        <input
                            disabled={formik?.values?.disabled}
                            id="advanced-journal-upload-before"
                            type="file"
                            accept=".jpg, .jpeg, .png, .heif, image/jpeg, image/png, image/heif"
                            maxCount={4}
                            multiple // Enable multiple file selection
                            style={{ display: 'none' }}
                            ref={fileInputRef} // Attach ref to input
                            onChange={handleFileChange}
                        />

                        <FButton
                            disabled={formik?.values?.disabled}
                            onClick={() => handleButtonClick()}
                            title={t('Common.Upload')}
                            variant="save"
                            sx={{ width: { xs: '100%', md: '10%' } }}
                        />
                    </Stack>
                </Stack>
            )}

            {images &&
                images.map((img, index) => (
                    <Stack
                        sx={{
                            ml: { xs: 0, md: 2 },
                            mt: 1,
                            '&:hover': { bgcolor: '#F1F1F1' },
                        }}
                        display={'flex'}
                        pr={4}
                        p={{ xs: 2, md: 0 }}
                        flexDirection={{ xs: 'column', md: 'row' }}
                        alignItems={'center'}
                        gap={2}
                        key={index}
                    >
                        <img
                            onClick={() => {
                                setSelectedImage(img);
                                setShowEditor(true);
                            }}
                            src={`${process.env.REACT_APP_IMG_URL}${img?.attachment}`}
                            alt="Uploaded"
                            style={{ objectFit: 'contain', backgroundColor: '#f1f1f190' }}
                            width={200}
                            height={200}
                        />

                        <Typography variant="body1" color="#C74141" mt={2}>
                            img-{img?.id}{' '}
                        </Typography>
                        <IconButton
                            color="primary"
                            disableFocusRipple
                            disableRipple
                            disableTouchRipple
                            onClick={compairImage}
                            sx={{
                                '&:hover': { bgcolor: 'D9D9D9' },
                                width: { xs: '100%', md: '10%' },
                                bgcolor: '#D9D9D9',
                                color: '#fff',
                                ml: { md: 'auto' },
                                height: '40px',
                                mt: { xs: 0, md: 2 },
                                px: 2,
                                borderRadius: 6,
                            }}
                            aria-label="add to shopping cart"
                        >
                            <SwapHorizRounded />
                        </IconButton>
                        {!formik?.values?.disabled && (
                            <FButton
                                onClick={() => handleRemoveImage(img?.id)}
                                title={t('Common.Remove')}
                                variant="delete"
                                sx={{ width: { xs: '100%', md: '10%' }, height: '40px', mt: 2 }}
                            />
                        )}
                    </Stack>
                ))}

            {showEditor && !formik?.values?.disabled && (
                <EditImage
                    advancedJournalId={advancedJournalId}
                    images={images}
                    setImages={setImages}
                    employeeId={user?.id}
                    selectedImage={selectedImage}
                    open={showEditor}
                    onClose={() => setShowEditor(false)}
                    autoSave={autoSave}
                    formik={formik}
                    name={name}
                />
            )}
            {formik?.touched?.[name] && formik?.errors?.[name] && (
                <Typography style={{ color: 'red' }}>{formik?.errors?.[name]}</Typography>
            )}
        </Stack>
    );
}
