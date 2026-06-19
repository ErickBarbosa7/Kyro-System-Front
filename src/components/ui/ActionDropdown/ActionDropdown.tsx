import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Plus, Pencil, Trash2, Trash } from 'lucide-react';
import './ActionDropdown.css';

interface Option {
    id: string;
    nombre: string;
}

interface ActionDropdownProps {
    value: string;
    options: Option[];
    onChange: (value: string) => void;
    placeholder?: string;
    onAdd?: () => void;
    addLabel?: string;
    onEdit?: (id: string) => void;
    onDelete?: (id: string, nombre: string) => void;
    onRecover?: () => void;
    recoverLabel?: string;
    className?: string;
    dropUp?: boolean;
}

export const ActionDropdown: React.FC<ActionDropdownProps> = ({
    value,
    options,
    onChange,
    placeholder = 'Selecciona...',
    onAdd,
    addLabel = 'Crear nuevo',
    onEdit,
    onDelete,
    onRecover,
    recoverLabel = 'Papelera',
    className = '',
    dropUp = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});

    const toggleMenu = () => {
        if (!isOpen && dropdownRef.current) {
            const rect = dropdownRef.current.getBoundingClientRect();
            if (dropUp) {
                setMenuStyle({
                    position: 'absolute',
                    bottom: window.innerHeight - rect.top + 8,
                    left: rect.left + window.scrollX,
                    width: rect.width,
                    zIndex: 999999
                });
            } else {
                setMenuStyle({
                    position: 'absolute',
                    top: rect.bottom + window.scrollY + 8,
                    left: rect.left + window.scrollX,
                    width: rect.width,
                    zIndex: 999999
                });
            }
        }
        setIsOpen(!isOpen);
    };

    
    // Cerrar al hacer click fuera o al hacer scroll (para que no quede flotando raro)
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                // Truco: también checar que el clic no sea dentro del portal
                const menuEl = document.querySelector('.dropdown-menu-portal');
                if (menuEl && menuEl.contains(event.target as Node)) return;
                setIsOpen(false);
            }
        };

        const handleScroll = (event: Event) => {
            const menuEl = document.querySelector('.dropdown-menu-portal');
            // Si el elemento que está haciendo scroll es el menú mismo o algo adentro de él, lo ignoramos
            if (menuEl && (event.target === menuEl || menuEl.contains(event.target as Node))) {
                return; 
            }
            // Si el scroll es en la tabla, el modal o la página de fondo, lo cerramos
            setIsOpen(false);
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            window.addEventListener('scroll', handleScroll, true); 
            window.addEventListener('resize', () => setIsOpen(false));
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('scroll', handleScroll, true);
            window.removeEventListener('resize', () => setIsOpen(false));
        };
    }, [isOpen]);

    
    const selectedOption = options.find(opt => opt.id === value);

    const triggerStyle = { backgroundColor: 'var(--color-background)', color: 'var(--color-text)' };
    const menuColors = { backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' };

    return (
        <div className={`custom-dropdown ${className}`} ref={dropdownRef}>
            {/* DISPARADOR BLINDADO */}
            <div 
                className="dropdown-trigger" 
                onClick={toggleMenu}
                aria-expanded={isOpen}
                style={triggerStyle}
            >
                {selectedOption ? (
                    <span>{selectedOption.nombre}</span>
                ) : (
                    <span className="dropdown-placeholder" style={{ color: 'var(--color-text-secondary)', opacity: 0.8 }}>
                        {placeholder}
                    </span>
                )}
                <ChevronDown size={18} color="var(--color-text-secondary)" />
            </div>

            {/* MENÚ DESPLEGABLE EN PORTAL */}
            {isOpen && createPortal(
                <div className="dropdown-menu dropdown-menu-portal" style={{ ...menuStyle, ...menuColors }}>
                    
                    {options.map(opt => (
                        <div 
                            key={opt.id} 
                            className={`dropdown-item ${value === opt.id ? 'selected' : ''}`}
                            onClick={() => {
                                onChange(opt.id);
                                setIsOpen(false);
                            }}
                            style={{ color: 'var(--color-text)' }}
                        >
                            <span className="dropdown-item-text">{opt.nombre}</span>
                            
                            <div className="item-actions">
                                {onEdit && (
                                    <button 
                                        type="button" 
                                        className="item-btn edit" 
                                        onClick={(e) => {
                                            e.stopPropagation(); 
                                            setIsOpen(false);
                                            onEdit(opt.id);
                                        }}
                                        title="Editar"
                                    >
                                        <Pencil size={14} />
                                    </button>
                                )}
                                {onDelete && (
                                    <button 
                                        type="button" 
                                        className="item-btn delete" 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsOpen(false);
                                            onDelete(opt.id, opt.nombre);
                                        }}
                                        title="Eliminar"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}

                    {options.length === 0 && (
                        <div style={{ padding: '10px', textAlign: 'center', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                            No hay opciones disponibles
                        </div>
                    )}

                    {(onAdd || onRecover) && <div className="dropdown-divider" style={{ backgroundColor: 'var(--color-border)' }}></div>}

                    {onAdd && (
                        <button 
                            type="button" 
                            className="dropdown-action-btn add"
                            onClick={() => {
                                setIsOpen(false);
                                onAdd();
                            }}
                            style={{ color: 'var(--color-primary)' }}
                        >
                            <Plus size={16} strokeWidth={2.5} />
                            {addLabel}
                        </button>
                    )}

                    {onRecover && (
                        <button 
                            type="button" 
                            className="dropdown-action-btn recover"
                            onClick={() => {
                                setIsOpen(false);
                                onRecover();
                            }}
                            style={{ color: 'var(--color-text-secondary)' }}
                        >
                            <Trash size={16} strokeWidth={2.5} />
                            {recoverLabel}
                        </button>
                    )}
                </div>,
                document.body
            )}
        </div>
    );
};