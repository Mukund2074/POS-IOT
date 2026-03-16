import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const EnterPasscode = () => {
  const [passcode, setPasscode] = useState('');
  const selectedEmployee = JSON.parse(localStorage.getItem('selected_employee'));
  const navigate = useNavigate();

  const handlePasscodeSubmit = () => {
    if (passcode === selectedEmployee.access_code) {
      navigate('/dashboard'); // Navigate to the dashboard or main page
    } else {
      alert('Incorrect passcode');
    }
  };

  return (
    <div>
      <h2>Enter Passcode</h2>
      <input 
        type="password" 
        value={passcode} 
        onChange={(e) => setPasscode(e.target.value)} 
        maxLength="6" 
      />
      <button onClick={handlePasscodeSubmit}>Submit</button>
    </div>
  );
};

export default EnterPasscode;
