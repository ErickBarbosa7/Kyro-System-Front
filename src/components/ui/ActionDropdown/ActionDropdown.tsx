import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Plus, Pencil, Trash2, Trash, MoreHorizontal, Eye, RefreshCcw } from 'lucide-react';
import './ActionDropdown.css';

interface Option {
    id: string;
    nombre: string;
}

interface ActionDropdownProps {
    value?: string;
    options?: Option[];
    onChange?: (value: string) => void;
    placeholder?: string;
    variant?: 'select' | 'contextual';
    onAdd?: () => void;
    addLabel?: string;
    onEdit?: (id?: string) => void;
    onDelete?: (id?: string, nombre?: string) => void;
    onRecover?: () => void;
    onView?: () => void;
    viewLabel?: string;
    recoverLabel?: string;
    className?: string;
    dropUp?: boolean;
    contextualId?: string;
    contextualName?: string;
}

export const ActionDropdown: React.FC<ActionDropdownProps> = ({
    value = '',
    options = [],
    onChange,
    placeholder = 'Selecciona...',
    variant = 'select',
    onAdd,
    addLabel = 'Crear nuevo',
    onEdit,
    onDelete,
    onRecover,
    onView,
    viewLabel = 'Ver detalle',
    recoverLabel = 'Papelera',
    className = '',
    dropUp = false,
    contextualId,
    contextualName,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});

    const toggleMenu = (e?: React.MouseEvent) => {
        e?.stopPropagation();
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
                    right: window.innerWidth - rect.right + window.scrollX,
                    width: 'auto',
                    minWidth: '160px',
                    zIndex: 999999
                });
            }
        }
        setIsOpen(!isOpen);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                const menuEl = document.querySelector('.dropdown-menu-portal');
                if (menuEl && menuEl.contains(event.target as Node)) return;
                setIsOpen(false);
            }
        };

        const handleScroll = (event: Event) => {
            const menuEl = document.querySelector('.dropdown-menu-portal');
            if (menuEl && (event.target === menuEl || menuEl.contains(event.target as Node))) {
                return;
            }
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

    const hasActions = onEdit || onDelete || onView || onRecover;

    if (variant === 'contextual') {
        return (
            <div className={`custom-dropdown contextual-dropdown ${className}`} ref={dropdownRef}>
                <button
                    type="button"
                    className="contextual-trigger"
                    onClick={toggleMenu}
                    aria-expanded={isOpen}
                    title="Acciones"
                >
                    <MoreHorizontal size={18} />
                </button>

                {isOpen && hasActions && createPortal(
                    <div className="dropdown-menu dropdown-menu-portal contextual-menu" style={{ ...menuStyle, ...menuColors }}>
                        {onView && (
                            <button
                                type="button"
                                className="dropdown-action-item"
                                onClick={() => { setIsOpen(false); onView(); }}
                            >
                                <Eye size={16} />
                                {viewLabel}
                            </button>
                        )}
                        {onEdit && (
                            <button
                                type="button"
                                className="dropdown-action-item"
                                onClick={() => { setIsOpen(false); onEdit(contextualId); }}
                            >
                                <Pencil size={16} />
                                Editar
                            </button>
                        )}
                        {onRecover && (
                            <button
                                type="button"
                                className="dropdown-action-item"
                                onClick={() => { setIsOpen(false); onRecover(); }}
                            >
                                <RefreshCcw size={16} />
                                {recoverLabel}
                            </button>
                        )}
                        {onDelete && (
                            <>
                                {(onView || onEdit || onRecover) && <div className="dropdown-divider" />}
                                <button
                                    type="button"
                                    className="dropdown-action-item danger"
                                    onClick={() => { setIsOpen(false); onDelete(contextualId, contextualName); }}
                                >
                                    <Trash2 size={16} />
                                    Eliminar
                                </button>
                            </>
                        )}
                    </div>,
                    document.body
                )}
            </div>
        );
    }

    return (
        <div className={`custom-dropdown ${className}`} ref={dropdownRef}>
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

            {isOpen && createPortal(
                <div className="dropdown-menu dropdown-menu-portal" style={{ ...menuStyle, ...menuColors }}>
                    {options.map(opt => (
                        <div
                            key={opt.id}
                            className={`dropdown-item ${value === opt.id ? 'selected' : ''}`}
                            onClick={() => {
                                onChange?.(opt.id);
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
