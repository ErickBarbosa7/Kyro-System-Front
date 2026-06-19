import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Pencil, Trash2, Percent, Settings2, RefreshCcw } from 'lucide-react';

// COMPONENTES
import { SearchBar } from '../../components/ui/SearchBar/SearchBar';
import { Modal } from '../../components/ui/Modal/Modal';
import { ConfirmModal } from '../../components/ConfirmModal';
import { FilterGroup } from '../../components/ui/FilterGroup/FilterGroup';
import { DataTable, type ColumnConfig } from '../../components/ui/DataTable/DataTable';
import { FieldError } from '../../components/ui/FieldError/FieldError';

// SERVICIOS
import { 
    obtenerConfiguraciones, 
    crearConfiguracion, 
    actualizarConfiguracion, 
    eliminarConfiguracion,
    reactivarConfiguracion,
    type ConfiguracionMargen 
} from '../../services/configuracion-margenes.service';

import './ConfiguracionMargenes.css'; 

interface FormState {
    nombre: string;
    margenTaller: string | number;
    margenMayorista: string | number;
    margenPublico: string | number;
    descuentoMaximo: string | number;
}

export const ConfiguracionMargenes = () => {
    // === ESTADOS BASE ===
    const [configuraciones, setConfiguraciones] = useState<ConfiguracionMargen[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filtros, setFiltros] = useState({ estado: 'activos' });

    // === ESTADOS DEL MODAL Y FORMULARIO ===
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<FormState>({
        nombre: '',
        margenTaller: '',
        margenMayorista: '',
        margenPublico: '',
        descuentoMaximo: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    const requiredMsg = (label: string) => `${label} es obligatorio`;
    const validate = (data: FormState): Record<string, string> => {
        const e: Record<string, string> = {};
        if (!data.nombre?.trim()) e.nombre = requiredMsg('El nombre');
        if (data.margenTaller === '' || Number(data.margenTaller) <= 0) e.margenTaller = 'El margen de taller debe ser mayor a 0';
        if (data.margenMayorista === '' || Number(data.margenMayorista) <= 0) e.margenMayorista = 'El margen mayorista debe ser mayor a 0';
        if (data.margenPublico === '' || Number(data.margenPublico) <= 0) e.margenPublico = 'El margen público debe ser mayor a 0';
        return e;
    };

    // === ESTILOS MÁGICOS A PRUEBA DE FALLOS ===
    const labelStyle = { color: 'var(--color-text)', fontWeight: 700 };
    const inputStyle = { backgroundColor: 'var(--color-background)', color: 'var(--color-text)' };

    // === ESTADOS DE ELIMINACIÓN ===
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [configAEliminar, setConfigAEliminar] = useState<{ id: string, nombre: string } | null>(null);

    // === EFECTOS ===
    useEffect(() => {
        cargarDatos();
    }, [filtros.estado]);

    const cargarDatos = async () => {
        setIsLoading(true);
        try {
            const data = await obtenerConfiguraciones(filtros.estado);
            setConfiguraciones(data);
        } catch (error) {
            toast.error('Error al cargar las configuraciones de márgenes');
        } finally {
            setIsLoading(false);
        }
    };

    // === LÓGICA DE FORMULARIO ===
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        const parsedValue = type === 'number' ? (value === '' ? '' : Number(value)) : value;
        const next = { ...formData, [name]: parsedValue };
        setFormData(next);
        if (touched[name]) {
            const newErrors = validate(next);
            setErrors(prev => ({ ...prev, [name]: newErrors[name] }));
        }
    };

    const handleBlur = (field: string) => {
        setTouched(prev => ({ ...prev, [field]: true }));
        const newErrors = validate(formData);
        setErrors(prev => ({ ...prev, [field]: newErrors[field] }));
    };

    const abrirModal = (config?: ConfiguracionMargen) => {
        if (config) {
            setEditingId(config.id);
            setFormData({
                nombre: config.nombre,
                margenTaller: config.margenTaller,
                margenMayorista: config.margenMayorista,
                margenPublico: config.margenPublico,
                descuentoMaximo: config.descuentoMaximo ?? '' 
            });
        } else {
            setEditingId(null);
            setFormData({
                nombre: '',
                margenTaller: '',
                margenMayorista: '',
                margenPublico: '',
                descuentoMaximo: ''
            });
        }
        setErrors({});
        setTouched({});
        setIsModalOpen(true);
    };

    const cerrarModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setErrors({});
        setTouched({});
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const validationErrors = validate(formData);
        setErrors(validationErrors);
        setTouched({ nombre: true, margenTaller: true, margenMayorista: true, margenPublico: true });
        if (Object.keys(validationErrors).length > 0) return;

        const loadingToast = toast.loading(editingId ? 'Actualizando configuración...' : 'Guardando configuración...');

        try {
            const dataToSend = {
                nombre: formData.nombre,
                margenTaller: Number(formData.margenTaller),
                margenMayorista: Number(formData.margenMayorista),
                margenPublico: Number(formData.margenPublico),
                ...(formData.descuentoMaximo !== '' && { descuentoMaximo: Number(formData.descuentoMaximo) })
            };

            if (editingId) {
                await actualizarConfiguracion(editingId, dataToSend);
                toast.success('Configuración actualizada', { id: loadingToast });
            } else {
                await crearConfiguracion(dataToSend);
                toast.success('Configuración registrada', { id: loadingToast });
            }
            
            cerrarModal();
            cargarDatos();
        } catch (error: any) {
            toast.error('Error al guardar la configuración', { id: loadingToast });
        }
    };

    // === LÓGICA DE ELIMINACIÓN ===
    const confirmarEliminacion = (id: string, nombre: string) => {
        setConfigAEliminar({ id, nombre });
        setIsConfirmOpen(true);
    };

    const handleReactivar = async (id: string) => {
        const loadingToast = toast.loading('Restaurando configuración...');
        try {
            await reactivarConfiguracion(id);
            toast.success('Configuración restaurada', { id: loadingToast });
            cargarDatos();
        } catch (error) {
            toast.error('Error al restaurar', { id: loadingToast });
        }
    };

    const ejecutarEliminacion = async () => {
        if (!configAEliminar) return;
        const loadingToast = toast.loading('Eliminando...');
        try {
            await eliminarConfiguracion(configAEliminar.id);
            toast.success('Configuración eliminada', { id: loadingToast });
            setIsConfirmOpen(false);
            setConfigAEliminar(null);
            cargarDatos();
        } catch (error) {
            toast.error('Error al eliminar', { id: loadingToast });
        }
    };

    // === FILTRADO ===
    const datosFiltrados = configuraciones.filter(c => 
        c.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // === CONFIGURACIÓN DE LA TABLA ===
    const columns: ColumnConfig<ConfiguracionMargen>[] = useMemo(() => [
        {
            key: 'nombre',
            label: 'Nombre del Esquema',
            sortable: true,
            render: (c: ConfiguracionMargen) => (
                <span className="font-medium" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Settings2 size={16} color="#64748b" />
                    {c.nombre}
                    {c.activo === false && <span className="badge-eliminado">Desactivado</span>}
                </span>
            )
        },
        {
            key: 'margenTaller',
            label: 'Margen Taller',
            align: 'left',
            render: (c: ConfiguracionMargen) => (
                <span className="badge badge-secondary" style={{ backgroundColor: '#f1f5f9', color: '#475569' }}>
                    + {c.margenTaller}%
                </span>
            )
        },
        {
            key: 'margenMayorista',
            label: 'Margen Mayorista',
            align: 'left', 
            render: (c: ConfiguracionMargen) => (
                <span className="badge" style={{ backgroundColor: '#e0e7ff', color: '#4338ca' }}>
                    + {c.margenMayorista}%
                </span>
            )
        },
        {
            key: 'margenPublico',
            label: 'Margen Público',
            align: 'left',
            render: (c: ConfiguracionMargen) => (
                <span className="badge" style={{ backgroundColor: '#dcfce7', color: '#166534' }}>
                    + {c.margenPublico}%
                </span>
            )
        },
        {
            key: 'descuentoMaximo',
            label: 'Desc. Máximo',
            align: 'left',
            render: (c: ConfiguracionMargen) => (
                <span style={{ color: '#ef4444', fontWeight: 600 }}>
                    {c.descuentoMaximo ? `- ${c.descuentoMaximo}%` : 'N/A'}
                </span>
            )
        },
        {
            key: 'acciones',
            label: 'Acciones',
            width: '100px',
            align: 'center',
            render: (c: ConfiguracionMargen) => (
                <div className="actions-cell">
                    <button className="btn-icon edit" onClick={() => abrirModal(c)} title="Editar">
                        <Pencil size={18} />
                    </button>
                    {c.activo === false ? (
                        <button className="btn-icon reactivate" style={{ color: '#16a34a' }} onClick={() => handleReactivar(c.id)} title="Restaurar">
                            <RefreshCcw size={18} />
                        </button>
                    ) : (
                        <button className="btn-icon delete" onClick={() => confirmarEliminacion(c.id, c.nombre)} title="Enviar a papelera">
                            <Trash2 size={18} />
                        </button>
                    )}
                </div>
            )
        }
    ], []);

    return (
        <div className="module-container">
            {/* CABECERA CON COLOR FORZADO EN EL TÍTULO */}
            <div className="module-header">
                <div className="module-title">
                    <Percent size={28} color="var(--color-primary)" />
                    <h2 style={{ color: 'var(--color-primary)' }}>Configuración de Márgenes</h2>
                </div>
                <button className="btn-primary" onClick={() => abrirModal()}>
                    <Plus size={20} /> Nueva Configuración
                </button>
            </div>

            {/* DESCRIPCIÓN MEJORADA */}
            <div className="module-description">
                <p>
                    Establece las reglas de ganancia sobre el costo de producción. 
                    Estos porcentajes se sumarán al costo total de tus materiales y mano de obra 
                    para calcular automáticamente los precios finales (Taller, Mayorista y Público).
                </p>
            </div>

            {/* BUSCADOR Y FILTROS */}
            <div className="toolbar-container">
                <div className="search-wrapper" style={{ maxWidth: '400px' }}>
                    <SearchBar 
                        placeholder="Buscar esquema por nombre..." 
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
                                { id: 'todos', nombre: 'Ver Todos' },
                            ],
                        },
                    ]}
                />
            </div>

            {/* TABLA DE DATOS */}
            <div className="table-container">
                {isLoading ? (
                    <div className="loading-state">Cargando configuraciones...</div>
                ) : (
                    <DataTable
                        data={datosFiltrados}
                        columns={columns}
                        emptyMessage={searchTerm ? `No se encontraron resultados para "${searchTerm}"` : "No hay configuraciones de márgenes registradas."}
                        rowClassName={(c) => (c.activo === false ? 'row-inactiva' : '')}
                        defaultSort={{ key: 'nombre', direction: 'asc' }}
                    />
                )}
            </div>

            {/* MODAL FORMULARIO CON ESTILOS MÁGICOS */}
            <Modal
                isOpen={isModalOpen}
                onClose={cerrarModal}
                title={<span style={{ color: 'var(--color-text)' }}>{editingId ? 'Editar Configuración' : 'Nueva Configuración'}</span>}
                maxWidth="500px"
            >
                <form onSubmit={handleSubmit} className="modal-form">
                    
                    <div className={`form-group ${errors.nombre && touched.nombre ? 'form-group--error' : ''}`}>
                        <label style={labelStyle}>Nombre del Esquema *</label>
                        <input 
                            style={inputStyle}
                            type="text" 
                            name="nombre" 
                            value={formData.nombre} 
                            onChange={handleInputChange}
                            onBlur={() => handleBlur('nombre')}
                            placeholder="Ej. Márgenes Base 2026, Campaña Navidad..."
                            autoFocus
                            required
                        />
                        <FieldError message={touched.nombre ? errors.nombre : undefined} />
                    </div>

                    <div className="form-row">
                        <div className={`form-group ${errors.margenTaller && touched.margenTaller ? 'form-group--error' : ''}`}>
                            <label style={labelStyle}>Margen Taller (%) *</label>
                            <input 
                                style={inputStyle}
                                type="number" 
                                name="margenTaller" 
                                value={formData.margenTaller} 
                                onChange={handleInputChange}
                                onBlur={() => handleBlur('margenTaller')}
                                placeholder="Ej. 10"
                                min="0"
                                step="0.01"
                                required
                            />
                            <FieldError message={touched.margenTaller ? errors.margenTaller : undefined} />
                        </div>

                        <div className={`form-group ${errors.margenMayorista && touched.margenMayorista ? 'form-group--error' : ''}`}>
                            <label style={labelStyle}>Margen Mayorista (%) *</label>
                            <input 
                                style={inputStyle}
                                type="number" 
                                name="margenMayorista" 
                                value={formData.margenMayorista} 
                                onChange={handleInputChange}
                                onBlur={() => handleBlur('margenMayorista')}
                                placeholder="Ej. 30"
                                min="0"
                                step="0.01"
                                required
                            />
                            <FieldError message={touched.margenMayorista ? errors.margenMayorista : undefined} />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className={`form-group ${errors.margenPublico && touched.margenPublico ? 'form-group--error' : ''}`}>
                            <label style={labelStyle}>Margen Público (%) *</label>
                            <input 
                                style={inputStyle}
                                type="number" 
                                name="margenPublico" 
                                value={formData.margenPublico} 
                                onChange={handleInputChange}
                                onBlur={() => handleBlur('margenPublico')}
                                placeholder="Ej. 50"
                                min="0"
                                step="0.01"
                                required
                            />
                            <FieldError message={touched.margenPublico ? errors.margenPublico : undefined} />
                        </div>

                        <div className="form-group">
                            <label style={labelStyle}>Desc. Máximo Permitido (%)</label>
                            <input 
                                style={inputStyle}
                                type="number" 
                                name="descuentoMaximo" 
                                value={formData.descuentoMaximo} 
                                onChange={handleInputChange}
                                placeholder="Ej. 15 (Opcional)"
                                min="0"
                                max="100"
                                step="0.01"
                            />
                        </div>
                    </div>

                    <div className="modal-footer" style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                        <button type="button" className="btn-secondary" onClick={cerrarModal}>Cancelar</button>
                        <button type="submit" className="btn-primary">
                            {editingId ? 'Guardar Cambios' : 'Crear Esquema'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* MODAL ELIMINAR */}
            <ConfirmModal
                isOpen={isConfirmOpen}
                title="Enviar a Papelera"
                message={`¿Estás seguro de desactivar el esquema "${configAEliminar?.nombre}"? Las piezas que usen este esquema dejarán de tener margen asignado.`}
                onConfirm={ejecutarEliminacion}
                onCancel={() => setIsConfirmOpen(false)}
                confirmText="Sí, desactivar"
            />
        </div>
    );
};