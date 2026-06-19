import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Pencil, Trash2, Coins, AlertTriangle, RefreshCcw } from 'lucide-react';

// COMPONENTES UI
import { SearchBar } from '../../components/ui/SearchBar/SearchBar';
import { Modal } from '../../components/ui/Modal/Modal';
import { ConfirmModal } from '../../components/ConfirmModal';
import { FilterGroup } from '../../components/ui/FilterGroup/FilterGroup';
import { DataTable, type ColumnConfig } from '../../components/ui/DataTable/DataTable';
import { Loading } from '../../components/Loading/Loading';
import { FieldError } from '../../components/ui/FieldError/FieldError';

// SERVICIOS
import { 
    obtenerMetales, 
    crearMetal, 
    actualizarMetal, 
    eliminarMetal, 
    type MetalData 
} from '../../services/metales.service';

interface Metal extends MetalData {
    id: string;
}

export const Metales = () => {
    // === ESTADOS GLOBALES ===
    const [metales, setMetales] = useState<Metal[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Filtro local para manejar la papelera sin modificar tu servicio actual
    const [filtros, setFiltros] = useState({
        estado: 'activos'
    });

    // === ESTADOS DEL MODAL Y FORMULARIO ===
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<MetalData>({
        nombre: '',
        precioPorGramo: 0,
        stockDisponible: 0,
        stockMinimo: 0,
        observaciones: '',
        activo: true
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    // === ESTILOS MÁGICOS (DARK MODE SAFE) ===
    const labelStyle = { color: 'var(--color-text)', fontWeight: 700 };
    const inputStyle = { backgroundColor: 'var(--color-background)', color: 'var(--color-text)' };

    // === ESTADOS DE ELIMINACIÓN ===
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [metalAEliminar, setMetalAEliminar] = useState<{ id: string, nombre: string } | null>(null);

    // === EFECTOS ===
    useEffect(() => {
        cargarMetales();
    }, [filtros.estado]);

    const cargarMetales = async () => {
    setIsLoading(true);

    try {
        const data = await obtenerMetales(filtros.estado);
        setMetales(data);
    } catch (error) {
        toast.error('Error al conectar con el servidor de Kyro');
    } finally {
        setIsLoading(false);
    }
};

    // === LÓGICA DE FORMULARIO ===
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const parsedValue = type === 'number' ? (value === '' ? '' : Number(value)) : value;
        const updated = { ...formData, [name]: parsedValue };
        setFormData(updated);
        if (touched[name]) {
            const newErrors = validate(updated);
            setErrors(prev => ({ ...prev, [name]: newErrors[name] }));
        }
    };

    const handleBlur = (field: string) => {
        setTouched(prev => ({ ...prev, [field]: true }));
        const newErrors = validate(formData);
        setErrors(prev => ({ ...prev, [field]: newErrors[field] }));
    };

    const abrirModal = (metal?: Metal) => {
        if (metal) {
            setEditingId(metal.id);
            setFormData({
                nombre: metal.nombre,
                precioPorGramo: metal.precioPorGramo,
                stockDisponible: metal.stockDisponible,
                stockMinimo: metal.stockMinimo,
                observaciones: metal.observaciones || '',
                activo: metal.activo ?? true
            });
        } else {
            setEditingId(null);
            setFormData({
                nombre: '',
                precioPorGramo: '' as unknown as number, // Truco para que el input inicie vacío
                stockDisponible: '' as unknown as number,
                stockMinimo: '' as unknown as number,
                observaciones: '',
                activo: true
            });
        }
        setErrors({});
        setTouched({});
        setIsModalOpen(true);
    };

    const cerrarModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
    };

    const requiredMsg = (label: string) => `${label} es obligatorio`;
    const validate = (data: MetalData): Record<string, string> => {
        const e: Record<string, string> = {};
        if (!data.nombre?.trim()) e.nombre = requiredMsg('El nombre');
        if (Number(data.precioPorGramo) <= 0) e.precioPorGramo = 'El precio por gramo debe ser mayor a 0';
        if (Number(data.stockDisponible) <= 0) e.stockDisponible = 'El stock disponible debe ser mayor a 0';
        if (Number(data.stockMinimo) <= 0) e.stockMinimo = 'El stock mínimo debe ser mayor a 0';
        return e;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const validationErrors = validate(formData);
        setErrors(validationErrors);
        setTouched({ nombre: true, precioPorGramo: true, stockDisponible: true, stockMinimo: true });
        if (Object.keys(validationErrors).length > 0) return;

        if (!formData.nombre.trim()) return toast.error('El nombre del metal es obligatorio');
        if (Number(formData.precioPorGramo) <= 0) return toast.error('El precio por gramo debe ser mayor a 0');

        const loadingToast = toast.loading(editingId ? 'Actualizando metal...' : 'Registrando metal...');

        try {
            const dataToSend = {
                nombre: formData.nombre.trim(),
                precioPorGramo: Number(formData.precioPorGramo),
                stockDisponible: Number(formData.stockDisponible),
                stockMinimo: Number(formData.stockMinimo),
                observaciones: formData.observaciones?.trim() || ''
            };

            if (editingId) {
                await actualizarMetal(editingId, dataToSend);
                toast.success('Metal actualizado exitosamente', { id: loadingToast });
            } else {
                await crearMetal(dataToSend);
                toast.success('Metal registrado exitosamente', { id: loadingToast });
            }
            
            cerrarModal();
            cargarMetales();
        } catch (error: any) {
            const errorMsg = error.response?.data?.error || 'Error al guardar el metal';
            toast.error(errorMsg, { id: loadingToast });
        }
    };

    // === LÓGICA DE PAPELERA ===
    const handleDeleteClick = (id: string, nombre: string) => {
        setMetalAEliminar({ id, nombre });
        setIsConfirmOpen(true);
    };

    const ejecutarEliminacion = async () => {
        if (!metalAEliminar) return;
        const loadingToast = toast.loading('Enviando a papelera...');
        try {
            await eliminarMetal(metalAEliminar.id);
            toast.success('Metal enviado a la papelera', { id: loadingToast });
            setIsConfirmOpen(false);
            setMetalAEliminar(null);
            cargarMetales();
        } catch (error) {
            toast.error('Error al eliminar', { id: loadingToast });
        }
    };

    const handleReactivar = async (id: string) => {
        const loadingToast = toast.loading('Restaurando metal...');
        try {
            // Aprovechamos tu endpoint de actualización para revivirlo
            await actualizarMetal(id, { activo: true });
            toast.success('Metal restaurado exitosamente', { id: loadingToast });
            cargarMetales();
        } catch (error) {
            toast.error('Error al restaurar', { id: loadingToast });
        }
    };

    // === FILTRADO LOCAL (solo búsqueda, el backend maneja el estado) ===
    const metalesFiltrados = metales.filter(m => {
        const busqueda = searchTerm.toLowerCase();
        return m.nombre.toLowerCase().includes(busqueda) || 
               (m.observaciones && m.observaciones.toLowerCase().includes(busqueda));
    });

    // === CONFIGURACIÓN DE COLUMNAS ===
    const columns: ColumnConfig<Metal>[] = useMemo(() => [
        {
            key: 'nombre',
            label: 'Aleación / Metal',
            width: '220px',
            sortable: true,
            render: (m: Metal) => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span className="font-medium">{m.nombre}</span>
                    {m.activo === false && <span className="badge-eliminado">Desactivado</span>}
                </div>
            )
        },
        {
            key: 'precioPorGramo',
            label: 'Costo (por gramo)',
            width: '150px',
            sortable: true,
            align: 'left',
            render: (m: Metal) => (
                <span className="font-price" style={{ color: 'var(--color-primary)' }}>
                    {Number(m.precioPorGramo).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                </span>
            )
        },
        {
            key: 'stockDisponible',
            label: 'Inventario Físico',
            width: '160px',
            sortable: true,
            align: 'center',
            render: (m: Metal) => {
                const stockBajo = m.stockDisponible <= m.stockMinimo;
                return (
                    <div style={{ 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        color: stockBajo ? '#ef4444' : '#15803d',
                        fontWeight: stockBajo ? 700 : 500,
                        backgroundColor: stockBajo ? '#fef2f2' : '#f0fdf4',
                        padding: '4px 10px', borderRadius: '20px',
                    }}>
                        {stockBajo && <AlertTriangle size={14} />}
                        <span>{m.stockDisponible} grs</span>
                    </div>
                );
            }
        },
        {
            key: 'observaciones',
            label: 'Observaciones',
            sortable: true,
            render: (m: Metal) => (
                <span className="text-muted truncate-text" title={m.observaciones || 'Sin detalles'}>
                    {m.observaciones || '—'}
                </span>
            )
        },
        {
            key: 'acciones',
            label: 'Acciones',
            width: '110px',
            align: 'center',
            render: (m: Metal) => (
                <div className="actions-cell">
                    <button className="btn-icon edit" onClick={() => abrirModal(m)} title="Editar">
                        <Pencil size={18} />
                    </button>
                    
                    {m.activo === false ? (
                        <button className="btn-icon reactivate" style={{ color: '#16a34a' }} onClick={() => handleReactivar(m.id)} title="Restaurar de la papelera">
                            <RefreshCcw size={18} />
                        </button>
                    ) : (
                        <button className="btn-icon delete" onClick={() => handleDeleteClick(m.id, m.nombre)} title="Enviar a papelera">
                            <Trash2 size={18} />
                        </button>
                    )}
                </div>
            )
        }
    ], []);

    return (
        <div className="module-container">
            {/* HEADER */}
            <div className="module-header">
                <div className="module-title">
                    <Coins size={28} color="var(--color-primary)" />
                    <h2 style={{ color: 'var(--color-primary)' }}>Catálogo de Metales</h2>
                </div>
                <button className="btn-primary" onClick={() => abrirModal()}>
                    <Plus size={20} /> Nuevo Metal
                </button>
            </div>

            <div className="module-description">
                <p>Administra las aleaciones, sus costos base por gramo y supervisa los niveles de inventario físico del taller.</p>
            </div>

            {/* CONTROLES (BUSCADOR Y FILTROS) */}
            <div className="toolbar-container">
                <div className="search-wrapper" style={{ maxWidth: '350px' }}>
                    <SearchBar 
                        placeholder="Buscar metal u observación..." 
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
                                { id: 'inactivos', nombre: 'Papelera' },
                                { id: 'todos', nombre: 'Ver Todos' }
                            ]
                        }
                    ]}
                />
            </div>

            {/* TABLA DE DATOS */}
            <div className="table-container">
                {isLoading ? (
                    <Loading texto="Cargando metales..." />
                ) : (
                    <DataTable
                        data={metalesFiltrados}
                        columns={columns}
                        emptyMessage={searchTerm ? `No se encontraron resultados para "${searchTerm}"` : "No hay metales registrados."}
                        rowClassName={(m) => (m.activo === false ? 'row-inactiva' : '')}
                        defaultSort={{ key: 'nombre', direction: 'asc' }}
                    />
                )}
            </div>

            {/* MODAL FORMULARIO */}
            <Modal
                isOpen={isModalOpen}
                onClose={cerrarModal}
                title={<span style={{ color: 'var(--color-text)' }}>{editingId ? 'Editar Metal' : 'Nuevo Metal'}</span>}
                maxWidth="550px"
            >
                <form onSubmit={handleSubmit} className="modal-form">
                    <div className={`form-group ${errors.nombre && touched.nombre ? 'form-group--error' : ''}`}>
                        <label style={labelStyle}>Nombre / Aleación *</label>
                        <input 
                            style={inputStyle}
                            type="text" 
                            name="nombre" 
                            value={formData.nombre} 
                            onChange={handleInputChange}
                            onBlur={() => handleBlur('nombre')}
                            placeholder="Ej. Oro Amarillo 18k, Plata 925..."
                            autoFocus
                        />
                        <FieldError message={touched.nombre ? errors.nombre : undefined} />
                    </div>

                    <div className="form-row">
                    <div className={`form-group ${errors.precioPorGramo && touched.precioPorGramo ? 'form-group--error' : ''}`}>
                        <label style={labelStyle}>Costo por Gramo ($) *</label>
                        <input 
                            style={inputStyle}
                            type="number" 
                            name="precioPorGramo" 
                            value={formData.precioPorGramo} 
                            onChange={handleInputChange}
                            onBlur={() => handleBlur('precioPorGramo')}
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                        />
                        <FieldError message={touched.precioPorGramo ? errors.precioPorGramo : undefined} />
                    </div>
                    </div>

                    <div className="form-row">
                    <div className={`form-group ${errors.stockDisponible && touched.stockDisponible ? 'form-group--error' : ''}`}>
                        <label style={labelStyle}>Stock Disponible (Gramos) *</label>
                        <input 
                            style={inputStyle}
                            type="number" 
                            name="stockDisponible" 
                            value={formData.stockDisponible} 
                            onChange={handleInputChange}
                            onBlur={() => handleBlur('stockDisponible')}
                            step="0.01"
                            min="0"
                            placeholder="0.00 g"
                        />
                        <FieldError message={touched.stockDisponible ? errors.stockDisponible : undefined} />
                    </div>

                    <div className={`form-group ${errors.stockMinimo && touched.stockMinimo ? 'form-group--error' : ''}`}>
                        <label style={labelStyle}>Alerta Mínima (Gramos) *</label>
                            <input 
                                style={inputStyle}
                                type="number" 
                                name="stockMinimo" 
                                value={formData.stockMinimo} 
                                onChange={handleInputChange}
                                onBlur={() => handleBlur('stockMinimo')}
                                step="0.01"
                                min="0"
                                placeholder="Ej. 50 g" 
                            />
                        <FieldError message={touched.stockMinimo ? errors.stockMinimo : undefined} />
                    </div>
                    </div>

                    <div className="form-group">
                        <label style={labelStyle}>Observaciones (Opcional)</label>
                        <textarea 
                            style={inputStyle}
                            name="observaciones" 
                            value={formData.observaciones} 
                            onChange={handleInputChange}
                            placeholder="Proveedor habitual, variaciones de pureza..."
                            rows={3}
                        />
                    </div>

                    <div className="modal-footer" style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                        <button type="button" className="btn-secondary" onClick={cerrarModal}>Cancelar</button>
                        <button type="submit" className="btn-primary">
                            {editingId ? 'Guardar Cambios' : 'Registrar Metal'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* MODAL DE CONFIRMACIÓN */}
            <ConfirmModal
                isOpen={isConfirmOpen}
                title="Enviar a Papelera"
                message={`¿Estás seguro de desactivar el metal "${metalAEliminar?.nombre}"? Dejará de aparecer en las listas de producción.`}
                onConfirm={ejecutarEliminacion}
                onCancel={() => setIsConfirmOpen(false)}
                confirmText="Sí, desactivar"
            />
        </div>
    );
};