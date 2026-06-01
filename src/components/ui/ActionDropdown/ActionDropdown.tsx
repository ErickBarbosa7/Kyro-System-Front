import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus, Pencil, Trash2, RefreshCcw } from 'lucide-react';
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
    
    // Funciones opcionales para habilitar los botones
    onAdd?: () => void;
    addLabel?: string;
    
    onEdit?: (id: string) => void;
    onDelete?: (id: string, nombre: string) => void;
    
    onRecover?: () => void;
    recoverLabel?: string;
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
    recoverLabel = 'Papelera'
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Cierra el menú al hacer clic fuera del componente
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => opt.id === value);

    return (
        <div className="custom-dropdown" ref={dropdownRef}>
            {/* DISPARADOR (El botón principal que muestra lo seleccionado) */}
            <div 
                className="dropdown-trigger" 
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
            >
                {selectedOption ? (
                    <span>{selectedOption.nombre}</span>
                ) : (
                    <span className="dropdown-placeholder">{placeholder}</span>
                )}
                <ChevronDown size={18} color="var(--color-text-secondary)" />
            </div>

            {/* MENÚ DESPLEGABLE */}
            {isOpen && (
                <div className="dropdown-menu">
                    
                    {/* Lista de opciones iteradas */}
                    {options.map(opt => (
                        <div 
                            key={opt.id} 
                            className={`dropdown-item ${value === opt.id ? 'selected' : ''}`}
                            onClick={() => {
                                onChange(opt.id);
                                setIsOpen(false);
                            }}
                        >
                            <span className="dropdown-item-text">{opt.nombre}</span>
                            
                            {/* Acciones de Editar y Eliminar (Solo aparecen en hover por CSS) */}
                            <div className="item-actions">
                                {onEdit && (
                                    <button 
                                        type="button" 
                                        className="item-btn edit" 
                                        onClick={(e) => {
                                            e.stopPropagation(); // Evita que se seleccione la opción
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

                    {/* Mensaje si no hay opciones activas */}
                    {options.length === 0 && (
                        <div style={{ padding: '10px', textAlign: 'center', fontSize: '13px', color: '#94a3b8' }}>
                            No hay opciones disponibles
                        </div>
                    )}

                    {/* LÍNEA DIVISORA SI HAY BOTONES EXTRA */}
                    {(onAdd || onRecover) && <div className="dropdown-divider"></div>}

                    {/* BOTÓN: CREAR  */}
                    {onAdd && (
                        <button 
                            type="button" 
                            className="dropdown-action-btn add"
                            onClick={() => {
                                setIsOpen(false);
                                onAdd();
                            }}
                        >
                            <Plus size={16} strokeWidth={2.5} />
                            {addLabel}
                        </button>
                    )}

                    {/* BOTÓN: RECUPERAR / PAPELERA */}
                    {onRecover && (
                        <button 
                            type="button" 
                            className="dropdown-action-btn recover"
                            onClick={() => {
                                setIsOpen(false);
                                onRecover();
                            }}
                        >
                            <RefreshCcw size={14} strokeWidth={2.5} />
                            {recoverLabel}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};