import { AlertTriangle, X } from 'lucide-react';
import './ConfirmModal.css';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
}

export const ConfirmModal = ({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = 'Eliminar',
    cancelText = 'Cancelar'
}: ConfirmModalProps) => {
    
    if (!isOpen) return null;

    return (
        <div className="confirm-overlay" onClick={onCancel}>
            <div className="confirm-content" onClick={(e) => e.stopPropagation()}>
                <button className="confirm-close" onClick={onCancel}>
                    <X size={20} />
                </button>
                
                <div className="confirm-header">
                    <div className="confirm-icon-wrapper">
                        <AlertTriangle size={24} className="confirm-icon" />
                    </div>
                    <h3 className="confirm-title">{title}</h3>
                </div>
                
                <div className="confirm-body">
                    <p>{message}</p>
                </div>
                
                <div className="confirm-footer">
                    <button className="btn-cancelar" onClick={onCancel}>
                        {cancelText}
                    </button>
                    <button className="btn-eliminar" onClick={onConfirm} autoFocus>
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};