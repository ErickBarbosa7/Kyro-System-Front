import { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Pencil, Trash2, Gem, RefreshCcw, LayoutGrid, List, Image as ImageIcon } from 'lucide-react';
import { SearchBar } from '../../components/ui/SearchBar/SearchBar';
import { ConfirmModal } from '../../components/ConfirmModal';
import { FilterGroup } from '../../components/ui/FilterGroup/FilterGroup';
import { DataTable, type ColumnConfig } from '../../components/ui/DataTable/DataTable';
import { Loading } from '../../components/Loading/Loading';
import { obtenerPiezas, eliminarPieza, reactivarPieza } from '../../services/piezas.service';
import { PiezaCard } from './components/PiezaCard';
import { PiezaSlideOver } from './components/PiezaSlideOver';
import { PiezaCreator } from './components/PiezaCreator';
import type { PiezaSummary } from './types';
import './Piezas.css';

interface Pieza extends PiezaSummary {
    tipo?: { nombre: string };
    coleccion?: { nombre: string };
}

export const Piezas = () => {
    const [piezas, setPiezas] = useState<Pieza[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filtros, setFiltros] = useState({ estado: 'activos' });
    const [vista, setVista] = useState<'lista' | 'creador' | 'slideover'>('lista');
    const [selectedPiezaId, setSelectedPiezaId] = useState<string | null>(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [itemAEliminar, setItemAEliminar] = useState<{ id: string; nombre: string } | null>(null);
    const [verGrid, setVerGrid] = useState(true);

    useEffect(() => {
        cargarDatos();
    }, [filtros.estado]);

    const cargarDatos = async () => {
        setIsLoading(true);
        try {
            const piezasData = await obtenerPiezas(filtros.estado);
            setPiezas(piezasData);
        } catch (error) {
            toast.error('Error al cargar los datos de piezas');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteClick = (id: string, nombre: string) => {
        setItemAEliminar({ id, nombre });
        setIsConfirmOpen(true);
    };

    const ejecutarEliminacion = async () => {
        if (!itemAEliminar) return;
        const loadingToast = toast.loading('Descontinuando pieza...');
        try {
            await eliminarPieza(itemAEliminar.id);
            toast.success('Pieza descontinuada', { id: loadingToast });
            setIsConfirmOpen(false);
            setItemAEliminar(null);
            cargarDatos();
        } catch (error) {
            toast.error('Error al eliminar la pieza', { id: loadingToast });
        }
    };

    const handleReactivar = async (id: string) => {
        const loadingToast = toast.loading('Reactivando pieza...');
        try {
            await reactivarPieza(id);
            toast.success('Pieza reactivada', { id: loadingToast });
            cargarDatos();
        } catch (error) {
            toast.error('Error al reactivar la pieza', { id: loadingToast });
        }
    };

    const piezasFiltradas = piezas.filter(p => {
        const busqueda = searchTerm.toLowerCase();
        return (
            p.clave.toLowerCase().includes(busqueda) ||
            p.nombreComercial.toLowerCase().includes(busqueda) ||
            (p.tipo?.nombre && p.tipo.nombre.toLowerCase().includes(busqueda)) ||
            (p.coleccion?.nombre && p.coleccion.nombre.toLowerCase().includes(busqueda))
        );
    });

    const columns: ColumnConfig<Pieza>[] = useMemo(() => [
        {
            key: 'imagenUrl',
            label: '',
            width: '60px',
            render: (p: Pieza) => (
                p.imagenUrl ? (
                    <img src={p.imagenUrl} alt="" className="table-thumb" />
                ) : (
                    <div className="table-thumb-placeholder">
                        <ImageIcon size={16} color="var(--color-border)" />
                    </div>
                )
            ),
        },
        {
            key: 'clave',
            label: 'Clave',
            width: '130px',
            sortable: true,
            render: (p: Pieza) => (
                <span style={{ color: 'var(--color-primary)', fontWeight: 600, letterSpacing: '0.5px' }}>
                    {p.clave}
                </span>
            ),
        },
        {
            key: 'nombreComercial',
            label: 'Nombre Comercial',
            width: '220px',
            sortable: true,
            render: (p: Pieza) => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span className="font-medium">{p.nombreComercial}</span>
                    {p.estado === 'DESCONTINUADO' && <span className="badge-eliminado">Descontinuado</span>}
                    {p.estado === 'BORRADOR' && <span className="badge-borrador">Borrador</span>}
                </div>
            ),
        },
        {
            key: 'tipo',
            label: 'Tipo',
            width: '140px',
            sortable: true,
            getSortValue: (p: Pieza) => p.tipo?.nombre || '',
            render: (p: Pieza) => (
                <span className="text-muted">{p.tipo?.nombre || '—'}</span>
            ),
        },
        {
            key: 'coleccion',
            label: 'Colección',
            width: '160px',
            sortable: true,
            getSortValue: (p: Pieza) => p.coleccion?.nombre || '',
            render: (p: Pieza) => (
                <span className="text-muted">{p.coleccion?.nombre || '—'}</span>
            ),
        },
        {
            key: 'fechaCreacion',
            label: 'Fecha de Creación',
            width: '150px',
            sortable: true,
            render: (p: Pieza) => (
                <span className="text-muted">
                    {new Date(p.fechaCreacion).toLocaleDateString('es-MX')}
                </span>
            ),
        },
        {
            key: 'acciones',
            label: 'Acciones',
            width: '120px',
            align: 'center',
            render: (p: Pieza) => (
                <div className="actions-cell" onClick={(e) => e.stopPropagation()}>
                    <button className="btn-icon edit" onClick={() => { setSelectedPiezaId(p.id); setVista('creador'); }} title="Editar">
                        <Pencil size={18} />
                    </button>
                    {p.estado === 'DESCONTINUADO' ? (
                        <button className="btn-icon reactivate" onClick={() => handleReactivar(p.id)} title="Reactivar">
                            <RefreshCcw size={18} />
                        </button>
                    ) : (
                        <button className="btn-icon delete" onClick={() => handleDeleteClick(p.id, p.nombreComercial)} title="Descontinuar">
                            <Trash2 size={18} />
                        </button>
                    )}
                </div>
            ),
        },
    ], []);

    return (
        <>
            <div className="module-container">
                {vista === 'creador' ? (
                    <PiezaCreator
                        isOpen={true}
                        piezaId={selectedPiezaId}
                        onClose={() => { setSelectedPiezaId(null); setVista('lista'); }}
                        onSaved={() => { cargarDatos(); setVista('lista'); }}
                    />
                ) : (
                    <>
                <div className="module-header">
                    <div className="module-title">
                        <Gem size={28} color="var(--color-primary)" />
                        <h2 style={{ color: 'var(--color-primary)' }}>Catálogo de Piezas</h2>
                    </div>
                    <button className="btn-primary" onClick={() => { setSelectedPiezaId(null); setVista('creador'); }}>
                        <Plus size={20} /> Nueva Pieza
                    </button>
                </div>

                <div className="module-description">
                    <p>Administra las piezas de joyería: diseños, variantes y recetas de costeo.</p>
                </div>

                <div className="toolbar-container">
                    <div className="search-wrapper">
                        <SearchBar
                            placeholder="Buscar por clave, nombre, tipo o colección..."
                            value={searchTerm}
                            onChange={setSearchTerm}
                        />
                    </div>
                    <FilterGroup
                        values={filtros}
                        onChange={(name, value) => setFiltros(prev => ({ ...prev, [name]: value }))}
                        onClear={() => {
                            setFiltros({ estado: 'activos' });
                            setSearchTerm('');
                        }}
                        filters={[
                            {
                                name: 'estado',
                                placeholder: 'Ver Activos',
                                hideEmptyOption: true,
                                options: [
                                    { id: 'activos', nombre: 'Ver Activos' },
                                    { id: 'inactivos', nombre: 'Descontinuadas' },
                                    { id: 'todos', nombre: 'Ver Todos' },
                                ],
                            },
                        ]}
                    />
                    <button className="view-toggle" onClick={() => setVerGrid(prev => !prev)}>
                        {verGrid ? <><List size={16} /> Tabla</> : <><LayoutGrid size={16} /> Grid</>}
                    </button>
                </div>

                {isLoading ? (
                    <Loading texto="Cargando piezas..." />
                ) : verGrid ? (
                    <div className="piezas-grid">
                        {piezasFiltradas.length === 0 ? (
                            <div className="empty-message" style={{ gridColumn: '1 / -1', padding: '40px 0', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                                {searchTerm ? `No se encontraron resultados para "${searchTerm}"` : 'No hay piezas registradas.'}
                            </div>
                        ) : (
                            piezasFiltradas.map(pieza => (
                                <PiezaCard
                                    key={pieza.id}
                                    pieza={pieza}
                                    onSelect={(p) => { setSelectedPiezaId(p.id); setVista('slideover'); }}
                                    onEdit={(id) => { setSelectedPiezaId(id); setVista('creador'); }}
                                    onDelete={(id, nombre) => handleDeleteClick(id, nombre)}
                                />
                            ))
                        )}
                    </div>
                ) : (
                    <div className="table-container">
                        <DataTable
                            data={piezasFiltradas}
                            columns={columns}
                            className="piezas-table"
                            emptyMessage={searchTerm ? `No se encontraron resultados para "${searchTerm}"` : 'No hay piezas registradas.'}
                            rowClassName={(p) => (p.estado === 'DESCONTINUADO' ? 'row-inactiva' : '')}
                            onRowClick={(p) => { setSelectedPiezaId(p.id); setVista('slideover'); }}
                            defaultSort={{ key: 'fechaCreacion', direction: 'desc' }}
                            itemsPerPageOptions={[10, 25, 50]}
                        />
                    </div>
                )}

                <ConfirmModal
                    isOpen={isConfirmOpen}
                    title="Descontinuar Pieza"
                    message={`¿Estás seguro de descontinuar la pieza "${itemAEliminar?.nombre}"? Puedes reactivarla después.`}
                    onConfirm={ejecutarEliminacion}
                    onCancel={() => setIsConfirmOpen(false)}
                    confirmText="Sí, descontinuar"
                />
                    </>
                )}
            </div>

            {vista === 'slideover' && selectedPiezaId && (
                <PiezaSlideOver
                    isOpen={true}
                    piezaId={selectedPiezaId}
                    onClose={() => { setSelectedPiezaId(null); setVista('lista'); }}
                    onEdit={(id) => { setSelectedPiezaId(id); setVista('creador'); }}
                    onDeleted={() => { setSelectedPiezaId(null); cargarDatos(); }}
                />
            )}
        </>
    );
};
