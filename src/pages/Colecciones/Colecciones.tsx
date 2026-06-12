import React, { useState, useEffect, useMemo } from 'react';
import { DataTable, type ColumnConfig } from '../../components/ui/DataTable/DataTable';
import { toast } from 'react-hot-toast';
import { Modal } from '../../components/ui/Modal/Modal'; 
import { ConfirmModal } from '../../components/ConfirmModal';
import { Plus, Box, Pencil, Trash2, RefreshCcw } from 'lucide-react';

import './Colecciones.css';
import { actualizarColeccion, crearColeccion, eliminarColeccion, obtenerColecciones, reactivarColeccion, type ColeccionData } from '../../services/colecciones.service';
import { SearchBar } from '../../components/ui/SearchBar/SearchBar';
import { FilterGroup } from '../../components/ui/FilterGroup/FilterGroup';
import { Loading } from '../../components/Loading/Loading';

interface FormState {
    nombre: string;
    codigo: string;
    descripcion?: string;
    activa?: boolean; 
}

export const Colecciones = () => {

    // Estados principales de la vista
    const [colecciones, setColecciones] = useState<ColeccionData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Controles de filtrado (activos/inactivos)
    const [filtros, setFiltros] = useState({
        estado: 'activos'
    });

    // Control del modal y datos del formulario
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<FormState>({
        nombre: '', codigo: '', descripcion: '', activa: true
    });

    // Variables de estilo inyectadas para forzar visibilidad en modo oscuro
    const labelStyle = { color: 'var(--color-text)', fontWeight: 700 };
    const inputStyle = { backgroundColor: 'var(--color-background)', color: 'var(--color-text)' };

    // Control de la alerta de eliminación
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [itemAEliminar, setItemAEliminar] = useState<{ id: string; nombre: string } | null>(null);

    // AQUÍ ESTÁ LA MAGIA DEL FILTRO: 
    // Al pasar [filtros.estado], React ejecuta cargarColecciones automáticamente cada que cambias el select.
    useEffect(() => {
        cargarColecciones();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filtros.estado]);

    const cargarColecciones = async () => {
        setIsLoading(true);
        try {
            const data = await obtenerColecciones(filtros.estado as any);
            setColecciones(data);
            setIsLoading(false); 
        } catch (error) {
            toast.error('Error de conexión con el servidor');
        }
    };

    // Actualiza el state conforme el usuario escribe en los inputs
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? checked : value 
        }));
    };

    // Prepara el formulario ya sea para crear uno nuevo o editar uno existente
    const abrirModal = (coleccion?: ColeccionData) => {
        if (coleccion) {
            setEditingId(coleccion.id || null);
            setFormData({
                nombre: coleccion.nombre,
                codigo: coleccion.codigo,
                descripcion: coleccion.descripcion || '',
                activa: coleccion.activa ?? true
            });
        } else {
            setEditingId(null);
            setFormData({
                nombre: '', 
                codigo: '', 
                descripcion: '', 
                activa: true
            });
        }
        setIsModalOpen(true);
    };

    const cerrarModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
    };

    const handleColeccionSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.nombre.trim()) return toast.error('El nombre de la colección es obligatorio');
        if (!formData.codigo.trim()) return toast.error('El código es obligatorio');

        const loadingToast = toast.loading(editingId ? 'Actualizando...' : 'Guardando...');

        try {
            const dataToSend = {
                nombre: formData.nombre.trim(),
                codigo: formData.codigo.trim(),
                descripcion: formData.descripcion?.trim() || ''
            };

            if (editingId) {
                await actualizarColeccion(editingId, dataToSend);
                toast.success('Colección actualizada', { id: loadingToast });
            } else {
                await crearColeccion(dataToSend);
                toast.success('Colección registrada', { id: loadingToast });
            }
            
            cerrarModal(); 
            cargarColecciones(); 
            
        } catch (error: any) {
            const errorMsg = error.response?.data?.error || 'Ocurrió un error al guardar';
            toast.error(errorMsg, { id: loadingToast });
        }
    };

    const ejecutarReactivacionColeccion = async (id: string) => {
        const loadingToast = toast.loading('Restaurando...');
        try {
            await reactivarColeccion(id);
            toast.success('Colección restaurada', { id: loadingToast });
            cargarColecciones(); 
        } catch (error) {
            toast.error('Error al restaurar', { id: loadingToast });
        }
    };

    // Abre la alerta de confirmación antes de borrar
    const handleDeleteClick = (id: string, nombre: string) => {
        setItemAEliminar({ id, nombre });
        setIsConfirmOpen(true);
    };

    // Hace el borrado lógico (soft-delete)
    const ejecutarEliminacion = async () => {
        if (!itemAEliminar) return;
        const loadingToast = toast.loading('Enviando a papelera...');
        
        try {
            await eliminarColeccion(itemAEliminar.id);
            toast.success('Colección eliminada', { id: loadingToast });
            setIsConfirmOpen(false);
            setItemAEliminar(null);
            cargarColecciones();
        } catch (error: any) {
            toast.error('Error al eliminar', { id: loadingToast });
        }
    };

    // Buscador local en memoria
    const coleccionesFiltradas = colecciones.filter(col => {
        const busqueda = searchTerm.toLowerCase();
        return (
            col.nombre.toLowerCase().includes(busqueda) || 
            col.codigo.toLowerCase().includes(busqueda) ||
            (col.descripcion && col.descripcion.toLowerCase().includes(busqueda))
        );
    });

    const columns: ColumnConfig<ColeccionData>[] = useMemo(() => [
        {
            key: 'codigo',
            label: 'Código',
            width: '140px',
            sortable: true,
            render: (col: ColeccionData) => (
                <span className="font-medium" style={{ color: 'var(--color-primary)', letterSpacing: '0.5px' }}>
                    {col.codigo}
                </span>
            )
        },
        {
            key: 'nombre',
            label: 'Nombre de Colección',
            width: '250px',
            sortable: true,
            render: (col: ColeccionData) => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span className="font-medium">{col.nombre}</span>
                    {col.activa === false && <span className="badge-eliminado">Eliminada</span>}
                </div>
            )
        },
        {
            key: 'descripcion',
            label: 'Descripción',
            sortable: true,
            render: (col: ColeccionData) => (
                <span className="text-muted truncate-text" title={col.descripcion || 'Sin descripción detallada'}>
                    {col.descripcion || 'Sin descripción'}
                </span>
            )
        },
        {
            key: 'acciones',
            label: 'Acciones',
            width: '120px',
            align: 'center',
            render: (col: ColeccionData) => (
                <div className="actions-cell">
                    <button className="btn-icon edit" onClick={() => abrirModal(col)} title="Editar">
                        <Pencil size={18} />
                    </button>
                    
                    {col.activa === false ? (
                        <button 
                            className="btn-icon reactivate" 
                            style={{ color: '#16a34a' }} 
                            onClick={() => ejecutarReactivacionColeccion(col.id!)} 
                            title="Restaurar de la papelera"
                        >
                            <RefreshCcw size={18} />
                        </button>
                    ) : (
                        <button 
                            className="btn-icon delete" 
                            onClick={() => handleDeleteClick(col.id!, col.nombre)} 
                            title="Enviar a papelera"
                        >
                            <Trash2 size={18} />
                        </button>
                    )}
                </div>
            )
        }
    ], []);

    return (
        <div className='module-container'>
            <div className="module-header">
                <div className="module-title">
                    <Box size={28} color="var(--color-primary)" />
                    <h2 style={{ color: 'var(--color-primary)' }}> Catálogo de Colecciones</h2>
                </div>

                <div style={{ display: 'flex', gap: '12px'}}>
                    <button className="btn-primary" onClick={() => abrirModal()}>
                        <Plus size={20} /> Nueva Colección
                    </button>
                </div>
            </div>
            
            <div className="module-description">
                <p>Agrupa y organiza tus productos mediante colecciones personalizadas.</p>
            </div>

            <div className="toolbar-container">
                <div className="search-wrapper">
                    <SearchBar placeholder='Buscar Colección...' value={searchTerm} onChange={setSearchTerm} />
                </div>

                <FilterGroup 
                    values={filtros}
                    onChange={(name, value) => setFiltros(prev => ({ ...prev, [name]: value }))}
                    onClear={() => {
                        setFiltros({ estado: 'activos'});
                        setSearchTerm('');
                    }}
                    filters={[
                        {
                            name: 'estado',
                            placeholder: 'Ver Activos',
                            hideEmptyOption: true,
                            options: [
                                { id: 'activos', nombre: 'Ver Activos' },
                                { id: 'inactivos', nombre: 'Papelera' },
                                { id: 'todos', nombre: 'Ver Todos' }
                            ]
                        },
                    ]}
                />
            </div>

            <div className="table-container">
                {isLoading ? (
                    <Loading texto="Cargando colecciones..."/>
                ): (
                    <DataTable
                        data={coleccionesFiltradas}
                        columns={columns}
                        className='colecciones-table'
                        emptyMessage={searchTerm ? `No se encontraron resultados para "${searchTerm}"` : "No hay colecciones registradas."}
                        rowClassName={(col) => (col.activa === false ? 'row-inactiva' : '')}
                        defaultSort={{ key: 'nombre', direction: 'desc' }}
                    />
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={cerrarModal}
                title={<span style={{ color: 'var(--color-text)' }}>{editingId ? 'Editar Colección' : 'Nueva Colección'}</span>}
                maxWidth="500px"
                zIndex={998} 
            >
                <form onSubmit={handleColeccionSubmit} className="modal-form">
                    <div className="form-group">
                        <label style={labelStyle}>Nombre de Colección *</label>
                        <input
                            style={inputStyle}
                            type="text"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleInputChange}
                            placeholder="Ej. Barroco Primavera"
                            autoFocus
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label style={labelStyle}>Código *</label>
                        <input
                            style={inputStyle}
                            type="text"
                            name="codigo"
                            value={formData.codigo}
                            onChange={handleInputChange}
                            placeholder="Ej. COL-BARR-26"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label style={labelStyle}>Descripción (Opcional)</label>
                        <textarea
                            style={inputStyle}
                            name="descripcion"
                            value={formData.descripcion}
                            onChange={handleInputChange}
                            placeholder="Añade detalles sobre la inspiración o propósito de esta colección..."
                            rows={3}
                        />
                    </div>

                    <div className="modal-footer" style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                        <button type="button" className="btn-secondary" onClick={cerrarModal}>Cancelar</button>
                        <button type="submit" className="btn-primary">
                            {editingId ? 'Guardar Cambios' : 'Crear Colección'}
                        </button>
                    </div>
                </form>
            </Modal>

            <ConfirmModal
                isOpen={isConfirmOpen}
                title="Eliminar Colección"
                message={`¿Estás seguro de que deseas enviar a la papelera la colección "${itemAEliminar?.nombre}"?`}
                onConfirm={ejecutarEliminacion}
                onCancel={() => setIsConfirmOpen(false)}
                confirmText="Sí, eliminar"
            />
        </div>
    );
};