import React from 'react';
import { FiAlertTriangle, FiX } from 'react-icons/fi';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger)' }}>
                        <FiAlertTriangle /> {title || 'Confirm Action'}
                    </h2>
                    <button className="modal-close" onClick={onClose}><FiX /></button>
                </div>
                <div className="modal-body">
                    <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                        {message || 'Are you sure you want to proceed? This action cannot be undone.'}
                    </p>
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                    <button className="btn btn-danger" onClick={() => {
                        onConfirm();
                        onClose();
                    }}>Delete</button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
