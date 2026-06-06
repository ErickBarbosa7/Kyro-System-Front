import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Pencil, Trash2, Receipt, Calendar, FileText } from 'lucide-react';

// IMPORTACIONES DE COMPONENTES
import { SearchBar } from '../../components/ui/SearchBar/SearchBar';
import { ConfirmModal } from '../../components/ConfirmModal';
import { Modal } from '../../components/ui/Modal/Modal';
import { DataTable, type ColumnConfig } from '../../components/ui/DataTable/DataTable';

// SERVICIOS
import { 
    obtenerGastos, 
    crearGasto, 
    actualizarGasto, 
    eliminarGasto, 
    type GastoOperativo 
} from '../../services/gastos-operativos.service';

import { generarPDFGastos } from '../../utils/reportes';

import './GastosOperativos.css'; 

// Interfaz local para manejar los inputs del formulario
interface FormState {
    concepto: string;
    monto: string | number;
    categoria: string;
    periodicidad: string;
    fecha: string;
    observaciones: string;
}

export const GastosOperativos = () => {
    // === ESTADOS ===
    const [gastos, setGastos] = useState<GastoOperativo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal Formulario
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    
    // Estado del formulario alineado con el backend (Zod)
    const [formData, setFormData] = useState<FormState>({
        concepto: '',
        monto: '', 
        categoria: 'Fijo', 
        periodicidad: 'UNICA', 
        fecha: new Date().toISOString().split('T')[0], 
        observaciones: ''
    });

    // Modal Confirmación
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [gastoAEliminar, setGastoAEliminar] = useState<{ id: string, concepto: string } | null>(null);

    // === EFECTOS ===
    useEffect(() => {
        cargarGastos();
    }, []);

    const cargarGastos = async () => {
        setIsLoading(true);
        try {
            const data = await obtenerGastos();
            setGastos(data);
        } catch (error) {
            toast.error('Error al cargar los gastos operativos');
        } finally {
            setIsLoading(false);
        }
    };

    // === LÓGICA DE FORMULARIO ===
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const parsedValue = type === 'number' ? (value === '' ? '' : Number(value)) : value;
        setFormData(prev => ({ ...prev, [name]: parsedValue }));
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
        setIsModalOpen(true);
    };

    const cerrarModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
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
                    <button className="btn-icon delete" onClick={() => handleDeleteClick(g.id, g.concepto)} title="Eliminar">
                        <Trash2 size={18} />
                    </button>
                </div>
            )
        }
    ], []);

    return (
        <div className="module-container">
            {/* CABECERA CON BOTÓN DE PDF */}
            <div className="module-header">
                <div className="module-title">
                    <Receipt size={28} color="var(--color-primary)" />
                    <h2>Gastos Operativos</h2>
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
            </div>

            <div className="table-container">
                {isLoading ? (
                    <div className="loading-state">Cargando gastos...</div>
                ) : (
                    <DataTable
                        data={gastosFiltrados}
                        columns={columns}
                        emptyMessage={searchTerm ? `No se encontraron gastos para "${searchTerm}"` : "No hay gastos registrados."}
                        defaultSort={{ key: 'fecha', direction: 'desc' }}
                    />
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={cerrarModal}
                title={editingId ? 'Editar Gasto' : 'Registrar Gasto'}
                maxWidth="500px"
            >
                <form onSubmit={handleSubmit} className="modal-form">
                    
                    <div className="form-group">
                        <label>Concepto del Gasto *</label>
                        <input 
                            type="text" 
                            name="concepto" 
                            value={formData.concepto} 
                            onChange={handleInputChange}
                            placeholder="Ej. Renta del taller, Recibo de luz..."
                            autoFocus
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Monto Total ($) *</label>
                            <input 
                                type="number" 
                                name="monto" 
                                value={formData.monto} 
                                onChange={handleInputChange}
                                step="0.01"
                                min="0"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Categoría *</label>
                            <select name="categoria" value={formData.categoria} onChange={handleInputChange} required>
                                <option value="Fijo">Fijo (Renta, Sueldos, Internet)</option>
                                <option value="Variable">Variable (Material empaque, Publicidad)</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Periodicidad *</label>
                            <select name="periodicidad" value={formData.periodicidad} onChange={handleInputChange} required>
                                <option value="UNICA">Única (Un solo pago)</option>
                                <option value="SEMANAL">Semanal</option>
                                <option value="MENSUAL">Mensual</option>
                                <option value="ANUAL">Anual</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Fecha del Gasto *</label>
                            <input 
                                type="date" 
                                name="fecha" 
                                value={formData.fecha} 
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Observaciones (Opcional)</label>
                        <textarea 
                            name="observaciones" 
                            value={formData.observaciones} 
                            onChange={handleInputChange}
                            placeholder="Anotaciones adicionales..."
                            rows={2}
                        />
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-secondary" onClick={cerrarModal}>Cancelar</button>
                        <button type="submit" className="btn-primary">
                            {editingId ? 'Guardar Cambios' : 'Registrar Gasto'}
                        </button>
                    </div>
                </form>
            </Modal>

            <ConfirmModal
                isOpen={isConfirmOpen}
                title="Eliminar Gasto"
                message={`¿Estás seguro de eliminar el registro de "${gastoAEliminar?.concepto}"? Esta acción se reflejará en tus reportes financieros.`}
                onConfirm={ejecutarEliminacion}
                onCancel={() => setIsConfirmOpen(false)}
                confirmText="Sí, eliminar"
            />
        </div>
    );
};