import React, { useState, useRef } from 'react';
import { verifyAdminOTPApi } from '../../../../utils/Api/Authantication';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const AdminOTPForm = ({ email, onBack }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length < 6) {
      toast.error('Please enter complete OTP');
      return;
    }

    setIsLoading(true);
    try {
      const response = await verifyAdminOTPApi({
        payload: { email, otp: otpValue }
      });
      
      // Store admin token separately as requested
      localStorage.setItem('admin_auth_token', response.data.access_token);
      localStorage.setItem('employee_role', 'ADMIN');
      
      toast.success('Successfully logged in as Admin');
      navigate('/admin'); // Redirect to admin dashboard/form
    } catch (error) {
      toast.error(error.message || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <div className="otp-inputs">
        {otp.map((digit, index) => (
          <input
            key={index}
            type="text"
            className="otp-digit"
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            ref={(el) => (inputRefs.current[index] = el)}
            maxLength={1}
          />
        ))}
      </div>

      <button type="submit" className="login-button" disabled={isLoading}>
        {isLoading ? 'Verifying...' : 'Verify OTP'}
      </button>

      <div className="back-link" onClick={onBack}>
        Go back to login
      </div>
    </form>
  );
};

export default AdminOTPForm;
