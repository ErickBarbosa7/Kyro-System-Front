import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import './SlideOver.css';

interface SlideOverProps {
    isOpen: boolean;
    onClose: () => void;
    title: string | React.ReactNode;
    children: React.ReactNode;
    width?: string;
}

export const SlideOver: React.FC<SlideOverProps> = ({
    isOpen,
    onClose,
    title,
    children,
    width = '500px',
}) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="slideover-wrapper">
            <div className="slideover-overlay" onClick={onClose} />
            <div className="slideover-panel" style={{ maxWidth: width }}>
                <div className="slideover-header">
                    <div className="slideover-title">
                        {typeof title === 'string' ? <h3>{title}</h3> : title}
                    </div>
                    <button type="button" className="slideover-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>
                <div className="slideover-body">
                    {children}
                </div>
            </div>
        </div>
    );
};
