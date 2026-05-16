import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { 
  Store, 
  MapPin, 
  Image as ImageIcon, 
  Layout, 
  Layers, 
  CreditCard,
  Ticket,
  Trash2,
  PlusCircle
} from 'lucide-react';
import { createStoreApi, updateStoreApi } from '../../../utils/Api/Authantication';
import { toast } from 'react-toastify';

const CreateStoreSchema = Yup.object().shape({
  businessName: Yup.string().required('Store name is required'),
  passcode: Yup.string()
    .matches(/^[0-9]+$/, 'Must be only numbers')
    .min(4, 'Min 4 digits')
    .required('Passcode is required'),
  businessPhoneNum: Yup.string()
    .matches(/^[0-9]+$/, 'Must be only numbers')
    .required('Phone number is required'),
  contact_number: Yup.string()
    .matches(/^[0-9]+$/, 'Must be only numbers')
    .required('Contact number is required'),
  email: Yup.string()
    .email('Please enter a valid email')
    .required('Email is required'),
  login_email: Yup.string()
    .email('Please enter a valid email')
    .required('Login email is required'),
  businessAddress: Yup.string().required('Address is required'),
  latitude: Yup.number().typeError('Must be a number').required('Latitude is required'),
  longitude: Yup.number().typeError('Must be a number').required('Longitude is required'),
});

const CreateStoreForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEdit = !!id;
  
  const [bannerPreview, setBannerPreview] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [removedImageIds, setRemovedImageIds] = useState([]);
  
  const storeData = location.state?.store || {};

  const parseGeo = (geo) => {
    if (!geo) return { lat: '', long: '' };
    const match = geo.match(/POINT\s*\(([^ ]+)\s+([^ ]+)\)/);
    return match ? { long: match[1], lat: match[2] } : { lat: '', long: '' };
  };

  const { lat, long } = parseGeo(storeData.geo_location);

  const initialValues = {
    businessName: storeData.name || storeData.web_store_name || '',
    businessPhoneNum: storeData.phone_number || '',
    contact_number: storeData.contact_number || '',
    email: storeData.email || '',
    login_email: storeData.login_email || storeData.email || '',
    businessAddress: storeData.address || '',
    latitude: lat,
    longitude: long,
    bannerImage: null,
    profileImage: null,
    galleryImages: [],
    pos: storeData.addons?.some(a => a.addon_name === 'POS') || false,
    gift_card: storeData.addons?.some(a => a.addon_name === 'GiftCard') || false,
    punch_card: storeData.addons?.some(a => a.addon_name === 'PunchCard') || false,
    passcode: storeData.passcode || '', 
  };

  useEffect(() => {
    if (isEdit && storeData) {
      if (storeData.image) setBannerPreview(`${process.env.REACT_APP_IMG_URL}${storeData.image}`);
      if (storeData.profile_image) setProfilePreview(`${process.env.REACT_APP_IMG_URL}${storeData.profile_image}`);
      if (storeData.images && storeData.images.length > 0) {
        const previews = storeData.images.map(img => ({
          url: `${process.env.REACT_APP_IMG_URL}${img.image}`,
          id: img.id
        }));
        setGalleryPreviews(previews);
      }
    }
  }, [storeData, isEdit]);

  const handleImageChange = (e, setFieldValue, fieldName, setPreview) => {
    const file = e.target.files[0];
    if (file) {
      setFieldValue(fieldName, file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleGalleryChange = (e, setFieldValue, values) => {
    const files = Array.from(e.target.files);
    setFieldValue('galleryImages', [...values.galleryImages, ...files]);
    const newPreviews = files.map(file => ({
      url: URL.createObjectURL(file),
      id: null, // Local file doesn't have a server ID yet
      file: file
    }));
    setGalleryPreviews([...galleryPreviews, ...newPreviews]);
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={CreateStoreSchema}
      enableReinitialize
      onSubmit={async (values, { setSubmitting, resetForm }) => {
        try {
          const formData = new FormData();
          const webStoreName = values.businessName.trim().toLowerCase().replace(/\s+/g, '');

          const payload = {
            country_code: "+45",
            phone_number: values.businessPhoneNum,
            contact_number: values.contact_number,
            name: values.businessName,
            web_store_name: webStoreName,
            hide_email: false,
            booking_system: "Fiind",
            other_booking_system: "",
            address: values.businessAddress,
            contact_country_code: "+45",
            contact_country_code2: "+45",
            contact_number2: values.businessPhoneNum,
            website: "",
            email: values.email,
            login_email: values.login_email,
            about: "",
            cvr_number: "",
            lat: values.latitude,
            lng: values.longitude,
            category_ids: [],
            schedules: [
              {day: "Monday", open_time: "00:00", close_time: "00:00", is_closed: true},
              {day: "Tuesday", open_time: "00:00", close_time: "00:00", is_closed: true},
              {day: "Wednesday", open_time: "00:00", close_time: "00:00", is_closed: true},
              {day: "Thursday", open_time: "00:00", close_time: "00:00", is_closed: true},
              {day: "Friday", open_time: "00:00", close_time: "00:00", is_closed: true},
              {day: "Saturday", open_time: "00:00", close_time: "00:00", is_closed: true},
              {day: "Sunday", open_time: "00:00", close_time: "00:00", is_closed: true}
            ],
            policy: null,
            remove_images: removedImageIds,
            google_placeid: null,
            edit_journal_upto: null,
            allow_journal: false,
            allow_advance_journal: false,
            enable_sms: true,
            enable_email: true,
            charge_sms: false,
            charge_email: false,
            sms_price: null,
            email_price: null,
            billwork_customer_id: null,
            inspection_module: false,
            hide_from_marketplace: false,
            pos: values.pos,
            gift_card: values.gift_card,
            punch_card: values.punch_card,
            hide_marketplace_phone: false,
            marketing: false,
            passcode: values.passcode
          };

          formData.append('req_body', JSON.stringify(payload));

          if (values.bannerImage) formData.append('main_image', values.bannerImage);
          if (values.profileImage) formData.append('profile_image', values.profileImage);
          
          // Send only newly added gallery images
          values.galleryImages.forEach((img) => {
            formData.append('images', img);
          });

          if (isEdit) {
            await updateStoreApi({ outlet_id: id, payload: formData });
            toast.success('Store updated successfully!');
            navigate('/admin');
          } else {
            await createStoreApi({ payload: formData });
            toast.success('Store created successfully!');
            resetForm();
            setBannerPreview(null);
            setProfilePreview(null);
            setGalleryPreviews([]);
          }
        } catch (error) {
          toast.error(error.message || `Failed to ${isEdit ? 'update' : 'create'} store`);
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ values, setFieldValue, isSubmitting }) => (
        <Form className="store-form">
          {/* Section 1: Store Basics */}
          <div className="form-section">
            <h2 className="section-title"><Store size={20} /> Basic Information</h2>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Business Name</label>
                <Field name="businessName" placeholder="Enter store name" className="form-input" />
                <ErrorMessage name="businessName" component="div" className="error-message" />
              </div>
              <div className="form-group">
                <label className="form-label">Passcode</label>
                <Field name="passcode">
                  {({ field, form }) => (
                    <input 
                      {...field}
                      type="text" 
                      placeholder="4-6 digit passcode" 
                      className="form-input"
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        form.setFieldValue(field.name, val);
                      }}
                    />
                  )}
                </Field>
                <ErrorMessage name="passcode" component="div" className="error-message" />
              </div>
              <div className="form-group">
                <label className="form-label">Phone No</label>
                <Field name="businessPhoneNum">
                  {({ field, form }) => (
                    <input 
                      {...field}
                      type="text" 
                      placeholder="00000000" 
                      className="form-input"
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        form.setFieldValue(field.name, val);
                      }}
                    />
                  )}
                </Field>
                <ErrorMessage name="businessPhoneNum" component="div" className="error-message" />
              </div>
              <div className="form-group">
                <label className="form-label">Contact No</label>
                <Field name="contact_number">
                  {({ field, form }) => (
                    <input 
                      {...field}
                      type="text" 
                      placeholder="00000000" 
                      className="form-input"
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        form.setFieldValue(field.name, val);
                      }}
                    />
                  )}
                </Field>
                <ErrorMessage name="contact_number" component="div" className="error-message" />
              </div>
            </div>
          </div>

          {/* Section 2: Contact & Location */}
          <div className="form-section">
            <h2 className="section-title"><MapPin size={20} /> Contact & Location</h2>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <Field name="email" type="email" placeholder="store@example.com" className="form-input" />
                <ErrorMessage name="email" component="div" className="error-message" />
              </div>
              <div className="form-group">
                <label className="form-label">Login Email</label>
                <Field name="login_email" type="email" placeholder="admin@example.com" className="form-input" />
                <ErrorMessage name="login_email" component="div" className="error-message" />
              </div>
              <div className="form-group full-width">
                <label className="form-label">Address</label>
                <Field name="businessAddress" as="textarea" placeholder="Full street address" className="form-input" style={{ minHeight: '80px' }} />
                <ErrorMessage name="businessAddress" component="div" className="error-message" />
              </div>
              <div className="form-group">
                <label className="form-label">Latitude</label>
                <Field name="latitude" placeholder="e.g. 55.6800" className="form-input" />
                <ErrorMessage name="latitude" component="div" className="error-message" />
              </div>
              <div className="form-group">
                <label className="form-label">Longitude</label>
                <Field name="longitude" placeholder="e.g. 12.5900" className="form-input" />
                <ErrorMessage name="longitude" component="div" className="error-message" />
              </div>
            </div>
          </div>

          {/* Section 3: Media Uploads */}
          <div className="form-section">
            <h2 className="section-title"><ImageIcon size={20} /> Store Media</h2>
            <div className="upload-grid">
              <div className="upload-box">
                <label>Banner Image</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleImageChange(e, setFieldValue, 'bannerImage', setBannerPreview)} 
                  id="banner-upload"
                  hidden
                />
                <label htmlFor="banner-upload" className="upload-trigger">
                  <ImageIcon size={24} />
                  <span>Choose Banner</span>
                </label>
              </div>
              <div className="upload-box">
                <label>Profile Image</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleImageChange(e, setFieldValue, 'profileImage', setProfilePreview)} 
                  id="profile-upload"
                  hidden
                />
                <label htmlFor="profile-upload" className="upload-trigger">
                  <ImageIcon size={24} />
                  <span>Choose Profile</span>
                </label>
              </div>
              <div className="upload-box full-width">
                <label>Gallery Images</label>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  onChange={(e) => handleGalleryChange(e, setFieldValue, values)} 
                  id="gallery-upload"
                  hidden
                />
                <label htmlFor="gallery-upload" className="upload-trigger">
                  <PlusCircle size={24} />
                  <span>Add Gallery Photos</span>
                </label>
              </div>
            </div>

            <div className="image-previews">
              {bannerPreview && (
                <div className="preview-card banner-preview">
                  <img src={bannerPreview} alt="Banner" />
                  <button 
                    type="button" 
                    className="remove-img-btn"
                    onClick={() => {
                      setBannerPreview(null);
                      setFieldValue('bannerImage', null);
                      if (storeData.image) setRemovedImageIds(prev => [...prev, storeData.image_id]);
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                  <span className="preview-label">Banner</span>
                </div>
              )}
              {profilePreview && (
                <div className="preview-card profile-preview">
                  <img src={profilePreview} alt="Profile" />
                  <button 
                    type="button" 
                    className="remove-img-btn"
                    onClick={() => {
                      setProfilePreview(null);
                      setFieldValue('profileImage', null);
                      if (storeData.profile_image) setRemovedImageIds(prev => [...prev, storeData.profile_image_id]);
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                  <span className="preview-label">Profile</span>
                </div>
              )}
            </div>

            {galleryPreviews.length > 0 && (
              <div className="gallery-preview-section">
                <label className="form-label">Gallery Preview</label>
                <div className="gallery-grid">
                  {galleryPreviews.map((item, idx) => (
                    <div key={idx} className="gallery-item">
                      <img src={item.url} alt={`Gallery ${idx}`} />
                      <button 
                        type="button" 
                        className="remove-img-btn"
                        onClick={() => {
                          const newPreviews = galleryPreviews.filter((_, i) => i !== idx);
                          setGalleryPreviews(newPreviews);
                          
                          if (item.id) {
                            // Existing server image
                            setRemovedImageIds(prev => [...prev, item.id]);
                          } else {
                            // Local file
                            const newFiles = values.galleryImages.filter(f => f !== item.file);
                            setFieldValue('galleryImages', newFiles);
                          }
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Add-ons */}
          <div className="form-section">
            <h2 className="section-title"><Layers size={20} /> POS Addons</h2>
            <div className="addon-switches">
              <div className="switch-item">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Layout size={18} color="#6366f1" />
                  <span className="switch-label">POS</span>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={values.pos} 
                    onChange={(e) => setFieldValue('pos', e.target.checked)} 
                  />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="switch-item">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CreditCard size={18} color="#6366f1" />
                  <span className="switch-label">GiftCard</span>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={values.gift_card} 
                    onChange={(e) => setFieldValue('gift_card', e.target.checked)} 
                  />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="switch-item">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Ticket size={18} color="#6366f1" />
                  <span className="switch-label">PunchCard</span>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={values.punch_card} 
                    onChange={(e) => setFieldValue('punch_card', e.target.checked)} 
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (isEdit ? 'Update Store' : 'Create Store')}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default CreateStoreForm;
