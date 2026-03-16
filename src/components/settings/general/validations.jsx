import {  array, boolean, number, object, string } from 'yup';
import { t } from "i18next";

export const generalSettingsValidate = object({
    name: string().required(t("Setting.BusinessNameIsRequired")).typeError(t("Setting.PleaseEnterValidBusinessName")),
    address: string().required(t("Setting.BusinessStreetNameIsRequired")).typeError('Please enter valid address'),
    // name: string().required('Business name is required').typeError('Please enter valid business name'),
    // address: string().required(' business street name is required').typeError('Please enter valid address'),
    
    // zip_code: string().required('Zip code is required').typeError('Please enter valid zip code'),
    // about: string().required('About us is required').typeError('Please enter valid about us'),
    about: string().nullable(),
    
    contact_number: string().required('Business phone number is required')
    .min(8, "Must be exactly 8 digits")
    .max(8, "Must be exactly 8 digits").typeError('Please enter valid business phone number'),
    
    contact_number2: string().nullable()
    .min(8, "Must be exactly 8 digits")
    .max(8, "Must be exactly 8 digits").typeError('Please enter valid business phone number'),


    // city: string().required('City is required').typeError('Please enter valid city'),

    cvr_number: string().required('CVR number is required').typeError('Please enter valid cvr number'),
    lng: number().typeError('Longitude must be a number').required('Longitude is required').typeError('Please enter valid longitude'),
    lat: number().typeError('latitube must be a number').required('Latitude is required').typeError('Please enter valid latitude'),
    email: string().email('Invalid email format').required('Email is required'),
    hide_email: boolean().default(false),
    website : string().nullable().typeError('Please enter valid website'),
    instagram : string().nullable().typeError('Please enter instagram url'),
    facebook : string().nullable().typeError('Please enter facebook url'),
    tiktok : string().nullable().typeError('Please enter tiktok url'),
    images : array(),
    profile_image : string(),
    banner_image : string()
    // bookingURL : string().required('Booking URL is required'),


})