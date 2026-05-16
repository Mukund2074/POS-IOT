import React, { useState } from 'react';
import AdminLoginForm from './UI/AdminLoginForm';
import AdminOTPForm from './UI/AdminOTPForm';
import './AdminLogin.css';

const AdminLoginPage = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');

  const handleLoginSuccess = (email) => {
    setEmail(email);
    setStep(2);
  };

  return (
    <div className="admin-login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            {/* You can add a logo here */}
            <h1>A</h1>
          </div>
          <h2>Admin Access</h2>
          <p>{step === 1 ? 'Enter your credentials to continue' : 'Verify the code sent to your email'}</p>
        </div>
        
        {step === 1 ? (
          <AdminLoginForm onSuccess={handleLoginSuccess} />
        ) : (
          <AdminOTPForm email={email} onBack={() => setStep(1)} />
        )}
      </div>
    </div>
  );
};

export default AdminLoginPage;
