import React, { useState, useEffect } from 'react';
import { getEmployeesApi, createEmployeeApi, deleteEmployeeApi } from '../../../utils/Api/Authantication';
import { Search, Plus, User, Trash2, X, AlertTriangle } from 'lucide-react';
import { toast } from 'react-toastify';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const CreateEmployeeSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  phone_number: Yup.string()
    .matches(/^[0-9]+$/, 'Must be only numbers')
    .required('Phone number is required'),
  role: Yup.string().required('Role is required'),
  access_code: Yup.string()
    .matches(/^[0-9]+$/, 'Must be only numbers')
    .min(4, 'Min 4 digits')
    .required('Access code is required'),
});

const EmployeeList = ({ outletId }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null });
  const [search, setSearch] = useState('');

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await getEmployeesApi({ outlet_id: outletId });
      const empData = response?.data?.employees || response?.employees || [];
      setEmployees(empData);
    } catch (error) {
      toast.error('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [outletId]);

  const handleDelete = async () => {
    const id = deleteModal.id;
    try {
      await deleteEmployeeApi({ employee_id: id });
      toast.success('Employee removed successfully');
      setEmployees(employees.filter(emp => emp.id !== id));
      setDeleteModal({ show: false, id: null });
    } catch (error) {
      toast.error('Failed to remove employee');
    }
  };

  const filteredEmployees = employees.filter(emp => 
    emp.name?.toLowerCase().includes(search.toLowerCase()) || 
    emp.phone_number?.includes(search)
  );

  return (
    <div className="employee-list-container">
      <div className="list-controls">
        <div className="search-bar">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search by name or phone..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="add-btn" onClick={() => setShowModal(true)}>
          <Plus size={18} />
          Add Employee
        </button>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" style={{ textAlign: 'center', padding: '40px' }}>Loading...</td></tr>
            ) : filteredEmployees.length > 0 ? (
              filteredEmployees.map(emp => (
                <tr key={emp.id}>
                  <td>
                    <div className="emp-cell">
                      <div className="emp-avatar">
                        <User size={16} />
                      </div>
                      <span>{emp.name}</span>
                    </div>
                  </td>
                  <td>{emp.phone_number}</td>
                  <td>
                    <span className={`role-badge ${emp.role?.toLowerCase()}`}>
                      {emp.role}
                    </span>
                  </td>
                  <td>
                    <button className="action-btn delete-btn" onClick={() => setDeleteModal({ show: true, id: emp.id })}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="4" style={{ textAlign: 'center', padding: '40px' }}>No employees found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="confirm-modal create-modal">
            <div className="modal-header">
              <h3>Add New Employee</h3>
              <button className="close-modal" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <Formik
              initialValues={{
                name: '',
                phone_number: '',
                role: 'EMPLOYEE',
                access_code: '',
                country_code: '+45'
              }}
              validationSchema={CreateEmployeeSchema}
              onSubmit={async (values, { setSubmitting }) => {
                try {
                  const formData = new FormData();
                  const payload = {
                    ...values,
                    outlet_id: parseInt(outletId),
                    journal_access: false
                  };

                  formData.append('req_body', JSON.stringify(payload));

                  await createEmployeeApi({ payload: formData });
                  toast.success('Employee added successfully');
                  setShowModal(false);
                  fetchEmployees();
                } catch (error) {
                  toast.error(error.message || 'Failed to add employee');
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {({ isSubmitting, values, setFieldValue }) => (
                <Form className="modal-form">
                  <div className="form-group">
                    <label>Full Name</label>
                    <Field name="name" className="form-input" placeholder="Enter name" />
                    <ErrorMessage name="name" component="div" className="error-message" />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <Field name="phone_number">
                      {({ field, form }) => (
                        <input 
                          {...field}
                          type="text" 
                          className="form-input" 
                          placeholder="e.g. 12345678"
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, '');
                            form.setFieldValue(field.name, val);
                          }}
                        />
                      )}
                    </Field>
                    <ErrorMessage name="phone_number" component="div" className="error-message" />
                  </div>
                  <div className="form-group">
                    <label>Role</label>
                    <div className="role-selector">
                      <button 
                        type="button"
                        className={`role-option ${values.role === 'ADMIN' ? 'active' : ''}`}
                        onClick={() => setFieldValue('role', 'ADMIN')}
                      >
                        Admin
                      </button>
                      <button 
                        type="button"
                        className={`role-option ${values.role === 'EMPLOYEE' ? 'active' : ''}`}
                        onClick={() => setFieldValue('role', 'EMPLOYEE')}
                      >
                        Employee
                      </button>
                    </div>
                    <ErrorMessage name="role" component="div" className="error-message" />
                  </div>
                  <div className="form-group">
                    <label>Access Code</label>
                    <Field name="access_code">
                      {({ field, form }) => (
                        <input 
                          {...field}
                          type="text" 
                          className="form-input" 
                          placeholder="4-6 digit code"
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, '');
                            form.setFieldValue(field.name, val);
                          }}
                        />
                      )}
                    </Field>
                    <ErrorMessage name="access_code" component="div" className="error-message" />
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
                    <button type="submit" className="confirm-delete-btn" disabled={isSubmitting} style={{ background: '#6366f1' }}>
                      {isSubmitting ? 'Adding...' : 'Add Employee'}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      )}
      {/* Custom Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <div className="modal-header">
              <div className="warning-icon">
                <AlertTriangle size={24} />
              </div>
              <button className="close-modal" onClick={() => setDeleteModal({ show: false, id: null })}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <h3>Remove Employee?</h3>
              <p>Are you sure you want to remove this staff member? They will lose access to this store immediately.</p>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setDeleteModal({ show: false, id: null })}>
                Cancel
              </button>
              <button className="confirm-delete-btn" onClick={handleDelete}>
                Remove Staff
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;
