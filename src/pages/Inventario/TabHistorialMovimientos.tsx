import { useMemo } from 'react';
import { SearchBar } from '../../components/ui/SearchBar/SearchBar';
import { FilterGroup } from '../../components/ui/FilterGroup/FilterGroup';
import { DataTable, type ColumnConfig } from '../../components/ui/DataTable/DataTable';
import { Loading } from '../../components/Loading/Loading';
import type { MovimientoData } from '../../services/stock.service';
import './Inventario.css';

interface MovimientoStock {
    id: string;
    tipoProducto: string;
    productoId: string;
    nombreProducto: string;
    tipo: 'entrada' | 'salida' | 'ajuste' | 'merma';
    cantidad: number;
    motivo: string;
    fecha: string;
    usuario: string;
}

interface TabHistorialMovimientosProps {
    movimientos: MovimientoStock[];
    isLoading: boolean;
    searchTerm: string;
    onSearchChange: (value: string) => void;
    filtros: Record<string, string>;
    onFilterChange: (name: string, value: string) => void;
    onFilterClear: () => void;
}

export const TabHistorialMovimientos: React.FC<TabHistorialMovimientosProps> = ({
    movimientos,
    isLoading,
    searchTerm,
    onSearchChange,
    filtros,
    onFilterChange,
    onFilterClear,
}) => {
    const movimientosFiltrados = movimientos.filter(mov => {
        const busqueda = searchTerm.toLowerCase();
        const matchSearch = mov.nombreProducto.toLowerCase().includes(busqueda) ||
                            mov.motivo.toLowerCase().includes(busqueda);
        const matchTipo = !filtros.tipo || mov.tipo === filtros.tipo;
        return matchSearch && matchTipo;
    });

    const columns: ColumnConfig<MovimientoStock>[] = useMemo(() => [
        {
            key: 'fecha',
            label: 'Fecha',
            width: '140px',
            sortable: true,
            render: (mov) => new Date(mov.fecha).toLocaleDateString('es-MX'),
        },
        {
            key: 'nombreProducto',
            label: 'Producto',
            width: '200px',
            sortable: true,
        },
        {
            key: 'tipo',
            label: 'Tipo',
            width: '110px',
            render: (mov) => (
                <span className={`mov-tipo mov-tipo--${mov.tipo}`}>
                    {mov.tipo === 'entrada' ? 'Entrada' : mov.tipo === 'salida' ? 'Salida' : mov.tipo === 'merma' ? 'Merma' : 'Ajuste'}
                </span>
            ),
        },
        {
            key: 'cantidad',
            label: 'Cantidad',
            width: '110px',
            sortable: true,
            render: (mov) => (
                <span className={`mov-cantidad mov-cantidad--${mov.tipo}`}>
                    {mov.tipo === 'entrada' ? '+' : mov.tipo === 'salida' ? '-' : ''}{mov.cantidad}
                </span>
            ),
        },
        {
            key: 'motivo',
            label: 'Motivo',
            width: '160px',
        },
        {
            key: 'usuario',
            label: 'Usuario',
            width: '160px',
        },
    ], []);

    return (
        <div className="tab-content">
            <div className="toolbar-container">
                <div className="search-wrapper">
                    <SearchBar
                        placeholder="Buscar por material o referencia..."
                        value={searchTerm}
                        onChange={onSearchChange}
                    />
                </div>
                <FilterGroup
                    values={filtros}
                    onChange={onFilterChange}
                    onClear={onFilterClear}
                    filters={[
                        {
                            name: 'tipo',
                            placeholder: 'Todos los movimientos',
                            options: [
                                { id: 'entrada', nombre: 'Entradas' },
                                { id: 'salida', nombre: 'Salidas' },
                                { id: 'ajuste', nombre: 'Ajustes' },
                                { id: 'merma', nombre: 'Mermas' },
                            ],
                        },
                    ]}
                />
            </div>

            <div className="table-container">
                {isLoading ? (
                    <Loading texto="Cargando movimientos..." />
                ) : (
                    <DataTable
                        data={movimientosFiltrados}
                        columns={columns}
                        className="stock-table"
                        emptyMessage={
                            searchTerm
                                ? `No se encontraron resultados para "${searchTerm}"`
                                : 'No hay movimientos de stock registrados.'
                        }
                        defaultSort={{ key: 'fecha', direction: 'desc' }}
                        itemsPerPageOptions={[10, 25, 50]}
                    />
                )}
            </div>
        </div>
    );
};
