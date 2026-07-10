import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Sparkles } from 'lucide-react';

import { SearchBar } from '../../components/ui/SearchBar/SearchBar';
import { Modal } from '../../components/ui/Modal/Modal';
import { ConfirmModal } from '../../components/ConfirmModal';
import { FilterGroup } from '../../components/ui/FilterGroup/FilterGroup';
import { ActionDropdown } from '../../components/ui/ActionDropdown/ActionDropdown';
import { DataTable, type ColumnConfig } from '../../components/ui/DataTable/DataTable';
import { Loading } from '../../components/Loading/Loading';
import { FieldError } from '../../components/ui/FieldError/FieldError';

import {
    obtenerAcabados,
    crearAcabado,
    actualizarAcabado,
    eliminarAcabado,
    reactivarAcabado,
    type AcabadoData
} from '../../services/acabados.service';
import { obtenerProveedores } from '../../services/proveedores.service';

import './Acabados.css';

interface Acabado extends AcabadoData {
    id: string;
}

const requiredMsg = (label: string) => `${label} es obligatorio`;
const validate = (data: AcabadoData): Record<string, string> => {
    const e: Record<string, string> = {};
    if (!data.nombre?.trim()) e.nombre = requiredMsg('El nombre');
    if (Number(data.costoBase) <= 0) e.costoBase = 'El costo base debe ser mayor a 0';
    return e;
};

export const Acabados = () => {
    const [acabados, setAcabados] = useState<Acabado[]>([]);
    const [proveedores, setProveedores] = useState<{ id: string; nombre: string }[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filtros, setFiltros] = useState({ estado: 'activos' });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<AcabadoData>({
        nombre: '',
        descripcion: '',
        tipoCobro: 'FIJO',
        costoBase: 0,
        proveedorId: null,
        activo: true,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [itemAEliminar, setItemAEliminar] = useState<{ id: string; nombre: string } | null>(null);

    const labelStyle = { color: 'var(--color-text)', fontWeight: 700 };
    const inputStyle = { backgroundColor: 'var(--color-background)', color: 'var(--color-text)' };

    useEffect(() => {
        cargarDatos();
    }, [filtros.estado]);

    const cargarDatos = async () => {
        setIsLoading(true);
        try {
            const [acabadosData, proveedoresData] = await Promise.all([
                obtenerAcabados(filtros.estado),
                obtenerProveedores('activos'),
            ]);
            setAcabados(acabadosData);
            setProveedores(proveedoresData);
        } catch (error) {
            toast.error('Error al cargar los datos de acabados');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

    const abrirModal = (acabado?: Acabado) => {
        if (acabado) {
            setEditingId(acabado.id);
            setFormData({
                nombre: acabado.nombre,
                descripcion: acabado.descripcion || '',
                tipoCobro: acabado.tipoCobro,
                costoBase: acabado.costoBase,
                proveedorId: acabado.proveedorId || null,
                activo: acabado.activo,
            });
        } else {
            setEditingId(null);
            setFormData({
                nombre: '',
                descripcion: '',
                tipoCobro: 'FIJO',
                costoBase: 0,
                proveedorId: null,
                activo: true,
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
        setTouched({ nombre: true, costoBase: true });
        if (Object.keys(validationErrors).length > 0) return;

        const loadingToast = toast.loading(editingId ? 'Actualizando acabado...' : 'Registrando acabado...');
        try {
            if (editingId) {
                await actualizarAcabado(editingId, formData);
                toast.success('Acabado actualizado', { id: loadingToast });
            } else {
                await crearAcabado(formData);
                toast.success('Acabado registrado', { id: loadingToast });
            }
            cerrarModal();
            cargarDatos();
        } catch (error) {
            toast.error('Error al guardar el acabado', { id: loadingToast });
        }
    };

    const handleDeleteClick = (id: string, nombre: string) => {
        setItemAEliminar({ id, nombre });
        setIsConfirmOpen(true);
    };

    const handleReactivar = async (id: string) => {
        const loadingToast = toast.loading('Restaurando acabado...');
        try {
            await reactivarAcabado(id);
            toast.success('Acabado restaurado', { id: loadingToast });
            cargarDatos();
        } catch (error) {
            toast.error('Error al restaurar', { id: loadingToast });
        }
    };

    const ejecutarEliminacion = async () => {
        if (!itemAEliminar) return;
        const loadingToast = toast.loading('Eliminando acabado...');
        try {
            await eliminarAcabado(itemAEliminar.id);
            toast.success('Acabado eliminado', { id: loadingToast });
            setIsConfirmOpen(false);
            setItemAEliminar(null);
            cargarDatos();
        } catch (error) {
            toast.error('Error al eliminar el acabado', { id: loadingToast });
        }
    };

    const acabadosFiltrados = acabados.filter(a => {
        const busqueda = searchTerm.toLowerCase();
        const matchSearch = a.nombre.toLowerCase().includes(busqueda) ||
            (a.descripcion && a.descripcion.toLowerCase().includes(busqueda));
        return matchSearch;
    });

    const proveedorNombre = (id: string | number | null | undefined): string => {
        if (!id) return '—';
        const p = proveedores.find(p => p.id === String(id));
        return p?.nombre || '—';
    };

    const columns: ColumnConfig<Acabado>[] = useMemo(() => [
        {
            key: 'nombre',
            label: 'Acabado / Tratamiento',
            width: '220px',
            sortable: true,
            render: (a: Acabado) => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span className="font-medium">{a.nombre}</span>
                    {a.activo === false && <span className="badge-eliminado">Desactivado</span>}
                </div>
            ),
        },
        {
            key: 'descripcion',
            label: 'Descripción',
            sortable: true,
            render: (a: Acabado) => (
                <span className="text-muted">{a.descripcion || '—'}</span>
            ),
        },
        {
            key: 'costoBase',
            label: 'Costo Base',
            width: '150px',
            sortable: true,
            render: (a: Acabado) => (
                <span className="font-price">
                    ${Number(a.costoBase).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </span>
            ),
        },
        {
            key: 'proveedorId',
            label: 'Proveedor',
            width: '180px',
            sortable: true,
            getSortValue: (a: Acabado) => proveedorNombre(a.proveedorId),
            render: (a: Acabado) => (
                <span className="text-muted">{proveedorNombre(a.proveedorId)}</span>
            ),
        },
        {
            key: 'acciones',
            label: '',
            width: '50px',
            align: 'center',
            render: (a: Acabado) => (
                <ActionDropdown
                    variant="contextual"
                    contextualId={a.id}
                    contextualName={a.nombre}
                    onEdit={() => abrirModal(a)}
                    onDelete={a.activo !== false ? (id, nombre) => handleDeleteClick(id!, nombre!) : undefined}
                    onRecover={a.activo === false ? () => handleReactivar(a.id) : undefined}
                    recoverLabel="Reactivar"
                />
            ),
        },
    ], [proveedores]);

    return (
        <div className="module-container">
            <div className="module-header">
                <div className="module-title">
                    <Sparkles size={28} color="var(--color-primary)" />
                    <h2 style={{ color: 'var(--color-primary)' }}>Catálogo de Acabados</h2>
                </div>
                <button className="btn-primary" onClick={() => abrirModal()}>
                    <Plus size={20} /> Nuevo Acabado
                </button>
            </div>

            <div className="module-description">
                <p>Gestiona baños, tratamientos y terminados superficiales. Controla los costos adicionales que cada acabado agrega a tus piezas.</p>
            </div>

            <div className="toolbar-container">
                <div className="search-wrapper" style={{ maxWidth: '350px' }}>
                    <SearchBar
                        placeholder="Buscar acabado..."
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

            <div className="table-container">
                {isLoading ? (
                    <Loading texto="Cargando acabados..." />
                ) : (
                    <DataTable
                        data={acabadosFiltrados}
                        columns={columns}
                        emptyMessage={searchTerm ? `No se encontraron resultados para "${searchTerm}"` : 'No hay acabados registrados.'}
                        rowClassName={(a) => (a.activo === false ? 'row-inactiva' : '')}
                        defaultSort={{ key: 'nombre', direction: 'asc' }}
                    />
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={cerrarModal}
                title={<span style={{ color: 'var(--color-text)' }}>{editingId ? 'Editar Acabado' : 'Nuevo Acabado'}</span>}
                maxWidth="550px"
            >
                <form onSubmit={handleSubmit} className="modal-form">
                    <div className={`form-group ${errors.nombre && touched.nombre ? 'form-group--error' : ''}`}>
                        <label style={labelStyle}>Nombre del Acabado *</label>
                        <input
                            style={inputStyle}
                            type="text"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleInputChange}
                            onBlur={() => handleBlur('nombre')}
                            placeholder="Ej. Baño de Oro 18k, Rodio Negro..."
                            autoFocus
                            required
                        />
                        <FieldError message={touched.nombre ? errors.nombre : undefined} />
                    </div>

                    <div className="form-group">
                        <label style={labelStyle}>Descripción (Opcional)</label>
                        <textarea
                            style={inputStyle}
                            name="descripcion"
                            value={formData.descripcion || ''}
                            onChange={handleInputChange}
                            placeholder="Describe el proceso, durabilidad o notas técnicas..."
                            rows={3}
                        />
                    </div>

                    <div className="form-group">
                        <label style={labelStyle}>Tipo de Cobro *</label>
                        <select
                            style={inputStyle}
                            name="tipoCobro"
                            value={formData.tipoCobro}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="FIJO">Fijo</option>
                            <option value="POR_PIEZA">Por Pieza</option>
                            <option value="POR_GRAMO">Por Gramo</option>
                            <option value="POR_LOTE">Por Lote</option>
                        </select>
                    </div>

                    <div className="form-row">
                        <div className={`form-group ${errors.costoBase && touched.costoBase ? 'form-group--error' : ''}`}>
                            <label style={labelStyle}>Costo Base ($) *</label>
                            <input
                                style={inputStyle}
                                type="number"
                                name="costoBase"
                                value={formData.costoBase}
                                onChange={handleInputChange}
                                onBlur={() => handleBlur('costoBase')}
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                required
                            />
                            <FieldError message={touched.costoBase ? errors.costoBase : undefined} />
                        </div>

                        <div className="form-group">
                            <label style={labelStyle}>Proveedor (Opcional)</label>
                            <ActionDropdown
                                value={formData.proveedorId ? String(formData.proveedorId) : ''}
                                options={proveedores}
                                onChange={(val) => setFormData(prev => ({ ...prev, proveedorId: val || null }))}
                                placeholder="Selecciona proveedor"
                            />
                        </div>
                    </div>

                    <div className="modal-footer" style={{
                        marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--color-border)',
                        display: 'flex', justifyContent: 'flex-end', gap: '12px'
                    }}>
                        <button type="button" className="btn-secondary" onClick={cerrarModal}>Cancelar</button>
                        <button type="submit" className="btn-primary">
                            {editingId ? 'Guardar Cambios' : 'Registrar Acabado'}
                        </button>
                    </div>
                </form>
            </Modal>

            <ConfirmModal
                isOpen={isConfirmOpen}
                title="Enviar a Papelera"
                message={`¿Estás seguro de desactivar el acabado "${itemAEliminar?.nombre}"? Dejará de aparecer en las listas de producción.`}
                onConfirm={ejecutarEliminacion}
                onCancel={() => setIsConfirmOpen(false)}
                confirmText="Sí, desactivar"
            />
        </div>
    );
};
