import React from 'react';
import { ActionDropdown } from '../ActionDropdown/ActionDropdown';

interface FilterSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
}

export const FilterSelect: React.FC<FilterSelectProps> = ({ value, onChange, options }) => {
    
    // 1. Convertimos las opciones al formato que necesita tu ActionDropdown
    const dropdownOptions = options.map(opt => ({
        id: opt.value,
        nombre: opt.label
    }));

    return (
        // 2. Lo envolvemos en un div para controlar su ancho en la cabecera 
        //    (para que no ocupe el 100% de la pantalla)
        <div className="filter-select-wrapper" style={{ width: '180px' }}>
            <ActionDropdown
                value={value}
                options={dropdownOptions}
                onChange={onChange}
                placeholder="Filtrar por..."
            />
        </div>
    );
};