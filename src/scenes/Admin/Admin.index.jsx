import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Home, Users } from 'lucide-react';
import CreateStoreForm from './UI/CreateStoreForm';
import EmployeeList from './UI/EmployeeList';
import './Admin.css';

const AdminPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className="admin-page-container">
      <div className="admin-header">
        <div className="header-top-row">
          <div className="header-left-group">
            <button className="back-btn" onClick={() => navigate('/admin')}>
              <ArrowLeft size={20} />
              Back to Stores
            </button>
            <div className="title-stack">
              <h1>{isEdit ? 'Store Management' : 'Create New Store'}</h1>
              <p>{isEdit ? 'Manage store configuration and employees' : 'Configure a new store location and POS settings'}</p>
            </div>
          </div>
        </div>

        {isEdit && (
          <div className="admin-tabs">
            <button 
              className={`tab-btn ${activeTab === 'home' ? 'active' : ''}`}
              onClick={() => setActiveTab('home')}
            >
              <Home size={18} />
              Home
            </button>
            <button 
              className={`tab-btn ${activeTab === 'employees' ? 'active' : ''}`}
              onClick={() => setActiveTab('employees')}
            >
              <Users size={18} />
              Employees
            </button>
          </div>
        )}
      </div>
      <div className="admin-content">
        {activeTab === 'home' ? <CreateStoreForm /> : <EmployeeList outletId={id} />}
      </div>
    </div>
  );
};

export default AdminPage;
