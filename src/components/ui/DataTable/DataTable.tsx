import React, { useState, useMemo } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import './DataTable.css';
 
// Interfaz para controlar el estado del ordenamiento
export interface SortConfig {
    key: string;
    direction: 'asc' | 'desc';
}

// Configuración de las columnas
export type ColumnConfig<T> = {
    key: string;
    label: string;
    sortable?: boolean;
    width?: string;
    align?: 'left' | 'center' | 'right';
    render?: (item: T) => React.ReactNode;
    getSortValue?: (item: T) => string | number | boolean | null | undefined; 
};

// Props del componente DataTable
interface DataTableProps<T> {
    data: T[];
    columns: ColumnConfig<T>[];
    className?: string;
    emptyMessage?: string;
    rowClassName?: (item: T) => string;
    renderDetailRow?: (item: T) => React.ReactNode;
    defaultSort?: SortConfig | null;
}

export const DataTable = <T,>({
    data,
    columns,
    className = '',
    emptyMessage = 'No se encontraron registros.',
    rowClassName,
    renderDetailRow,
    defaultSort = null
}: DataTableProps<T>) => {
    
    const [sortConfig, setSortConfig] = useState<SortConfig | null>(defaultSort);

    const handleRequestSort = (column: ColumnConfig<T>) => {
        if (!column.sortable) return;
        
        // 🛠️ SOLUCIÓN: Cambiamos el valor por defecto a 'desc' (flecha hacia abajo)
        // para que el primer clic en cualquier columna nueva aplique este orden de inmediato.
        let direction: 'asc' | 'desc' = 'desc';
        
        // Si el usuario hace clic en la columna que YA estaba seleccionada,
        // e inversamente ya estaba en 'desc', entonces lo cambiamos a 'asc'.
        if (sortConfig && sortConfig.key === column.key && sortConfig.direction === 'desc') {
            direction = 'asc';
        }
        
        setSortConfig({ key: column.key, direction });
    };

    const sortedData = useMemo(() => {
        if (!sortConfig) return data;

        const activeColumn = columns.find(col => col.key === sortConfig.key);
        if (!activeColumn) return data;

        return [...data].sort((a, b) => {
            let aVal = activeColumn.getSortValue ? activeColumn.getSortValue(a) : (a as any)[sortConfig.key];
            let bVal = activeColumn.getSortValue ? activeColumn.getSortValue(b) : (b as any)[sortConfig.key];

            if (aVal === undefined || aVal === null) aVal = '';
            if (bVal === undefined || bVal === null) bVal = '';

            if (typeof aVal === 'string') {
                return sortConfig.direction === 'asc'
                    ? aVal.localeCompare(bVal)
                    : bVal.localeCompare(aVal);
            }

            return sortConfig.direction === 'asc' 
                ? (aVal as number) - (bVal as number) 
                : (bVal as number) - (aVal as number);
        });
    }, [data, sortConfig, columns]);

    const renderSortIcon = (column: ColumnConfig<T>) => {
        if (!column.sortable) return null;
        if (!sortConfig || sortConfig.key !== column.key) {
            return <ArrowUpDown size={14} className="sort-icon placeholder" />;
        }
        return sortConfig.direction === 'asc'
            ? <ArrowUp size={14} className="sort-icon active" />
            : <ArrowDown size={14} className="sort-icon active" />;
    };

    if (sortedData.length === 0) {
        return <div className="empty-state">{emptyMessage}</div>;
    }

    return (
        <table className={`kyro-table ${className}`}>
            <thead>
                <tr>
                    {columns.map((col) => {
                        const isCenter = col.align === 'center';
                        const thClass = col.sortable ? 'th-sortable' : '';
                        
                        return (
                            <th
                                key={col.key}
                                style={{ width: col.width }}
                                className={thClass}
                                onClick={() => handleRequestSort(col)}
                            >
                                <div className={`th-sortable-content ${isCenter ? 'center' : ''}`}>
                                    {col.label}
                                    {renderSortIcon(col)}
                                </div>
                            </th>
                        );
                    })}
                </tr>
            </thead>
            <tbody>
                {sortedData.map((item, index) => {
                    const customRowClass = rowClassName ? rowClassName(item) : '';
                    const itemId = (item as any).id || index;

                    return (
                        <React.Fragment key={itemId}>
                            <tr className={customRowClass}>
                                {columns.map((col) => {
                                    const textAlign = col.align || 'left';
                                    return (
                                        <td key={col.key} style={{ textAlign }}>
                                            {col.render ? col.render(item) : String((item as any)[col.key] || '')}
                                        </td>
                                    );
                                })}
                            </tr>
                            {renderDetailRow && renderDetailRow(item)}
                        </React.Fragment>
                    );
                })}
            </tbody>
        </table>
    );
};