import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Pencil, Trash2, Receipt, Calendar, FileText, RefreshCcw } from 'lucide-react';

// IMPORTACIONES DE COMPONENTES
import { SearchBar } from '../../components/ui/SearchBar/SearchBar';
import { ConfirmModal } from '../../components/ConfirmModal';
import { FilterGroup } from '../../components/ui/FilterGroup/FilterGroup';
import { Modal } from '../../components/ui/Modal/Modal';
import { DataTable, type ColumnConfig } from '../../components/ui/DataTable/DataTable';
<<<<<<< HEAD
import { Loading } from '../../components/Loading/Loading';
=======
import { FieldError } from '../../components/ui/FieldError/FieldError';
>>>>>>> feature/metales

// SERVICIOS
import { 
    obtenerGastos, 
    crearGasto, 
    actualizarGasto, 
    eliminarGasto,
    reactivarGasto,
    type GastoOperativo 
} from '../../services/gastos-operativos.service';

import { generarPDFGastos } from '../../utils/reportes';

import './GastosOperativos.css'; 

interface FormState {
    concepto: string;
    monto: string | number;
    categoria: string;
    periodicidad: string;
    fecha: string;
    observaciones: string;
}

export const GastosOperativos = () => {
    // === ESTADOS GLOBALES ===
    const [gastos, setGastos] = useState<GastoOperativo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filtros, setFiltros] = useState({ estado: 'activos' });

    // === ESTADOS DEL MODAL Y FORMULARIO ===
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<FormState>({
        concepto: '',
        monto: '', 
        categoria: 'Fijo', 
        periodicidad: 'UNICA', 
        fecha: new Date().toISOString().split('T')[0], 
        observaciones: ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    // === ESTILOS MÁGICOS A PRUEBA DE FALLOS ===
    const labelStyle = { color: 'var(--color-text)', fontWeight: 700 };
    const inputStyle = { backgroundColor: 'var(--color-background)', color: 'var(--color-text)' };

    // === ESTADOS DE ELIMINACIÓN ===
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [gastoAEliminar, setGastoAEliminar] = useState<{ id: string, concepto: string } | null>(null);

    // === EFECTOS ===
    useEffect(() => {
        cargarGastos();
    }, [filtros.estado]);

    const cargarGastos = async () => {
        setIsLoading(true);
        try {
<<<<<<< HEAD
            const [data] = await Promise.all([
                obtenerGastos(),
                new Promise(resolve => setTimeout(resolve, 800))
            ]);
=======
            const data = await obtenerGastos(filtros.estado);
>>>>>>> feature/metales
            setGastos(data);
            setIsLoading(false); // Solo se detiene el loader si tiene éxito
        } catch (error) {
            toast.error('Error al cargar los Gastos Operativos');
            // Al omitir el setIsLoading(false) aquí, se queda cargando de forma infinita
        }
    };

    // === LÓGICA DE FORMULARIO ===
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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

    const abrirModal = (gasto?: GastoOperativo) => {
        if (gasto) {
            setEditingId(gasto.id);
            setFormData({
                concepto: gasto.concepto,
                monto: gasto.monto,
                categoria: gasto.categoria,
                periodicidad: gasto.periodicidad,
                fecha: gasto.fecha.split('T')[0], 
                observaciones: gasto.observaciones || ''
            });
        } else {
            setEditingId(null);
            setFormData({
                concepto: '',
                monto: '', 
                categoria: 'Fijo',
                periodicidad: 'UNICA',
                fecha: new Date().toISOString().split('T')[0],
                observaciones: ''
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
    const validate = (data: FormState): Record<string, string> => {
        const e: Record<string, string> = {};
        if (!data.concepto?.trim()) e.concepto = requiredMsg('El concepto');
        if (Number(data.monto) <= 0) e.monto = 'El monto debe ser mayor a 0';
        if (!data.fecha) e.fecha = 'La fecha es obligatoria';
        return e;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const validationErrors = validate(formData);
        setErrors(validationErrors);
        setTouched({ concepto: true, monto: true, fecha: true });
        if (Object.keys(validationErrors).length > 0) return;

        if (!formData.concepto.trim()) return toast.error('El concepto es obligatorio');
        if (Number(formData.monto) <= 0) return toast.error('El monto debe ser mayor a 0');
        if (!formData.fecha) return toast.error('La fecha es obligatoria');

        const loadingToast = toast.loading(editingId ? 'Actualizando gasto...' : 'Registrando gasto...');

        try {
            const dataToSend = {
                concepto: formData.concepto,
                monto: Number(formData.monto),
                categoria: formData.categoria,
                periodicidad: formData.periodicidad as 'SEMANAL' | 'MENSUAL' | 'ANUAL' | 'UNICA',
                fecha: `${formData.fecha}T12:00:00.000Z`,
                observaciones: formData.observaciones
            };

            if (editingId) {
                await actualizarGasto(editingId, dataToSend);
                toast.success('Gasto actualizado', { id: loadingToast });
            } else {
                await crearGasto(dataToSend);
                toast.success('Gasto registrado', { id: loadingToast });
            }
            
            cerrarModal();
            cargarGastos();
        } catch (error: any) {
            toast.error('Error al guardar el gasto', { id: loadingToast });
        }
    };

    // === LÓGICA DE ELIMINACIÓN ===
    const handleDeleteClick = (id: string, concepto: string) => {
        setGastoAEliminar({ id, concepto });
        setIsConfirmOpen(true);
    };

    const handleReactivar = async (id: string) => {
        const loadingToast = toast.loading('Restaurando gasto...');
        try {
            await reactivarGasto(id);
            toast.success('Gasto restaurado', { id: loadingToast });
            cargarGastos();
        } catch (error) {
            toast.error('Error al restaurar', { id: loadingToast });
        }
    };

    const ejecutarEliminacion = async () => {
        if (!gastoAEliminar) return;
        const loadingToast = toast.loading('Eliminando...');
        try {
            await eliminarGasto(gastoAEliminar.id);
            toast.success('Gasto eliminado', { id: loadingToast });
            setIsConfirmOpen(false);
            setGastoAEliminar(null);
            cargarGastos();
        } catch (error) {
            toast.error('Error al eliminar', { id: loadingToast });
        }
    };

    // === FILTRADO ===
    const gastosFiltrados = gastos.filter(g => 
        g.concepto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.categoria.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // === CONFIGURACIÓN DE COLUMNAS ===
    const columns: ColumnConfig<GastoOperativo>[] = useMemo(() => [
        {
            key: 'concepto',
            label: 'Concepto / Descripción',
            sortable: true,
            render: (g: GastoOperativo) => (
                <div>
                    <span className="font-medium" style={{ display: 'block' }}>{g.concepto}</span>
                    {g.activo === false && <span className="badge-eliminado">Desactivado</span>}
                    {g.observaciones && <span className="text-muted" style={{ fontSize: '12px' }}>{g.observaciones}</span>}
                </div>
            )
        },
        {
            key: 'categoria',
            label: 'Categoría',
            width: '180px',
            sortable: true,
            render: (g: GastoOperativo) => (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span className={`badge ${g.categoria === 'Fijo' ? 'badge-primary' : 'badge-secondary'}`}>
                        {g.categoria}
                    </span>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>
                        {g.periodicidad}
                    </span>
                </div>
            )
        },
        {
            key: 'fecha',
            label: 'Fecha',
            width: '140px',
            sortable: true,
            render: (g: GastoOperativo) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-secondary)' }}>
                    <Calendar size={14} />
                    <span>{new Date(g.fecha).toLocaleDateString('es-MX')}</span>
                </div>
            )
        },
        {
            key: 'monto',
            label: 'Monto',
            width: '130px',
            sortable: true,
            align: 'right',
            render: (g: GastoOperativo) => (
                <span className="font-price" style={{ color: '#ef4444' }}>
                    {Number(g.monto).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                </span>
            )
        },
        {
            key: 'acciones',
            label: 'Acciones',
            width: '100px',
            align: 'center',
            render: (g: GastoOperativo) => (
                <div className="actions-cell">
                    <button className="btn-icon edit" onClick={() => abrirModal(g)} title="Editar">
                        <Pencil size={18} />
                    </button>
                    {g.activo === false ? (
                        <button className="btn-icon reactivate" style={{ color: '#16a34a' }} onClick={() => handleReactivar(g.id)} title="Restaurar">
                            <RefreshCcw size={18} />
                        </button>
                    ) : (
                        <button className="btn-icon delete" onClick={() => handleDeleteClick(g.id, g.concepto)} title="Enviar a papelera">
                            <Trash2 size={18} />
                        </button>
                    )}
                </div>
            )
        }
    ], []);

    return (
        <div className="module-container">
            <div className="module-header">
                <div className="module-title">
                    <Receipt size={28} color="var(--color-primary)" />
                    <h2 style={{ color: 'var(--color-primary)' }}>Gastos Operativos</h2>
                </div>
                
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                        className="btn-secondary" 
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        onClick={() => generarPDFGastos(gastosFiltrados)}
                        title="Exportar a PDF"
                    >
                        <FileText size={20} /> Exportar PDF
                    </button>

                    <button className="btn-primary" onClick={() => abrirModal()}>
                        <Plus size={20} /> Nuevo Gasto
                    </button>
                </div>
            </div>

            <div className="module-description">
                <p>Registra y controla los costos indirectos de tu negocio como renta, servicios, nómina y empaques.</p>
            </div>

            <div className="toolbar-container">
                <div className="search-wrapper" style={{ maxWidth: '400px' }}>
                    <SearchBar 
                        placeholder="Buscar por concepto o categoría..." 
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

            {/* TABLA LIMPIA: CARGANDO INFINITAMENTE SI HAY ERROR */}
            <div className="table-container">
                {isLoading ? (
                    <Loading texto="Cargando gastos..." />
                ) : (
                    <DataTable
                        data={gastosFiltrados}
                        columns={columns}
                        emptyMessage={searchTerm ? `No se encontraron gastos para "${searchTerm}"` : "No hay gastos registrados."}
                        rowClassName={(g) => (g.activo === false ? 'row-inactiva' : '')}
                        defaultSort={{ key: 'fecha', direction: 'desc' }}
                    />
                )}
            </div>

            {/* MODAL FORMULARIO */}
            <Modal
                isOpen={isModalOpen}
                onClose={cerrarModal}
                title={<span style={{ color: 'var(--color-text)' }}>{editingId ? 'Editar Gasto' : 'Registrar Gasto'}</span>}
                maxWidth="500px"
            >
                <form onSubmit={handleSubmit} className="modal-form">
                    
                    <div className={`form-group ${errors.concepto && touched.concepto ? 'form-group--error' : ''}`}>
                        <label style={labelStyle}>Concepto del Gasto *</label>
                        <input 
                            style={inputStyle}
                            type="text" 
                            name="concepto" 
                            value={formData.concepto} 
                            onChange={handleInputChange}
                            onBlur={() => handleBlur('concepto')}
                            placeholder="Ej. Renta del taller, Recibo de luz..."
                            autoFocus
                        />
                        <FieldError message={touched.concepto ? errors.concepto : undefined} />
                    </div>

                    <div className="form-row">
                        <div className={`form-group ${errors.monto && touched.monto ? 'form-group--error' : ''}`}>
                            <label style={labelStyle}>Monto Total ($) *</label>
                            <input 
                                style={inputStyle}
                                type="number" 
                                name="monto" 
                                value={formData.monto} 
                                onChange={handleInputChange}
                                onBlur={() => handleBlur('monto')}
                                step="0.01"
                                min="0"
                            />
                            <FieldError message={touched.monto ? errors.monto : undefined} />
                        </div>

                        <div className="form-group">
                            <label style={labelStyle}>Categoría *</label>
                            <select style={inputStyle} name="categoria" value={formData.categoria} onChange={handleInputChange} required>
                                <option value="Fijo">Fijo (Renta, Sueldos, Internet)</option>
                                <option value="Variable">Variable (Material empaque, Publicidad)</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label style={labelStyle}>Periodicidad *</label>
                            <select style={inputStyle} name="periodicidad" value={formData.periodicidad} onChange={handleInputChange} required>
                                <option value="UNICA">Única (Un solo pago)</option>
                                <option value="SEMANAL">Semanal</option>
                                <option value="MENSUAL">Mensual</option>
                                <option value="ANUAL">Anual</option>
                            </select>
                        </div>

                        <div className={`form-group ${errors.fecha && touched.fecha ? 'form-group--error' : ''}`}>
                            <label style={labelStyle}>Fecha del Gasto *</label>
                            <input 
                                style={inputStyle}
                                type="date" 
                                name="fecha" 
                                value={formData.fecha} 
                                onChange={handleInputChange}
                                onBlur={() => handleBlur('fecha')}
                            />
                            <FieldError message={touched.fecha ? errors.fecha : undefined} />
                        </div>
                    </div>

                    <div className="form-group">
                        <label style={labelStyle}>Observaciones (Opcional)</label>
                        <textarea 
                            style={inputStyle}
                            name="observaciones" 
                            value={formData.observaciones} 
                            onChange={handleInputChange}
                            placeholder="Anotaciones adicionales..."
                            rows={2}
                        />
                    </div>

                    <div className="modal-footer" style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                        <button type="button" className="btn-secondary" onClick={cerrarModal}>Cancelar</button>
                        <button type="submit" className="btn-primary">
                            {editingId ? 'Guardar Cambios' : 'Registrar Gasto'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* MODAL ELIMINAR */}
            <ConfirmModal
                isOpen={isConfirmOpen}
                title="Enviar a Papelera"
                message={`¿Estás seguro de desactivar el gasto "${gastoAEliminar?.concepto}"? Dejará de aparecer en los reportes.`}
                onConfirm={ejecutarEliminacion}
                onCancel={() => setIsConfirmOpen(false)}
                confirmText="Sí, desactivar"
            />
        </div>
    );
};