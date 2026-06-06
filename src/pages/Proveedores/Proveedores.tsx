import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Pencil, Trash2, Package, X, ChevronDown, ChevronUp, RefreshCcw, Copy, ExternalLink } from 'lucide-react';
import { 
    obtenerProveedores, 
    crearProveedor, 
    actualizarProveedor, 
    eliminarProveedor,
    reactivarProveedor,
    type ProveedorData 
} from '../../services/proveedores.service';
import { SearchBar } from '../../components/ui/SearchBar/SearchBar';
import { ConfirmModal } from '../../components/ConfirmModal';
import { FilterGroup } from '../../components/ui/FilterGroup/FilterGroup';
import { DataTable, type ColumnConfig } from '../../components/ui/DataTable/DataTable';
import { formatPhone, formatPhoneInput } from '../../utils/formatters';
import './Proveedores.css';

interface Proveedor extends ProveedorData {
    id: string;
}

export const Proveedores = () => {
    // === ESTADOS GLOBALES ===
    const [proveedores, setProveedores] = useState<Proveedor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Controles de Búsqueda y Filtros Unificados
    const [searchTerm, setSearchTerm] = useState('');
    const [filtros, setFiltros] = useState({
        estado: 'activos'
    });
    const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

    // Estados del Modal (Formulario)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<ProveedorData>({
        nombre: '',
        domicilio: '',
        telefonos: [''],
        emails: [''],
        paginaWeb: '',
        redesSociales: '',
        observaciones: ''
    });
    // === HELPER PARA URLS ===
    const formatearUrl = (url: string) => {
        if (!url) return '';
        // Si no empieza con http:// o https://, se lo agregamos
        if (!url.match(/^https?:\/\//i)) {
            return `https://${url}`;
        }
        return url;
    };

    // Estados de Confirmación (Eliminar)
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [proveedorAEliminar, setProveedorAEliminar] = useState<{id: string, nombre: string} | null>(null);
    
    // === EFECTOS ===
    useEffect(() => {
        cargarProveedores();
        setExpandedRowId(null); 
    }, [filtros.estado]);

    // === FUNCIONES DE RED ===
    const cargarProveedores = async () => {
        setIsLoading(true);
        try {
            const data = await obtenerProveedores(filtros.estado);
            setProveedores(data);
        } catch (error) {
            toast.error('Error al cargar los proveedores');
        } finally {
            setIsLoading(false);
        }
    };

    const copiarTexto = async (texto: string, mensaje: string) => {
        try {
            await navigator.clipboard.writeText(texto);
            toast.success(mensaje);
        } catch {
            toast.error('No se pudo copiar');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.nombre.trim()) {
            toast.error('El nombre del proveedor es obligatorio');
            return;
        }

        const datosLimpios = {
            ...formData,
            telefonos: formData.telefonos?.filter(tel => tel.trim() !== ''),
            emails: formData.emails?.filter(email => email.trim() !== '')
        };

        const loadingToast = toast.loading(editingId ? 'Actualizando...' : 'Guardando...');

        try {
            if (editingId) {
                await actualizarProveedor(editingId, datosLimpios);
                toast.success('Proveedor actualizado', { id: loadingToast });
            } else {
                await crearProveedor(datosLimpios);
                toast.success('Proveedor registrado', { id: loadingToast });
            }
            cerrarModal();
            cargarProveedores(); 
        } catch (error: any) {
            const errorMsg = error.response?.data?.error || 'Ocurrió un error al guardar';
            toast.error(errorMsg, { id: loadingToast });
        }
    };

    // === FUNCIONES DE ELIMINACIÓN/REACTIVACIÓN ===
    const handleDeleteClick = (id: string, nombre: string) => {
        setProveedorAEliminar({ id, nombre });
        setIsConfirmOpen(true);
    };

    const ejecutarEliminacion = async () => {
        if (!proveedorAEliminar) return;
        const loadingToast = toast.loading('Eliminando...');
        try {
            await eliminarProveedor(proveedorAEliminar.id);
            toast.success('Proveedor eliminado', { id: loadingToast });
            setIsConfirmOpen(false);
            setProveedorAEliminar(null);
            cargarProveedores();
        } catch (error) {
            toast.error('Error al eliminar', { id: loadingToast });
        }
    };

    const handleReactivar = async (id: string) => {
        const loadingToast = toast.loading('Reactivando proveedor...');
        try {
            await reactivarProveedor(id);
            toast.success('Proveedor reactivado exitosamente', { id: loadingToast });
            cargarProveedores();
        } catch (error) {
            toast.error('Error al reactivar', { id: loadingToast });
        }
    };

    // === MANEJADORES DE INTERFAZ Y ARREGLOS ===
    const toggleRow = (id: string) => setExpandedRowId(expandedRowId === id ? null : id);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => {
            if (name === 'telefono') return { ...prev, telefonos: [formatPhoneInput(value)] };
            if (name === 'email') return { ...prev, emails: [value] };
            return { ...prev, [name]: value };
        });
    };

    const handleArrayChange = (index: number, field: 'telefonos' | 'emails', value: string) => {
        setFormData(prev => {
            const newArray = [...(prev[field] || [])];
            newArray[index] = field === 'telefonos' ? formatPhoneInput(value) : value;
            return { ...prev, [field]: newArray };
        });
    };

    const addArrayItem = (field: 'telefonos' | 'emails') => {
        setFormData(prev => ({ ...prev, [field]: [...(prev[field] || []), ''] }));
    };

    const removeArrayItem = (index: number, field: 'telefonos' | 'emails') => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field]?.filter((_, i) => i !== index) || []
        }));
    };

    const abrirModal = (proveedor?: Proveedor) => {
        if (proveedor) {
            setEditingId(proveedor.id);
            setFormData({
                nombre: proveedor.nombre,
                domicilio: proveedor.domicilio || '',
                telefonos: proveedor.telefonos && proveedor.telefonos.length > 0 ? proveedor.telefonos : [''],
                emails: proveedor.emails && proveedor.emails.length > 0 ? proveedor.emails : [''],
                paginaWeb: proveedor.paginaWeb || '',
                redesSociales: proveedor.redesSociales || '',
                observaciones: proveedor.observaciones || ''
            });
        } else {
            setEditingId(null);
            setFormData({ 
                nombre: '', domicilio: '', telefonos: [''], 
                emails: [''], paginaWeb: '', redesSociales: '', observaciones: '' 
            });
        }
        setIsModalOpen(true);
    };

    const cerrarModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
    };

    // === FILTRADO EN MEMORIA ===
    const proveedoresFiltrados = proveedores.filter(prov => {
        const busqueda = searchTerm.toLowerCase();
        return (
            prov.nombre.toLowerCase().includes(busqueda) ||
            (prov.emails && prov.emails.some(email => email.toLowerCase().includes(busqueda))) ||
            (prov.telefonos && prov.telefonos.some(tel => tel.includes(busqueda))) 
        );
    });

    // === CONFIGURACIÓN DE COLUMNAS PARA DATATABLE ===
    const columns: ColumnConfig<Proveedor>[] = useMemo(() => [
        {
            key: 'expand',
            label: '',
            width: '50px',
            align: 'center',
            render: (prov: Proveedor) => (
                <button className="btn-icon expand" onClick={() => toggleRow(prov.id)} title="Ver detalles">
                    {expandedRowId === prov.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
            )
        },
        {
            key: 'nombre',
            label: 'Nombre',
            sortable: true,
            render: (prov: Proveedor) => (
                <span className="font-medium">
                    {prov.nombre}
                    {prov.activo === false && <span className="badge-inactivo">Inactivo</span>}
                </span>
            )
        },
        {
            key: 'telefono',
            label: 'Teléfono',
            sortable: true,
            getSortValue: (prov: Proveedor) => prov.telefonos?.[0] || '',
            render: (prov: Proveedor) => (
                <div className="copy-field">
                    <span>{prov.telefonos?.[0] ? formatPhone(prov.telefonos[0]) : '-'}</span>
                    {prov.telefonos?.[0] && (
                        <button className="copy-btn" onClick={() => copiarTexto(prov.telefonos![0], 'Teléfono copiado')} title="Copiar teléfono">
                            <Copy size={14} />
                        </button>
                    )}
                    {prov.telefonos && prov.telefonos.length > 1 && (
                        <span className="badge-count">+{prov.telefonos.length - 1}</span>
                    )}
                </div>
            )
        },
        {
            key: 'email',
            label: 'Email',
            sortable: true,
            getSortValue: (prov: Proveedor) => prov.emails?.[0] || '',
            render: (prov: Proveedor) => (
                <div className="copy-field">
                    <span>{prov.emails?.[0] || '-'}</span>
                    {prov.emails?.[0] && (
                        <button className="copy-btn" onClick={() => copiarTexto(prov.emails![0], 'Correo copiado')} title="Copiar correo">
                            <Copy size={14} />
                        </button>
                    )}
                    {prov.emails && prov.emails.length > 1 && (
                        <span className="badge-count">+{prov.emails.length - 1}</span>
                    )}
                </div>
            )
        },
        {
            key: 'acciones',
            label: 'Acciones',
            align: 'center',
            width: '120px',
            render: (prov: Proveedor) => (
                <div className="actions-cell">
                    <button className="btn-icon edit" onClick={() => abrirModal(prov)} title="Editar">
                        <Pencil size={18} />
                    </button>
                    {prov.activo === false ? (
                        <button className="btn-icon reactivate" onClick={() => handleReactivar(prov.id)} title="Reactivar">
                            <RefreshCcw size={18} />
                        </button>
                    ) : (
                        <button className="btn-icon delete" onClick={() => handleDeleteClick(prov.id, prov.nombre)} title="Eliminar">
                            <Trash2 size={18} />
                        </button>
                    )}
                </div>
            )
        }
    ], [expandedRowId]);

    // === RENDERIZADO DE LA FILA DE DETALLE EXPANDIBLE ===
    const renderDetailRow = (prov: Proveedor) => {
        if (expandedRowId !== prov.id) return null;
        return (
            <tr className="expanded-detail-row">
                <td colSpan={5}>
                    <div className="expanded-content">
                        <div className="detail-column">
                            <span className="detail-label">Teléfonos</span>
                            {prov.telefonos && prov.telefonos.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    {prov.telefonos.map((tel, i) => (
                                        <div key={i} className="copy-field">
                                            <span className="detail-value">{formatPhone(tel)}</span>
                                            <button className="copy-btn" onClick={() => copiarTexto(tel, 'Teléfono copiado')}>
                                                <Copy size={13} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : <span className="detail-value">No registrado</span>}
                        </div>

                        <div className="detail-column">
                            <span className="detail-label">Correos</span>
                            {prov.emails && prov.emails.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    {prov.emails.map((email, i) => (
                                        <div key={i} className="copy-field">
                                            <span className="detail-value">{email}</span>
                                            <button className="copy-btn" onClick={() => copiarTexto(email, 'Correo copiado')}>
                                                <Copy size={13} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : <span className="detail-value">No registrado</span>}
                        </div>

                        <div className="detail-column">
                            <span className="detail-label">Domicilio</span>
                            <span className="detail-value">{prov.domicilio || 'No registrado'}</span>
                        </div>
                        
                        <div className="detail-column">
                            <span className="detail-label">Web / Redes</span>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                {prov.paginaWeb ? (
                                    <a 
                                        href={formatearUrl(prov.paginaWeb)} 
                                        target="_blank" 
                                        rel="noreferrer" 
                                        className="detail-link"
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 500 }}
                                    >
                                        <ExternalLink size={14} />
                                        Visitar sitio web
                                    </a>
                                ) : <span className="detail-value">Sin Web</span>}
                                <span className="detail-value">{prov.redesSociales || 'Sin redes sociales'}</span>
                            </div>
                        </div>

                        <div className="detail-column full-width">
                            <span className="detail-label">Observaciones</span>
                            <span className="detail-value">{prov.observaciones || 'Sin observaciones adicionales.'}</span>
                        </div>
                    </div>
                </td>
            </tr>
        );
    };

    return (
        <div className="module-container">
            {/* CABECERA */}
            <div className="module-header">
                <div className="module-title">
                    <Package size={28} color="var(--color-primary)" />
                    <h2>Catálogo de Proveedores</h2>
                </div>
                <button className="btn-primary" onClick={() => abrirModal()}>
                    <Plus size={20} /> Nuevo Proveedor
                </button>
            </div>
            
            <div className="module-description">
                <p>Administra la información de tus proveedores y mantén organizado el registro de contactos y materiales.</p>
            </div>

            {/* BARRA DE HERRAMIENTAS UNIFICADA (Idéntica a Materiales) */}
            <div className="toolbar-container">
                <div className="search-wrapper">
                    <SearchBar 
                        placeholder="Buscar proveedor..." 
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
                                { id: 'inactivos', nombre: 'Papelera (Inactivos)' },
                                { id: 'todos', nombre: 'Ver Todos' }
                            ]
                        }
                    ]}
                />
            </div>

            {/* TABLA PRINCIPAL */}
            <div className="table-container">
                {isLoading ? (
                    <div className="loading-state">Cargando proveedores...</div>
                ) : (
                    <DataTable
                        data={proveedoresFiltrados}
                        columns={columns}
                        className="providers-table"
                        emptyMessage={searchTerm ? `No se encontraron resultados para "${searchTerm}"` : "No hay proveedores en esta categoría."}
                        rowClassName={(prov) => (prov.activo === false ? 'row-inactiva' : '')}
                        renderDetailRow={renderDetailRow} 
                        defaultSort={{ key: 'nombre', direction: 'asc' }}
                    />
                )}
            </div>

            {/* MODAL FORMULARIO */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '650px' }}>
                        <div className="modal-header">
                            <h3>{editingId ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h3>
                            <button className="btn-close" onClick={cerrarModal}><X size={20} /></button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="modal-form">
                            <div className="form-group">
                                <label>Nombre de la Empresa *</label>
                                <input 
                                    type="text" 
                                    name="nombre" 
                                    value={formData.nombre} 
                                    onChange={handleInputChange}
                                    placeholder="Ej. Metales del Centro"
                                    autoFocus
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Teléfonos de Contacto</label>
                                    {formData.telefonos?.map((tel, index) => (
                                        <div key={`tel-${index}`} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                            <input 
                                                type="tel"
                                                value={tel}
                                                onChange={(e) => handleArrayChange(index, 'telefonos', e.target.value)}
                                                placeholder={index === 0 ? "+52 415 120 2020 " : "Teléfono Adicional"}
                                            />
                                            {formData.telefonos!.length > 1 && (
                                                <button type="button" className="btn-icon delete" onClick={() => removeArrayItem(index, 'telefonos')}>
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    {formData.telefonos!.length < 3 && (
                                        <button type="button" className="btn-add-item" onClick={() => addArrayItem('telefonos')}>
                                            + Agregar otro teléfono
                                        </button>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label>Correos Electrónicos</label>
                                    {formData.emails?.map((email, index) => (
                                        <div key={`email-${index}`} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                            <input 
                                                type="email"
                                                value={email}
                                                onChange={(e) => handleArrayChange(index, 'emails', e.target.value)}
                                                placeholder={index === 0 ? "ventas@ejemplo.com" : "Correo Adicional"}
                                            />
                                            {formData.emails!.length > 1 && (
                                                <button type="button" className="btn-icon delete" onClick={() => removeArrayItem(index, 'emails')}>
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    {formData.emails!.length < 3 && (
                                        <button type="button" className="btn-add-item" onClick={() => addArrayItem('emails')}>
                                            + Agregar otro correo
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Domicilio</label>
                                <input 
                                    type="text" 
                                    name="domicilio" 
                                    value={formData.domicilio} 
                                    onChange={handleInputChange}
                                    placeholder="Ej. Calle Industrial 123, Zona Centro"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Página Web</label>
                                    <input 
                                        type="text" 
                                        name="paginaWeb" 
                                        value={formData.paginaWeb} 
                                        onChange={handleInputChange}
                                        placeholder="www.empresa.com"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Redes Sociales</label>
                                    <input 
                                        type="text" 
                                        name="redesSociales" 
                                        value={formData.redesSociales} 
                                        onChange={handleInputChange}
                                        placeholder="Ej. @proveedor_ig"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Observaciones</label>
                                <textarea 
                                    name="observaciones" 
                                    value={formData.observaciones} 
                                    onChange={handleInputChange}
                                    placeholder="Detalles de envíos, horarios de atención, etc."
                                    rows={3}
                                />
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn-secondary" onClick={cerrarModal}>Cancelar</button>
                                <button type="submit" className="btn-primary">
                                    {editingId ? 'Guardar Cambios' : 'Crear Proveedor'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmModal 
                isOpen={isConfirmOpen}
                title="Eliminar Proveedor"
                message={`¿Estás seguro de que deseas dar de baja a "${proveedorAEliminar?.nombre}"? Pasará a la papelera.`}
                onConfirm={ejecutarEliminacion}
                onCancel={() => setIsConfirmOpen(false)}
                confirmText="Sí, eliminar"
            />
        </div>
    );
};