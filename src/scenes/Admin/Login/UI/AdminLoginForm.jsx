import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { adminLoginApi } from '../../../../utils/Api/Authantication';
import { toast } from 'react-toastify';

const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().min(8, 'Password too short').required('Password is required'),
});

const AdminLoginForm = ({ onSuccess }) => {
  return (
    <Formik
      initialValues={{ email: '', password: '' }}
      validationSchema={LoginSchema}
      onSubmit={async (values, { setSubmitting }) => {
        try {
          const response = await adminLoginApi({ payload: values });
          toast.success('OTP sent to your email');
          onSuccess(values.email);
        } catch (error) {
          toast.error(error.message || 'Login failed');
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ isSubmitting }) => (
        <Form className="login-form">
          <div className="input-group">
            <label>Email Address</label>
            <Field 
              name="email" 
              type="email" 
              placeholder="admin@example.com" 
              className="login-input" 
            />
            <ErrorMessage name="email" component="div" className="error-text" />
          </div>
          
          <div className="input-group">
            <label>Password</label>
            <Field 
              name="password" 
              type="password" 
              placeholder="••••••••" 
              className="login-input" 
            />
            <ErrorMessage name="password" component="div" className="error-text" />
          </div>

          <button type="submit" className="login-button" disabled={isSubmitting}>
            {isSubmitting ? 'Authenticating...' : 'Sign In'}
          </button>
        </Form>
      )}
    </Formik>
  );
};

export default AdminLoginForm;
