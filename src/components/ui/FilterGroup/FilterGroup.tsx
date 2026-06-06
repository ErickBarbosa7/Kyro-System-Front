import React from 'react';
import { ActionDropdown } from '../ActionDropdown/ActionDropdown';
import { FilterX } from 'lucide-react';
import './FilterGroup.css';

export interface FilterConfig {
    name: string;           
    placeholder: string;    
    options: { id: string; nombre: string }[]; 
    width?: string;         
    hideEmptyOption?: boolean; // 👈 NUEVO: Bandera para no inyectar la opción vacía
}

interface FilterGroupProps {
    filters: FilterConfig[];
    values: Record<string, string>;
    onChange: (name: string, value: string) => void;
    onClear: () => void;
}

export const FilterGroup: React.FC<FilterGroupProps> = ({ filters, values, onChange, onClear }) => {
    
    // Verificamos si hay algún filtro activo
    const hasActiveFilters = Object.entries(values).some(([key, val]) => {
        if (key === 'estado') return val !== 'activos'; 
        return val !== '';
    });

    return (
        <div className="filter-group-container">
            {filters.map(filter => {
                // 👈 NUEVO: Solo inyectamos la opción "Todos" si NO se nos pide ocultarla
                const opcionesFinales = filter.hideEmptyOption 
                    ? filter.options 
                    : [
                        { id: '', nombre: filter.placeholder },
                        ...filter.options
                      ];

                return (
                    <div key={filter.name} className="filter-item" style={{ width: filter.width || '180px' }}>
                        <ActionDropdown
                            value={values[filter.name] || ''}
                            options={opcionesFinales}
                            onChange={(val) => onChange(filter.name, val)}
                            placeholder={filter.placeholder}
                        />
                    </div>
                );
            })}

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