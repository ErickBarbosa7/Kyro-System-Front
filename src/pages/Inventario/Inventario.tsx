import { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { Package, AlertTriangle, Archive, BarChart3 } from 'lucide-react';
import { FilterGroup } from '../../components/ui/FilterGroup/FilterGroup';
import { DataTable, type ColumnConfig } from '../../components/ui/DataTable/DataTable';
import { Loading } from '../../components/Loading/Loading';
import { obtenerResumenInventario, type ItemInventario } from '../../services/inventario.service';

import './Inventario.css';

export const Inventario = () => {
    const [items, setItems] = useState<ItemInventario[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filtros, setFiltros] = useState({ tipo: '', estado: '' });

    useEffect(() => {
        cargarDatos();
    }, [filtros.tipo]);

    const cargarDatos = async () => {
        setIsLoading(true);
        try {
            const data = await obtenerResumenInventario(filtros.tipo || undefined);
            setItems(data);
        } catch {
            toast.error('Error al cargar el inventario');
        } finally {
            setIsLoading(false);
        }
    };

    const itemsFiltrados = items.filter(item => {
        if (filtros.estado && item.estado !== filtros.estado) return false;
        return true;
    });

    const totalValor = itemsFiltrados.reduce((sum, item) => sum + item.valorInventario, 0);

    const columns: ColumnConfig<ItemInventario>[] = useMemo(() => [
        {
            key: 'nombre',
            label: 'Producto',
            width: '200px',
            sortable: true,
        },
        {
            key: 'tipo',
            label: 'Tipo',
            width: '100px',
            render: (item) => (
                <span className={`badge-tipo badge-tipo--${item.tipo.toLowerCase()}`}>
                    {item.tipo === 'MATERIAL' ? 'Material' : 'Metal'}
                </span>
            ),
        },
        {
            key: 'stockDisponible',
            label: 'Stock Actual',
            width: '120px',
            sortable: true,
            render: (item) => (
                <span className={`stock-valor ${item.estado === 'AGOTADO' ? 'stock-agotado' : item.estado === 'CRITICO' ? 'stock-critico' : item.estado === 'BAJO' ? 'stock-bajo' : ''}`}>
                    {Number(item.stockDisponible).toFixed(2)}
                    <span className="stock-unidad"> {item.unidadMedida?.nombre || 'grs'}</span>
                </span>
            ),
        },
        {
            key: 'stockMinimo',
            label: 'Stock Mínimo',
            width: '110px',
            render: (item) => (
                <span>{Number(item.stockMinimo).toFixed(2)}</span>
            ),
        },
        {
            key: 'estado',
            label: 'Estado',
            width: '120px',
            render: (item) => (
                <span className={`badge-estado badge-estado--${item.estado.toLowerCase()}`}>
                    {item.estado === 'DISPONIBLE' ? 'Disponible' :
                     item.estado === 'BAJO' ? 'Bajo Inventario' :
                     item.estado === 'CRITICO' ? 'Crítico' : 'Agotado'}
                </span>
            ),
        },
        {
            key: 'valorInventario',
            label: 'Valor Inventario',
            width: '140px',
            sortable: true,
            render: (item) => (
                <span className="font-price">${item.valorInventario.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
            ),
        },
    ], []);

    return (
        <div className="module-container">
            <div className="module-header">
                <div className="module-title">
                    <BarChart3 size={28} color="var(--color-primary)" />
                    <h2 style={{ color: 'var(--color-primary)' }}>Control de Inventario</h2>
                </div>
            </div>

            <div className="module-description">
                <p>Resumen general de existencias de materiales y metales. Monitorea niveles de stock y valor del inventario.</p>
            </div>

            <div className="inventario-stats">
                <div className="inv-stat-card">
                    <Package size={22} color="var(--color-primary)" />
                    <div>
                        <span className="inv-stat-value">{items.filter(i => i.tipo === 'MATERIAL').length}</span>
                        <span className="inv-stat-label">Materiales</span>
                    </div>
                </div>
                <div className="inv-stat-card">
                    <Archive size={22} color="var(--color-primary)" />
                    <div>
                        <span className="inv-stat-value">{items.filter(i => i.tipo === 'METAL').length}</span>
                        <span className="inv-stat-label">Metales</span>
                    </div>
                </div>
                <div className="inv-stat-card">
                    <AlertTriangle size={22} color="#d97706" />
                    <div>
                        <span className="inv-stat-value">{items.filter(i => i.estado === 'BAJO' || i.estado === 'CRITICO' || i.estado === 'AGOTADO').length}</span>
                        <span className="inv-stat-label">Con Alertas</span>
                    </div>
                </div>
                <div className="inv-stat-card">
                    <span className="inv-stat-icon" style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-primary)' }}>$</span>
                    <div>
                        <span className="inv-stat-value">${totalValor.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                        <span className="inv-stat-label">Valor Total</span>
                    </div>
                </div>
            </div>

            <div className="toolbar-container">
                <FilterGroup
                    values={filtros}
                    onChange={(name, value) => setFiltros(prev => ({ ...prev, [name]: value }))}
                    onClear={() => setFiltros({ tipo: '', estado: '' })}
                    filters={[
                        {
                            name: 'tipo',
                            placeholder: 'Todos los tipos',
                            options: [
                                { id: 'material', nombre: 'Materiales' },
                                { id: 'metal', nombre: 'Metales' },
                            ],
                        },
                        {
                            name: 'estado',
                            placeholder: 'Todos los estados',
                            options: [
                                { id: 'DISPONIBLE', nombre: 'Disponible' },
                                { id: 'BAJO', nombre: 'Bajo Inventario' },
                                { id: 'CRITICO', nombre: 'Crítico' },
                                { id: 'AGOTADO', nombre: 'Agotado' },
                            ],
                        },
                    ]}
                />
            </div>

            <div className="table-container">
                {isLoading ? (
                    <Loading texto="Cargando inventario..." />
                ) : (
                    <DataTable
                        data={itemsFiltrados}
                        columns={columns}
                        className="inventario-table"
                        emptyMessage="No hay productos en el inventario."
                        defaultSort={{ key: 'nombre', direction: 'asc' }}
                        itemsPerPageOptions={[10, 25, 50]}
                    />
                )}
            </div>
        </div>
    );
};
