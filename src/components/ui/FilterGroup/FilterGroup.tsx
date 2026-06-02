import React from 'react';
import { ActionDropdown } from '../ActionDropdown/ActionDropdown';
import { FilterX } from 'lucide-react';
import './FilterGroup.css';

export interface FilterConfig {
    name: string;           // El nombre en tu estado (ej. 'categoriaId')
    placeholder: string;    // El texto por defecto (ej. 'Todas las Categorías')
    options: { id: string; nombre: string }[]; // La lista de opciones
    width?: string;         // Ancho opcional (ej. '180px')
}

interface FilterGroupProps {
    filters: FilterConfig[];
    values: Record<string, string>;
    onChange: (name: string, value: string) => void;
    onClear: () => void;
}

export const FilterGroup: React.FC<FilterGroupProps> = ({ filters, values, onChange, onClear }) => {
    
    // Verificamos si hay algún filtro activo (diferente de vacío y diferente de 'activos')
    // para decidir si mostramos el botón de limpiar.
    const hasActiveFilters = Object.entries(values).some(([key, val]) => {
        if (key === 'estado') return val !== 'activos'; // 'activos' es el valor por defecto de estado
        return val !== '';
    });

    return (
        <div className="filter-group-container">
            {filters.map(filter => {
                // Inyectamos la opción "Todos" al principio del dropdown
                const optionsWithAll = [
                    { id: '', nombre: filter.placeholder },
                    ...filter.options
                ];

                return (
                    <div key={filter.name} className="filter-item" style={{ width: filter.width || '180px' }}>
                        <ActionDropdown
                            value={values[filter.name] || ''}
                            options={optionsWithAll}
                            onChange={(val) => onChange(filter.name, val)}
                            placeholder={filter.placeholder}
                        />
                    </div>
                );
            })}

            {/* Botón para limpiar filtros, solo aparece si hay filtros aplicados */}
            {hasActiveFilters && (
                <button 
                    className="btn-clear-filters" 
                    onClick={onClear} 
                    title="Limpiar todos los filtros"
                >
                    <FilterX size={18} />
                </button>
            )}
        </div>
    );
};