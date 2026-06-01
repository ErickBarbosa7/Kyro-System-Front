type Column<T> = {
    header: string;
    accessor: (row: T) => React.ReactNode;
    width?: string;
    align?: 'left' | 'center' | 'right';
};

type DataTableProps<T> = {
    data: T[];
    columns: Column<T>[];
    loading?: boolean;
    emptyText?: string;

    onRowClick?: (row: T) => void;
};

export function DataTable<T>({
    data,
    columns,
    loading,
    emptyText = 'Sin datos',
    onRowClick
}: DataTableProps<T>) {
    if (loading) return <div>Cargando...</div>;

    if (!data.length) return <div>{emptyText}</div>;

    return (
        <table className="kyro-table">
            <thead>
                <tr>
                    {columns.map((col, i) => (
                        <th
                            key={i}
                            style={{ width: col.width, textAlign: col.align }}
                        >
                            {col.header}
                        </th>
                    ))}
                </tr>
            </thead>

            <tbody>
                {data.map((row, i) => (
                    <tr
                        key={i}
                        onClick={() => onRowClick?.(row)}
                        style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                    >
                        {columns.map((col, j) => (
                            <td key={j} style={{ textAlign: col.align }}>
                                {col.accessor(row)}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
}