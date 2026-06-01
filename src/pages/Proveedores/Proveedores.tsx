import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Pencil, Trash2, Package, X, ChevronDown, ChevronUp, RefreshCcw, Copy} from 'lucide-react';
import { 
    obtenerProveedores, 
    crearProveedor, 
    actualizarProveedor, 
    eliminarProveedor,
    reactivarProveedor,
    type ProveedorData 
} from '../../services/proveedores.service';
import { SearchBar } from '../../components/ui/SearchBar/SearchBar';
import { FilterSelect } from '../../components/ui/FilterSelect/FilterSelect';
import { ConfirmModal } from '../../components/ConfirmModal';
import { formatPhone, formatPhoneInput } from '../../utils/formatters';
import './Proveedores.css';

interface Proveedor extends ProveedorData {
    id: string;
}

export const Proveedores = () => {
    // === ESTADOS GLOBALES ===
    const [proveedores, setProveedores] = useState<Proveedor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Controles de Búsqueda y Filtro
    const [searchTerm, setSearchTerm] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('activos');
    const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
    const copiarTexto = async (texto: string, mensaje: string) => {
    try {
        await navigator.clipboard.writeText(texto);
        toast.success(mensaje);
    } catch {
        toast.error('No se pudo copiar');
    }
};
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

    // Estados de Confirmación (Eliminar)
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [proveedorAEliminar, setProveedorAEliminar] = useState<{id: string, nombre: string} | null>(null);
    
    // === EFECTOS ===
    useEffect(() => {
        cargarProveedores();
        setExpandedRowId(null); 
    }, [filtroEstado]);

    // === LÓGICA DE FILTRADO ===
    const proveedoresFiltrados = proveedores.filter(prov => {
        const busqueda = searchTerm.toLowerCase();
        return (
            prov.nombre.toLowerCase().includes(busqueda) ||
            (prov.emails && prov.emails.some(email => email.toLowerCase().includes(busqueda))) ||
            (prov.telefonos && prov.telefonos.some(tel => tel.includes(busqueda))) 
        );
    });

    // === FUNCIONES DE RED ===
    const cargarProveedores = async () => {
        setIsLoading(true);
        try {
            const data = await obtenerProveedores(filtroEstado);
            setProveedores(data);
        } catch (error) {
            toast.error('Error al cargar los proveedores');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.nombre.trim()) {
            toast.error('El nombre del proveedor es obligatorio');
            return;
        }

        // Limpiamos los arreglos antes de enviar a Prisma
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

    // === MANEJADORES DE INTERFAZ ===
    const toggleRow = (id: string) => setExpandedRowId(expandedRowId === id ? null : id);

    // Manejador para inputs de texto simples
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setFormData(prev => {
        if (name === 'telefono') {
            return {
                ...prev,
                telefonos: [formatPhoneInput(value)]
            };
        }

        if (name === 'email') {
            return {
                ...prev,
                emails: [value]
            };
        }

        return {
            ...prev,
            [name]: value
        };
    });
};

    // === MANEJADORES DE ARREGLOS DINÁMICOS ===
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

    // === CONTROLES DEL MODAL ===
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

    return (
        <div className="module-container">
            {/* CABECERA */}
            <div className="module-header">
                <div className="module-title">
                    <Package size={28} color="var(--color-primary)" />
                    <h2>Catálogo de Proveedores</h2>
                </div>
                
                <div className="header-actions">
                    <SearchBar 
                        placeholder="Buscar proveedor..." 
                        value={searchTerm} 
                        onChange={setSearchTerm} 
                    />
                    <FilterSelect 
                        value={filtroEstado}
                        onChange={setFiltroEstado}
                        options={[
                            { value: 'activos', label: 'Ver Activos' },
                            { value: 'inactivos', label: 'Papelera (Inactivos)' },
                            { value: 'todos', label: 'Ver Todos' }
                        ]}
                    />
                    <button className="btn-primary" onClick={() => abrirModal()}>
                        <Plus size={20} />
                        Nuevo Proveedor
                    </button>
                </div>
            </div>
            <div className="module-description">
                <p>Administra la información de tus proveedores y mantén organizado el registro de contactos y materiales.</p>
            </div>

            {/* TABLA PRINCIPAL */}
            <div className="table-container">
                {isLoading ? (
                    <div className="loading-state">Cargando proveedores...</div>
                ) : proveedores.length === 0 ? (
                    <div className="empty-state">No hay proveedores en esta categoría.</div>
                ) : proveedoresFiltrados.length === 0 ? (
                    <div className="empty-state">No se encontraron resultados para "{searchTerm}"</div>
                ) : (
                    <table className="kyro-table">
                        <thead>
                            <tr>
                                <th style={{ width: '50px' }}></th>
                                <th>Nombre</th>
                                <th>Teléfono</th>
                                <th>Email</th>
                                <th className="text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {proveedoresFiltrados.map((prov) => (
                                <React.Fragment key={prov.id}>
                                    {/* FILA PRINCIPAL */}
                                    <tr className={expandedRowId === prov.id ? 'active-row' : ''}>
                                        <td className="text-center">
                                            <button className="btn-icon expand" onClick={() => toggleRow(prov.id)} title="Ver detalles">
                                                {expandedRowId === prov.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                            </button>
                                        </td>
                                        <td className="font-medium">
                                            {prov.nombre}
                                            {prov.activo === false && (
                                                <span className="badge-inactivo">Inactivo</span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="copy-field">
                                                <span>
                                                    {prov.telefonos?.[0] ? formatPhone(prov.telefonos[0]) : '-'}
                                                </span>

                                                {prov.telefonos?.[0] && (
                                                    <button
                                                        className="copy-btn"
                                                        onClick={() =>
                                                            copiarTexto(
                                                                prov.telefonos![0],
                                                                'Teléfono copiado'
                                                            )
                                                        }
                                                        title="Copiar teléfono"
                                                    >
                                                        <Copy size={14} />
                                                    </button>
                                                )}

                                                {prov.telefonos && prov.telefonos.length > 1 && (
                                                    <span className="badge-count">
                                                        +{prov.telefonos.length - 1}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="copy-field">
                                                <span>{prov.emails?.[0] || '-'}</span>

                                                {prov.emails?.[0] && (
                                                    <button
                                                        className="copy-btn"
                                                        onClick={() =>
                                                            copiarTexto(
                                                                prov.emails![0],
                                                                'Correo copiado'
                                                            )
                                                        }
                                                        title="Copiar correo"
                                                    >
                                                        <Copy size={14} />
                                                    </button>
                                                )}

                                                {prov.emails && prov.emails.length > 1 && (
                                                    <span className="badge-count">
                                                        +{prov.emails.length - 1}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="actions-cell">
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
                                        </td>
                                    </tr>

                                    {/* FILA EXPANDIDA */}
                                    {expandedRowId === prov.id && (
                                        <tr className="expanded-detail-row">
                                            <td colSpan={5}>
                                                <div className="expanded-content">
                                                    <div className="detail-column">
                                                        <span className="detail-label">Teléfonos</span>
                                                        {prov.telefonos && prov.telefonos.length > 0 ? (
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                                {prov.telefonos.map((tel, i) => (
                                                                    <div key={i} className="copy-field">
                                                                        <span className="detail-value">
                                                                            {formatPhone(tel)}
                                                                        </span>

                                                                        <button
                                                                            className="copy-btn"
                                                                            onClick={() => copiarTexto(tel, 'Teléfono copiado')}
                                                                        >
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
                                                                        <span className="detail-value">
                                                                            {email}
                                                                        </span>

                                                                        <button
                                                                            className="copy-btn"
                                                                            onClick={() => copiarTexto(email, 'Correo copiado')}
                                                                        >
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
                                                                <a href={prov.paginaWeb} target="_blank" rel="noreferrer" className="detail-link">Sitio Web</a>
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
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
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
                                {/* ARREGLO DINÁMICO DE TELÉFONOS */}
                                <div className="form-group">
                                    <label>Teléfonos de Contacto</label>
                                    {formData.telefonos?.map((tel, index) => (
                                        <div key={`tel-${index}`} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                            <input 
                                                type="tel"
                                                value={tel}
                                                onChange={(e) => handleArrayChange(index, 'telefonos', e.target.value)}
                                                placeholder={index === 0 ? "+52 415 120 2020 " : "Telefono Adicional"}
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

                                {/* ARREGLO DINÁMICO DE CORREOS */}
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
                                        type="url" 
                                        name="paginaWeb" 
                                        value={formData.paginaWeb} 
                                        onChange={handleInputChange}
                                        placeholder="https://www..."
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