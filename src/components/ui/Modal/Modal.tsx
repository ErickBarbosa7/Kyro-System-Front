import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import './Modal.css';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string | React.ReactNode;
    children: React.ReactNode;
    maxWidth?: string;
    zIndex?: number;
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    maxWidth = '500px',
    zIndex = 998
}) => {
    // Evitar que la pantalla de fondo haga scroll cuando el modal está abierto
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" style={{ zIndex }}>
            <div className="modal-content" style={{ maxWidth }}>
                <div className="modal-header">
                    <div className="modal-title-wrapper">
                        {typeof title === 'string' ? <h3>{title}</h3> : title}
                    </div>
                    <button type="button" className="btn-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>
                
                {/* El contenido dinámico va aquí adentro */}
                <div className="modal-body">
                    {children}
                </div>
            </div>
        </div>
    );
};