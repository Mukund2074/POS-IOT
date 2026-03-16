'use client';
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Stack, TextField, Autocomplete, Typography } from '@mui/material';
import usePlacesAutocompleteService from 'react-google-autocomplete/lib/usePlacesAutocompleteService';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { t } from 'i18next';
import { HttpStatusCode } from 'axios';
import { getInspectionExtraCostApi } from '../../utils/Api/Booking';

// -------------------------------
// Parse Google Address Components
// -------------------------------
const parseAddressComponents = (components) => {
    let streetNumber = '';
    let route = '';
    let city = '';
    let zipCode = '';

    components.forEach((c) => {
        if (c.types.includes('street_number')) streetNumber = c.long_name;
        if (c.types.includes('route')) route = c.long_name;
        if (c.types.includes('locality')) city = c.long_name;
        if (c.types.includes('postal_code')) zipCode = c.long_name;
    });

    return {
        fullAddress: `${route} ${streetNumber}`.trim(),
        city,
        zipCode,
    };
};

const formatDisplayAddress = (parsedAddress, fallbackDescription = '') => {
    if (parsedAddress?.fullAddress) return parsedAddress.fullAddress;
    if (fallbackDescription) return fallbackDescription.split(',')[0]?.trim() || fallbackDescription;
    return '';
};

// -------------------------------
// Yup Validation
// -------------------------------
const validationSchema = Yup.object().shape({
    address: Yup.string().required(t('Customer.AddressError')),
    zipCode: Yup.string().required(t('Customer.ZipCodeError')),
    city: Yup.string().required(t('Customer.CityError')),
});

// -------------------------------
// Full Component
// -------------------------------
export default function AddressAutoComplete({
    title = t('Common.Address'),
    defaultValue,
    addressSx = {},
    zipCodeSx = {},
    citySx = {},
    onFormSubmit = () => {},
    onAddressSelect = () => {},
    onCostCalculationStateChange = () => {},
    flattnedServiceGroupIds = [],
}) {
    // -------------------------
    // Controlled input value
    // -------------------------
    const [inputValue, setInputValue] = useState(defaultValue?.address || '');
    const [selectedPlace, setSelectedPlace] = useState(null);

    // Google service hook
    const { placePredictions, getPlacePredictions, isPlacePredictionsLoading } = usePlacesAutocompleteService({
        apiKey: process.env.REACT_APP_GOOGLE_ADDRESS_API_KEY,
        debounce: 400,
    });

    // -------------------------
    // Formik Setup
    // -------------------------
    const formik = useFormik({
        initialValues: {
            address: defaultValue?.address || '',
            city: defaultValue?.city || '',
            zipCode: defaultValue?.zipCode || '',
            latitude: defaultValue?.latitude || '',
            longitude: defaultValue?.longitude || '',
        },
        enableReinitialize: true,
        validationSchema,
        onSubmit: async (values) => {
            await onFormSubmit(values);
            window.dispatchEvent(new CustomEvent('userInfoUpdated'));
        },
    });

    // Track previous values to only dispatch when they actually change
    const prevValuesRef = useRef({
        address: formik.values.address,
        zipCode: formik.values.zipCode,
        city: formik.values.city,
        latitude: formik.values.latitude,
        longitude: formik.values.longitude,
    });

    // Expose formik instance to parent whenever values actually change
    useEffect(() => {
        const currentValues = {
            address: formik.values.address,
            zipCode: formik.values.zipCode,
            city: formik.values.city,
            latitude: formik.values.latitude,
            longitude: formik.values.longitude,
        };

        const hasChanged =
            prevValuesRef.current.address !== currentValues.address ||
            prevValuesRef.current.zipCode !== currentValues.zipCode ||
            prevValuesRef.current.city !== currentValues.city ||
            prevValuesRef.current.latitude !== currentValues.latitude ||
            prevValuesRef.current.longitude !== currentValues.longitude;

        if (hasChanged) {
            prevValuesRef.current = currentValues;
            window.dispatchEvent(
                new CustomEvent('addressFormReady', {
                    detail: { formik },
                }),
            );
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        formik.values.address,
        formik.values.zipCode,
        formik.values.city,
        formik.values.latitude,
        formik.values.longitude,
    ]);

    const underlineResetSx = {
        '&:before': { borderBottom: 'none !important' },
        '&:after': { borderBottom: 'none !important' },
        '&:hover:not(.Mui-disabled):before': { borderBottom: 'none !important' },
        borderBottom: '1px solid #D9D9D9',
    };

    // Sync defaultValue changes to inputValue, selectedPlace, and formik
    useEffect(() => {
        const currentAddress = defaultValue?.address || '';
        const trimmedAddress = currentAddress ? formatDisplayAddress(null, currentAddress) : '';
        const newZipCode = defaultValue?.zipCode || '';
        const newCity = defaultValue?.city || '';
        const newLatitude = defaultValue?.latitude || '';
        const newLongitude = defaultValue?.longitude || '';

        // Update inputValue using functional form to avoid dependency on inputValue
        setInputValue((prev) => {
            if (prev !== trimmedAddress) {
                return trimmedAddress;
            }
            return prev;
        });

        // Only update formik if values actually changed to prevent infinite loops
        const valuesChanged =
            formik.values.address !== trimmedAddress ||
            formik.values.zipCode !== newZipCode ||
            formik.values.city !== newCity ||
            formik.values.latitude !== newLatitude ||
            formik.values.longitude !== newLongitude;

        if (valuesChanged) {
            // Sync to formik for validation using setValues for atomic update
            formik.setValues({
                ...formik.values,
                address: trimmedAddress,
                zipCode: newZipCode,
                city: newCity,
                latitude: newLatitude,
                longitude: newLongitude,
            });
        }

        // Calculate charges if address is auto-filled from customer
        // If coordinates exist, use them directly; otherwise geocode first
        if (currentAddress && defaultValue?.zipCode) {
            if (defaultValue?.latitude && defaultValue?.longitude) {
                // Customer has coordinates, calculate charges directly
                handleGetInspectionExtraCost({
                    zip_code: defaultValue.zipCode,
                    latitude: defaultValue.latitude,
                    longitude: defaultValue.longitude,
                    address: trimmedAddress,
                    city: newCity,
                });
            } else {
                // Customer doesn't have coordinates, geocode the address first
                const geocodeAddress = async () => {
                    try {
                        const fullAddress = `${currentAddress}, ${defaultValue.city || ''}, ${defaultValue.zipCode || ''}, Denmark`;
                        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${process.env.REACT_APP_GOOGLE_ADDRESS_API_KEY}`;

                        const res = await fetch(url);
                        const data = await res.json();

                        if (data.status === 'OK' && data.results[0]) {
                            const result = data.results[0];
                            const lat = result.geometry.location.lat;
                            const lng = result.geometry.location.lng;

                            // Update formik with coordinates
                            formik.setFieldValue('latitude', lat);
                            formik.setFieldValue('longitude', lng);

                            // Calculate charges with geocoded coordinates
                            handleGetInspectionExtraCost({
                                zip_code: defaultValue.zipCode,
                                latitude: lat,
                                longitude: lng,
                                address: trimmedAddress,
                                city: newCity,
                            });
                        }
                    } catch (e) {
                        console.error('Error geocoding address:', e);
                    }
                };

                geocodeAddress();
            }
        }

        // Only clear selectedPlace if address is being cleared
        if (!currentAddress) {
            setSelectedPlace(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        defaultValue?.address,
        defaultValue?.zipCode,
        defaultValue?.city,
        defaultValue?.latitude,
        defaultValue?.longitude,
    ]);

    // Create a stable string representation of group IDs for comparison
    const groupIdsKey = useMemo(() => {
        if (!flattnedServiceGroupIds || flattnedServiceGroupIds.length === 0) return '';
        return JSON.stringify([...flattnedServiceGroupIds].sort());
    }, [flattnedServiceGroupIds]);

    // Recalculate charges when service group IDs change (if address is already set)
    useEffect(() => {
        // Only recalculate if we have valid address data
        const hasValidAddress =
            formik.values.zipCode && formik.values.latitude && formik.values.longitude && formik.values.address;

        if (hasValidAddress && groupIdsKey && flattnedServiceGroupIds && flattnedServiceGroupIds.length > 0) {
            handleGetInspectionExtraCost({
                zip_code: formik.values.zipCode,
                latitude: formik.values.latitude,
                longitude: formik.values.longitude,
                address: formik.values.address,
                city: formik.values.city,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [groupIdsKey]);

    // -------------------------
    // Helper: Cost API
    // -------------------------
    const handleGetInspectionExtraCost = async ({ zip_code, latitude, longitude, address, city }) => {
        onCostCalculationStateChange(true);
        try {
            const res = await getInspectionExtraCostApi({
                zip_code,
                latitude,
                longitude,
                service_group_ids: flattnedServiceGroupIds,
            });

            if (res.status === HttpStatusCode.Ok || res.status === HttpStatusCode.Created) {
                onAddressSelect({
                    ...res.data?.data,
                    zipCode: zip_code,
                    latitude,
                    longitude,
                    address: address || formik.values.address,
                    city: city || formik.values.city,
                });
            }
        } catch (e) {
            console.error(e);
        } finally {
            onCostCalculationStateChange(false);
        }
    };

    // -------------------------
    // MAIN LOGIC:
    // Selecting place updates ZIP & CITY
    // -------------------------
    const handlePlaceSelect = async (event, option) => {
        console.log('option', option);
        if (!option) {
            setSelectedPlace(null);
            return;
        }

        const initialDescription = formatDisplayAddress(null, option.description);
        setInputValue(initialDescription);
        setSelectedPlace({
            ...option,
            description: initialDescription,
        });

        try {
            const url = `https://maps.googleapis.com/maps/api/geocode/json?place_id=${option.place_id}&key=${process.env.REACT_APP_GOOGLE_ADDRESS_API_KEY}`;

            const res = await fetch(url);
            const data = await res.json();

            if (data.status !== 'OK') return;

            const details = data.results[0];
            const parsed = parseAddressComponents(details.address_components);

            const lat = details.geometry.location.lat;
            const lng = details.geometry.location.lng;

            formik.setFieldValue('city', parsed.city);
            formik.setFieldValue('zipCode', parsed.zipCode);
            formik.setFieldValue('latitude', lat);
            formik.setFieldValue('longitude', lng);

            const normalizedDescription = formatDisplayAddress(parsed, option.description);

            // Update formik with the normalized address (parsed fullAddress)
            formik.setFieldValue('address', normalizedDescription);

            setInputValue(normalizedDescription);
            setSelectedPlace({
                ...option,
                description: normalizedDescription,
            });

            // cost api - calculate charges if zipcode exists
            if (parsed.zipCode) {
                handleGetInspectionExtraCost({
                    zip_code: parsed.zipCode,
                    latitude: lat,
                    longitude: lng,
                    address: normalizedDescription,
                    city: parsed.city,
                });
            } else {
                // Save address details even without zipcode
                // This ensures the address, city, and coordinates are saved
                onAddressSelect({
                    address: parsed.fullAddress,
                    city: parsed.city,
                    zipCode: '',
                    latitude: lat,
                    longitude: lng,
                });
            }
        } catch (e) {
            console.error(e);
        }
    };

    // Handle manual zipcode changes - recalculate charges if coordinates exist
    const handleZipCodeChange = (e) => {
        const newZipCode = e.target.value;
        formik.handleChange(e);

        // If coordinates exist and zipcode is provided, calculate charges
        // This handles the case where address was selected without zipcode
        if (newZipCode && formik.values.latitude && formik.values.longitude) {
            handleGetInspectionExtraCost({
                zip_code: newZipCode,
                latitude: formik.values.latitude,
                longitude: formik.values.longitude,
                address: formik.values.address,
                city: formik.values.city,
            });
        }
    };

    // -------------------------
    // ============================================================
    // RETURN JSX
    // ============================================================
    return (
        <form onSubmit={formik.handleSubmit}>
            <Stack sx={{ width: '100%' }}>
                <Typography variant="body1" sx={{ mt: 2 }}>
                    {title}
                </Typography>

                <Autocomplete
                    sx={{ width: '100%', mt: 1, ...addressSx }}
                    loading={isPlacePredictionsLoading}
                    options={placePredictions}
                    getOptionLabel={(opt) => opt.description || ''}
                    value={selectedPlace}
                    inputValue={inputValue}
                    isOptionEqualToValue={(option, value) => option.place_id === value?.place_id}
                    noOptionsText={t('Calendar.NoResultsFound') || 'No results found'}
                    onInputChange={(e, value, reason) => {
                        // Only update if it's a user input, not if it's being reset programmatically
                        if (reason !== 'reset') {
                            setInputValue(value);

                            // If user is typing and the value doesn't match the selected place,
                            // clear the selection so formik can update with typed value
                            const shouldClearSelection = selectedPlace && value !== selectedPlace.description;
                            if (shouldClearSelection) {
                                setSelectedPlace(null);
                            }

                            // Update formik.address when typing (only if no option is selected or selection was cleared)
                            // This ensures validation works even if user doesn't blur the field
                            if (!selectedPlace || shouldClearSelection) {
                                formik.setFieldValue('address', value);
                            }

                            if (value) {
                                getPlacePredictions({
                                    input: value,
                                    types: ['address'],
                                    componentRestrictions: { country: 'dk' },
                                });
                            } else {
                                // Clear address in formik when input is cleared
                                formik.setFieldValue('address', '');
                            }
                        }
                    }}
                    // onSelect={handlePlaceSelect}
                    onChange={handlePlaceSelect}
                    // Set address in formik when blurring without selection
                    onBlur={(e) => {
                        // Mark field as touched for validation
                        formik.setFieldTouched('address', true);
                        // If no option was selected but user typed something, save it
                        if (!selectedPlace && inputValue) {
                            formik.setFieldValue('address', inputValue);
                        }
                    }}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            name="address"
                            variant="standard"
                            placeholder={t('Address')}
                            onBlur={(e) => {
                                // Mark field as touched
                                formik.setFieldTouched('address', true);
                                // If no option was selected but user typed something, save it
                                if (!selectedPlace && inputValue) {
                                    formik.setFieldValue('address', inputValue);
                                }
                                // Also call formik's handleBlur for consistency
                                formik.handleBlur(e);
                            }}
                            InputProps={{
                                ...params.InputProps,
                                disableUnderline: true,
                                sx: underlineResetSx,
                            }}
                        />
                    )}
                />

                {/* error */}
                {formik.touched.address && formik.errors.address && (
                    <Typography variant="caption" color="red">
                        {formik.errors.address}
                    </Typography>
                )}

                {/* ZIP + CITY Fields */}
                <Stack direction={{ xs: 'column', md: 'row' }} gap={2} mt={2}>
                    <Stack>
                        <TextField
                            variant="standard"
                            placeholder={t('ZipCode')}
                            name="zipCode"
                            value={formik.values.zipCode}
                            onChange={handleZipCodeChange}
                            onBlur={formik.handleBlur}
                            sx={zipCodeSx}
                            InputProps={{
                                disableUnderline: true,
                                sx: underlineResetSx,
                            }}
                        />
                        {formik.touched.zipCode && formik.errors.zipCode && (
                            <Typography variant="caption" color="red">
                                {formik.errors.zipCode}
                            </Typography>
                        )}
                    </Stack>
                    <Stack>
                        <TextField
                            variant="standard"
                            placeholder={t('City')}
                            name="city"
                            value={formik.values.city}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            sx={citySx}
                            InputProps={{
                                disableUnderline: true,
                                sx: underlineResetSx,
                            }}
                        />
                        {formik.touched.city && formik.errors.city && (
                            <Typography variant="caption" color="red">
                                {formik.errors.city}
                            </Typography>
                        )}
                    </Stack>
                </Stack>
            </Stack>
        </form>
    );
}
