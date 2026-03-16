import React from 'react';
import { useNavigate } from 'react-router-dom';

const SelectLocation = () => {
  const navigate = useNavigate();

  // Get the profile from localStorage, parse it, and handle cases where it might be missing or undefined.
  const profile = JSON.parse(localStorage.getItem('profile')) || {};

  // Safely access outlets or provide an empty array as a fallback
  const outlets = profile.outlets || [];

  const handleLocationSelect = (location) => {
    localStorage.setItem('selected_location', JSON.stringify(location));
    navigate('/select-employee');
  };

  return (
    <div>
      <h2>Choose Department</h2>
      {outlets.length > 0 ? (
        outlets.map((location) => (
          <div key={location.id} onClick={() => handleLocationSelect(location)}>
            <p>{location.name}</p>
            <p>{location.email}</p>
          </div>
        ))
      ) : (
        <p>No locations available</p>
      )}
    </div>
  );
};

export default SelectLocation;
