import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Pencil, Trash2, Percent, Settings2 } from 'lucide-react';

// COMPONENTES
import { SearchBar } from '../../components/ui/SearchBar/SearchBar';
import { Modal } from '../../components/ui/Modal/Modal';
import { ConfirmModal } from '../../components/ConfirmModal';
import { DataTable, type ColumnConfig } from '../../components/ui/DataTable/DataTable';

// SERVICIOS
import { 
    obtenerConfiguraciones, 
    crearConfiguracion, 
    actualizarConfiguracion, 
    eliminarConfiguracion,
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

    // === ESTILOS MÁGICOS A PRUEBA DE FALLOS ===
    const labelStyle = { color: 'var(--color-text)', fontWeight: 700 };
    const inputStyle = { backgroundColor: 'var(--color-background)', color: 'var(--color-text)' };

    // === ESTADOS DE ELIMINACIÓN ===
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [configAEliminar, setConfigAEliminar] = useState<{ id: string, nombre: string } | null>(null);

    // === EFECTOS ===
    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        setIsLoading(true);
        try {
            const data = await obtenerConfiguraciones();
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
        setFormData(prev => ({ ...prev, [name]: parsedValue }));
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
        setIsModalOpen(true);
    };

    const cerrarModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.nombre.trim()) return toast.error('El nombre es obligatorio');
        if (formData.margenTaller === '' || Number(formData.margenTaller) < 0) return toast.error('Margen de taller inválido');
        if (formData.margenMayorista === '' || Number(formData.margenMayorista) < 0) return toast.error('Margen mayorista inválido');
        if (formData.margenPublico === '' || Number(formData.margenPublico) < 0) return toast.error('Margen público inválido');

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
                    <button className="btn-icon delete" onClick={() => confirmarEliminacion(c.id, c.nombre)} title="Eliminar">
                        <Trash2 size={18} />
                    </button>
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

            {/* BUSCADOR */}
            <div className="toolbar-container">
                <div className="search-wrapper" style={{ maxWidth: '400px' }}>
                    <SearchBar 
                        placeholder="Buscar esquema por nombre..." 
                        value={searchTerm} 
                        onChange={setSearchTerm} 
                    />
                </div>
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
                    
                    <div className="form-group">
                        <label style={labelStyle}>Nombre del Esquema *</label>
                        <input 
                            style={inputStyle}
                            type="text" 
                            name="nombre" 
                            value={formData.nombre} 
                            onChange={handleInputChange}
                            placeholder="Ej. Márgenes Base 2026, Campaña Navidad..."
                            autoFocus
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label style={labelStyle}>Margen Taller (%) *</label>
                            <input 
                                style={inputStyle}
                                type="number" 
                                name="margenTaller" 
                                value={formData.margenTaller} 
                                onChange={handleInputChange}
                                placeholder="Ej. 10"
                                min="0"
                                step="0.01"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label style={labelStyle}>Margen Mayorista (%) *</label>
                            <input 
                                style={inputStyle}
                                type="number" 
                                name="margenMayorista" 
                                value={formData.margenMayorista} 
                                onChange={handleInputChange}
                                placeholder="Ej. 30"
                                min="0"
                                step="0.01"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label style={labelStyle}>Margen Público (%) *</label>
                            <input 
                                style={inputStyle}
                                type="number" 
                                name="margenPublico" 
                                value={formData.margenPublico} 
                                onChange={handleInputChange}
                                placeholder="Ej. 50"
                                min="0"
                                step="0.01"
                                required
                            />
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
                title="Eliminar Configuración"
                message={`¿Estás seguro de eliminar el esquema de márgenes "${configAEliminar?.nombre}"? Las piezas que usen este esquema podrían verse afectadas.`}
                onConfirm={ejecutarEliminacion}
                onCancel={() => setIsConfirmOpen(false)}
                confirmText="Sí, eliminar"
            />
        </div>
    );
};