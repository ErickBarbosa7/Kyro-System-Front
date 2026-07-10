import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ActionDropdown } from '../ActionDropdown/ActionDropdown';
import { FilterX, SlidersHorizontal } from 'lucide-react';
import './FilterGroup.css';

export interface FilterConfig {
    name: string;
    placeholder: string;
    options: { id: string; nombre: string }[];
    width?: string;
    hideEmptyOption?: boolean;
}

interface FilterGroupProps {
    filters: FilterConfig[];
    values: Record<string, string>;
    onChange: (name: string, value: string) => void;
    onClear: () => void;
    collapsible?: boolean;
}

export const FilterGroup: React.FC<FilterGroupProps> = ({ filters, values, onChange, onClear, collapsible = false }) => {
    const [showAdvanced, setShowAdvanced] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});

    const hasActiveFilters = Object.entries(values).some(([key, val]) => {
        if (key === 'estado') return val !== 'activos';
        return val !== '';
    });

    const hasAdvancedActive = Object.entries(values).some(([key, val]) => {
        if (key === 'estado' && val === 'activos') return false;
        return val !== '';
    });

    const toggleAdvanced = () => {
        if (!showAdvanced && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setPopoverStyle({
                position: 'absolute',
                top: rect.bottom + window.scrollY + 8,
                right: window.innerWidth - rect.right + window.scrollX,
                zIndex: 999999,
            });
        }
        setShowAdvanced(!showAdvanced);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                popoverRef.current &&
                !popoverRef.current.contains(event.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setShowAdvanced(false);
            }
        };

        if (showAdvanced) {
            document.addEventListener('mousedown', handleClickOutside);
            window.addEventListener('scroll', () => setShowAdvanced(false), true);
            window.addEventListener('resize', () => setShowAdvanced(false));
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('scroll', () => setShowAdvanced(false), true);
            window.removeEventListener('resize', () => setShowAdvanced(false));
        };
    }, [showAdvanced]);

    const renderFilters = (className: string) => (
        <div className={className}>
            {filters.map(filter => {
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

    if (collapsible) {
        return (
            <div className="filter-group-collapsible">
                <button
                    ref={buttonRef}
                    className={`btn-advanced-filters ${hasAdvancedActive ? 'has-active' : ''}`}
                    onClick={toggleAdvanced}
                >
                    <SlidersHorizontal size={16} />
                    <span>Filtros avanzados</span>
                    {hasAdvancedActive && <span className="advanced-active-dot" />}
                </button>

                {showAdvanced && createPortal(
                    <div
                        ref={popoverRef}
                        className="filter-group-popover"
                        style={popoverStyle}
                    >
                        {renderFilters('filter-group-popover-inner')}
                    </div>,
                    document.body
                )}
            </div>
        );
    }

    return renderFilters('filter-group-container');
};
