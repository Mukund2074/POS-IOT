import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStoresApi, approveStoreApi, deleteStoreApi } from '../../../utils/Api/Authantication';
import { Search, Plus, ChevronLeft, ChevronRight, Store, MapPin, Phone, Mail, Pencil, Trash2, AlertTriangle, X } from 'lucide-react';
import { toast } from 'react-toastify';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(0);
    const [total, setTotal] = useState(0);
    const [deleteModal, setDeleteModal] = useState({ show: false, id: null });
    const limit = 25;
    const navigate = useNavigate();

    const fetchStores = async () => {
        setLoading(true);
        try {
            const response = await getStoresApi({
                limit,
                offset: page * limit,
                search,
            });
            // API response shape might be { count, outlets } or { data: { count, outlets } }
            const outlets = response?.outlets || response?.data?.outlets || [];
            const count = response?.count || response?.data?.count || 0;

            setStores(outlets);
            setTotal(count);
        } catch (error) {
            console.error('Failed to fetch stores:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (outlet_id, currentStatus) => {
        try {
            const newStatus = !currentStatus;
            await approveStoreApi({ outlet_id, approve: newStatus });
            toast.success(`Store ${newStatus ? 'approved' : 'rejected'} successfully`);

            // Update local state
            setStores((prevStores) =>
                prevStores.map((store) => (store.id === outlet_id ? { ...store, is_active: newStatus } : store)),
            );
        } catch (error) {
            toast.error(error.message || 'Failed to update status');
        }
    };

    const handleDeleteStore = async () => {
        const outlet_id = deleteModal.id;
        try {
            await deleteStoreApi({ outlet_id });
            toast.success('Store deleted successfully');
            setStores((prevStores) => prevStores.filter((store) => store.id !== outlet_id));
            setTotal((prev) => prev - 1);
            setDeleteModal({ show: false, id: null });
        } catch (error) {
            toast.error(error.message || 'Failed to delete store');
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchStores();
        }, 500); // Debounce search
        return () => clearTimeout(timer);
    }, [search, page]);

    return (
        <div className="admin-dashboard-container">
            <div className="dashboard-header">
                <div className="header-left">
                    <h1>Store Management</h1>
                    <p>You have {total} stores in your network</p>
                </div>
                <button className="create-store-btn" onClick={() => navigate('/admin/create')}>
                    <Plus size={20} />
                    Create New Store
                </button>
            </div>

            <div className="dashboard-controls">
                <div className="search-bar">
                    <Search size={20} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search stores by name"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Store Details</th>
                            <th>Contact Info</th>
                            <th>Location</th>
                            <th>Status</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            Array(5)
                                .fill(0)
                                .map((_, i) => (
                                    <tr key={i} className="skeleton-row">
                                        <td colSpan="5">
                                            <div className="skeleton-line"></div>
                                        </td>
                                    </tr>
                                ))
                        ) : stores.length > 0 ? (
                            stores.map((store) => (
                                <tr key={store.id}>
                                    <td>
                                        <div className="store-cell">
                                            <div className="store-avatar">
                                                {store.profile_image ? (
                                                    <img
                                                        src={`${process.env.REACT_APP_IMG_URL}${store.profile_image}`}
                                                        alt={store.web_store_name}
                                                    />
                                                ) : (
                                                    <Store size={20} />
                                                )}
                                            </div>
                                            <div className="store-info">
                                                <span className="store-name">{store.name || 'Unnamed Store'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="contact-cell">
                                            <div className="contact-item">
                                                <Mail size={14} /> {store.email}
                                            </div>
                                            <div className="contact-item">
                                                <Phone size={14} /> {store.phone_number}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="location-cell">
                                            <MapPin size={14} />
                                            <span className="line-clamp-2">{store.address}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <label className="toggle-switch">
                                            <input
                                                type="checkbox"
                                                checked={store.is_active}
                                                onChange={() => handleToggleStatus(store.id, store.is_active)}
                                            />
                                            <span className="slider"></span>
                                        </label>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button 
                                                className="action-btn edit-btn" 
                                                onClick={() => navigate(`/admin/edit/${store.id}`, { state: { store } })}
                                                title="Edit Store"
                                            >
                                                <Pencil size={18} />
                                            </button>
                                            <button 
                                                className="action-btn delete-btn" 
                                                onClick={() => setDeleteModal({ show: true, id: store.id })}
                                                title="Delete Store"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="empty-state">
                                    <Store size={48} />
                                    <p>No stores found matching your search</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="pagination-container">
                <div className="pagination-info">
                    Showing {page * limit + 1} to {Math.min((page + 1) * limit, total)} of {total} entries
                </div>
                <div className="pagination-btns">
                    <button disabled={page === 0} onClick={() => setPage((p) => p - 1)} className="p-btn">
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        disabled={(page + 1) * limit >= total}
                        onClick={() => setPage((p) => p + 1)}
                        className="p-btn"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>
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
                            <h3>Delete Store?</h3>
                            <p>Are you sure you want to delete this store? This action is permanent and all associated data will be removed.</p>
                        </div>
                        <div className="modal-footer">
                            <button className="cancel-btn" onClick={() => setDeleteModal({ show: false, id: null })}>
                                Cancel
                            </button>
                            <button className="confirm-delete-btn" onClick={handleDeleteStore}>
                                Delete Store
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
