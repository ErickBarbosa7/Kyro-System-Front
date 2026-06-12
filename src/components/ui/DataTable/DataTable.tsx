import React, { useState, useMemo } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { ActionDropdown } from '../ActionDropdown/ActionDropdown';
import './DataTable.css';

export interface SortConfig {
    key: string;
    direction: 'asc' | 'desc';
}

export type ColumnConfig<T> = {
    key: string;
    label: string;
    sortable?: boolean;
    width?: string;
    align?: 'left' | 'center' | 'right';
    render?: (item: T) => React.ReactNode;
    getSortValue?: (item: T) => string | number | boolean | null | undefined; 
};

interface DataTableProps<T> {
    data: T[];
    columns: ColumnConfig<T>[];
    className?: string;
    emptyMessage?: string;
    rowClassName?: (item: T) => string;
    renderDetailRow?: (item: T) => React.ReactNode;
    defaultSort?: SortConfig | null;
    itemsPerPageOptions?: number[]; // Nueva opción para configurar la paginación
}



export const DataTable = <T,>({
    data,
    columns,
    className = '',
    emptyMessage = 'No se encontraron registros.',
    rowClassName,
    renderDetailRow,
    defaultSort = null,
    itemsPerPageOptions = [10, 20, 50]
}: DataTableProps<T>) => {

    itemsPerPageOptions = [10, 15, 25]

    // Estados de ordenamiento y paginación
    const [sortConfig, setSortConfig] = useState<SortConfig | null>(defaultSort);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(itemsPerPageOptions[0]);

    // Convierte las opciones al formato que espera ActionDropdown:
    const pageOptions = itemsPerPageOptions.map(n => ({
        id: String(n),
        nombre: `${n} por pág.`
    }));
    // Lógica de ordenamiento (igual que antes)
    const handleRequestSort = (column: ColumnConfig<T>) => {
        if (!column.sortable) return;
        let direction: 'asc' | 'desc' = 'desc';
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
            if (aVal == null) aVal = '';
            if (bVal == null) bVal = '';

            if (typeof aVal === 'string') {
                return sortConfig.direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
            }
            return sortConfig.direction === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
        });
    }, [data, sortConfig, columns]);

    // Lógica de Paginación
    const totalPages = Math.ceil(sortedData.length / itemsPerPage);
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return sortedData.slice(start, start + itemsPerPage);
    }, [sortedData, currentPage, itemsPerPage]);

    // Resetear a página 1 si cambian los datos
    React.useEffect(() => { setCurrentPage(1); }, [data]);

    const renderSortIcon = (column: ColumnConfig<T>) => {
        if (!column.sortable) return null;
        if (!sortConfig || sortConfig.key !== column.key) return <ArrowUpDown size={14} className="sort-icon placeholder" />;
        return sortConfig.direction === 'asc' ? <ArrowUp size={14} className="sort-icon active" /> : <ArrowDown size={14} className="sort-icon active" />;
    };

    return (
        <div className="datatable-container">
            <table className={`kyro-table ${className}`}>
                <thead>
                    <tr>
                        {columns.map((col) => (
                            <th key={col.key} style={{ width: col.width }} className={col.sortable ? 'th-sortable' : ''} onClick={() => handleRequestSort(col)}>
                                <div className={`th-sortable-content ${col.align === 'center' ? 'center' : ''}`}>
                                    {col.label} {renderSortIcon(col)}
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {paginatedData.length > 0 ? (
                        paginatedData.map((item, index) => (
                            <React.Fragment key={(item as any).id || index}>
                                <tr className={rowClassName ? rowClassName(item) : ''}>
                                    {columns.map((col) => (
                                        <td key={col.key} style={{ textAlign: col.align || 'left' }}>
                                            {col.render ? col.render(item) : String((item as any)[col.key] || '')}
                                        </td>
                                    ))}
                                </tr>
                                {renderDetailRow && renderDetailRow(item)}
                            </React.Fragment>
                        ))
                    ) : (
                        <tr><td colSpan={columns.length} className="empty-state">{emptyMessage}</td></tr>
                    )}
                </tbody>
            </table>

            {/* Footer de Paginación */}
            {sortedData.length > 0 && (
                <div className="pagination-footer">
                    <div className="page-info">
                        Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, sortedData.length)} de {sortedData.length}
                    </div>
                    <div className="pagination-controls">
                        <ActionDropdown
                            value={String(itemsPerPage)}
                            options={pageOptions}
                            onChange={(val) => { setItemsPerPage(Number(val)); setCurrentPage(1); }}
                            placeholder="Por página"
                            className="compact"   // ← agregar className al prop de ActionDropdown
                        />
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(c => c - 1)}><ChevronLeft size={18} /></button>
                        <span>{currentPage} / {totalPages}</span>
                        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(c => c + 1)}><ChevronRight size={18} /></button>
                    </div>
                </div>
            )}
        </div>
    );
};