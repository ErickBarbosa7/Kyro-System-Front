import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { ActionDropdown } from '../ActionDropdown/ActionDropdown';
import { EmptyState } from '../EmptyState/EmptyState';
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
    emptyIcon?: React.ReactNode;
    emptyTitle?: string;
    emptyDescription?: string;
    emptyActionLabel?: string;
    onEmptyAction?: () => void;
    rowClassName?: (item: T) => string;
    onRowClick?: (item: T) => void;
    renderDetailRow?: (item: T) => React.ReactNode;
    defaultSort?: SortConfig | null;
    itemsPerPageOptions?: number[];
}

const getPageNumbers = (currentPage: number, totalPages: number) => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
        pages.push(1);
        if (currentPage > 3) pages.push('ellipsis');

        const start = Math.max(2, currentPage - 1);
        const end = Math.min(totalPages - 1, currentPage + 1);
        for (let i = start; i <= end; i++) pages.push(i);

        if (currentPage < totalPages - 2) pages.push('ellipsis');
        pages.push(totalPages);
    }

    return pages;
};

export const DataTable = <T,>({
    data,
    columns,
    className = '',
    emptyMessage = 'No se encontraron registros.',
    emptyIcon,
    emptyTitle,
    emptyDescription,
    emptyActionLabel,
    onEmptyAction,
    rowClassName,
    onRowClick,
    renderDetailRow,
    defaultSort = null,
    itemsPerPageOptions = [10, 15, 25]
}: DataTableProps<T>) => {

    const [sortConfig, setSortConfig] = useState<SortConfig | null>(defaultSort);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(itemsPerPageOptions[0]);

    const pageOptions = useMemo(() => itemsPerPageOptions.map(n => ({
        id: String(n),
        nombre: `${n} por pág.`
    })), [itemsPerPageOptions]);

    const handleRequestSort = useCallback((column: ColumnConfig<T>) => {
        if (!column.sortable) return;
        let direction: 'asc' | 'desc' = 'desc';
        if (sortConfig && sortConfig.key === column.key && sortConfig.direction === 'desc') {
            direction = 'asc';
        }
        setSortConfig({ key: column.key, direction });
    }, [sortConfig]);

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

    const totalPages = Math.ceil(sortedData.length / itemsPerPage);
    
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return sortedData.slice(start, start + itemsPerPage);
    }, [sortedData, currentPage, itemsPerPage]);

    useEffect(() => { 
        setCurrentPage(1); 
    }, [data]);

    const goToPage = useCallback((page: number) => {
        setCurrentPage(page);
    }, []);

    const goToPrevPage = useCallback(() => {
        setCurrentPage(c => Math.max(1, c - 1));
    }, []);

    const goToNextPage = useCallback(() => {
        setCurrentPage(c => Math.min(totalPages, c + 1));
    }, [totalPages]);

    const handleItemsPerPageChange = useCallback((val: string) => {
        setItemsPerPage(Number(val)); 
        setCurrentPage(1);
    }, []);

    const start = ((currentPage - 1) * itemsPerPage) + 1;
    const end = Math.min(currentPage * itemsPerPage, sortedData.length);

    const renderSortIcon = (column: ColumnConfig<T>) => {
        if (!column.sortable) return null;
        if (!sortConfig || sortConfig.key !== column.key) return <ArrowUpDown size={14} className="sort-icon placeholder" />;
        return sortConfig.direction === 'asc' ? <ArrowUp size={14} className="sort-icon active" /> : <ArrowDown size={14} className="sort-icon active" />;
    };

    const renderPagination = () => {
        if (sortedData.length === 0) return null;

        return (
            <div className="pagination-footer">
                <div className="page-info">
                    Mostrando {start} - {end} de {sortedData.length}
                </div>
                
                <div className="pagination-controls">
                    <ActionDropdown
                        value={String(itemsPerPage)}
                        options={pageOptions}
                        onChange={handleItemsPerPageChange}
                        placeholder="Por página"
                        className="compact"
                        dropUp
                    />
                    
                    {totalPages > 1 && (
                        <>
                            <button 
                                type="button"
                                className="page-btn" 
                                disabled={currentPage === 1} 
                                onClick={goToPrevPage}
                            >
                                <ChevronLeft size={16} />
                            </button>

                            {getPageNumbers(currentPage, totalPages).map((page, idx) =>
                                page === 'ellipsis' ? (
                                    <span key={`e-${idx}`} className="page-ellipsis">...</span>
                                ) : (
                                    <button
                                        type="button"
                                        key={page}
                                        className={`page-num-btn ${currentPage === page ? 'active' : ''}`}
                                        onClick={() => goToPage(page)}
                                    >
                                        {page}
                                    </button>
                                )
                            )}
                            
                            <button 
                                type="button"
                                className="page-btn" 
                                disabled={currentPage === totalPages} 
                                onClick={goToNextPage}
                            >
                                <ChevronRight size={16} />
                            </button>
                        </>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="datatable-container">
            <div className="table-responsive">
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
                                    <tr
                                        className={rowClassName ? rowClassName(item) : ''}
                                        onClick={() => onRowClick?.(item)}
                                        style={{ cursor: onRowClick ? 'pointer' : undefined }}
                                    >
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
                            <tr><td colSpan={columns.length} className="empty-state">
                                <EmptyState
                                    icon={emptyIcon}
                                    title={emptyTitle || emptyMessage}
                                    description={emptyDescription}
                                    actionLabel={emptyActionLabel}
                                    onAction={onEmptyAction}
                                />
                            </td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {renderPagination()}
        </div>
    );
};