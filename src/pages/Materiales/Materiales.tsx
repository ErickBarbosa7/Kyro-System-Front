import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Pencil, Trash2, Box, Image as ImageIcon, AlertTriangle, RefreshCcw } from 'lucide-react';
import { SearchBar } from '../../components/ui/SearchBar/SearchBar';
import { FilterSelect } from '../../components/ui/FilterSelect/FilterSelect';
import { ConfirmModal } from '../../components/ConfirmModal';
import { ActionDropdown } from '../../components/ui/ActionDropdown/ActionDropdown';
import { Modal } from '../../components/ui/Modal/Modal'; 
import { FilterGroup, type FilterConfig } from '../../components/ui/FilterGroup/FilterGroup';

// COMPONENTES EXTERNOS
import { CategoriaModal } from './CategoriaModal/CategoriaModal';
import { UnidadMedidaModal } from './UnidadMedidaModal/UnidadMedidaModal';

// SERVICIOS
import { reactivarCategoria, obtenerCategorias, eliminarCategoria, type CategoriaMaterial } from '../../services/categorias-materiales.service'; 
import { obtenerUnidades, eliminarUnidad, reactivarUnidad } from '../../services/unidades-medida.service';
import { obtenerMateriales, crearMaterial, actualizarMaterial, eliminarMaterial, reactivarMaterial, type Material, type MaterialFormData } from '../../services/materiales.service';
import { obtenerProveedores } from '../../services/proveedores.service';

import './Materiales.css';

export const Materiales = () => {
    // === ESTADOS ===
    const [materiales, setMateriales] = useState<Material[]>([]);
    const [proveedores, setProveedores] = useState<{ id: string; nombre: string }[]>([]);
    const [categorias, setCategorias] = useState<CategoriaMaterial[]>([]);
    const [unidades, setUnidades] = useState<{ id: string; nombre: string }[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('activos');
    const [filtros, setFiltros] = useState({
        estado: 'activos', // Este viaja al backend
        categoriaId: '',   // Este filtra en memoria (frontend)
        proveedorId: ''    // Este filtra en memoria (frontend)
    });
    // Modal Materiales
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<MaterialFormData>({
        nombre: '', categoriaId: '', proveedorId: '', unidadMedidaId: '', 
        precioCompra: 0, cantidadComprada: 0, stockMinimo: 0, stockMaximo: 0, imagenUrl: '',
    });

    // Modales Secundarios (Categorías y Unidades)
    const [isCategoriaModalOpen, setIsCategoriaModalOpen] = useState(false);
    const [categoriaAEditar, setCategoriaAEditar] = useState<{ id: string; nombre: string; descripcion?: string } | null>(null);
    
    const [isUnidadModalOpen, setIsUnidadModalOpen] = useState(false);
    const [unidadAEditar, setUnidadAEditar] = useState<{ id: string; nombre: string } | null>(null);

    // Papeleras de Reciclaje
    const [isPapeleraCategoriasOpen, setIsPapeleraCategoriasOpen] = useState(false);
    const [categoriasInactivas, setCategoriasInactivas] = useState<CategoriaMaterial[]>([]);
    
    const [isPapeleraUnidadesOpen, setIsPapeleraUnidadesOpen] = useState(false);
    const [unidadesInactivas, setUnidadesInactivas] = useState<{ id: string; nombre: string }[]>([]);

    // Confirmación (Eliminar)
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [itemAEliminar, setItemAEliminar] = useState<{ id: string, nombre: string, tipo: 'material' | 'categoria' | 'unidad'} | null>(null);

    // === EFECTOS ===
    useEffect(() => {
        cargarDatos();
    }, [filtroEstado]);

    const cargarDatos = async () => {
        setIsLoading(true);
        try {
            const [materialesData, proveedoresData, categoriasData, unidadesData] = await Promise.all([
                obtenerMateriales(filtroEstado),
                obtenerProveedores('activos'),
                obtenerCategorias('activas'),
                obtenerUnidades('activas')
            ]);
            setMateriales(materialesData);
            setProveedores(proveedoresData);
            setCategorias(categoriasData);
            setUnidades(unidadesData);
        } catch (error) {
            toast.error('Error al cargar la información');
        } finally {
            setIsLoading(false);
        }
    };

    // --- LÓGICA DE MATERIALES ---
    const handleMaterialSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.nombre.trim()) return toast.error('El nombre es obligatorio');
        if (!formData.categoriaId) return toast.error('Debes seleccionar una categoría');
        if (!formData.unidadMedidaId) return toast.error('La unidad es obligatoria');
        if (formData.precioCompra <= 0) return toast.error('El precio debe ser mayor a 0');
        if (!editingId && formData.cantidadComprada <= 0) return toast.error('Ingresa una cantidad inicial');

        const loadingToast = toast.loading(editingId ? 'Actualizando...' : 'Guardando...');
        try {
            const datosLimpios = { ...formData };
            if (!datosLimpios.proveedorId) delete datosLimpios.proveedorId;
            if (!datosLimpios.stockMaximo) delete datosLimpios.stockMaximo;

            if (editingId) {
                await actualizarMaterial(editingId, datosLimpios);
                toast.success('Material actualizado', { id: loadingToast });
            } else {
                await crearMaterial(datosLimpios);
                toast.success('Material registrado', { id: loadingToast });
            }
            cerrarModal();
            cargarDatos();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Error al guardar', { id: loadingToast });
        }
    };

    const abrirModal = (material?: Material) => {
        if (material) {
            setEditingId(material.id);
            setFormData({
                nombre: material.nombre, 
                categoriaId: material.categoriaId,
                proveedorId: material.proveedorId || '', 
                unidadMedidaId: material.unidadMedidaId, 
                precioCompra: material.precioCompra, 
                cantidadComprada: material.cantidadComprada,
                stockMinimo: material.stockMinimo, 
                stockMaximo: material.stockMaximo || 0,
                imagenUrl: material.imagenUrl || '',
            });
        } else {
            setEditingId(null);
            setFormData({
                nombre: '', categoriaId: '', proveedorId: '', unidadMedidaId: '',
                precioCompra: 0, cantidadComprada: 0, stockMinimo: 0, stockMaximo: 0, imagenUrl: '',
            });
        }
        setIsModalOpen(true);
    };

    const cerrarModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const parsedValue = type === 'number' ? (value === '' ? 0 : Number(value)) : value;
        setFormData(prev => ({ ...prev, [name]: parsedValue }));
    };

    // --- MANEJO DE CATEGORÍAS ---
    const abrirCategoriaModal = (id?: string) => {
        if (id) {
            const cat = categorias.find(c => c.id === id);
            setCategoriaAEditar(cat || null);
        } else {
            setCategoriaAEditar(null);
        }
        setIsCategoriaModalOpen(true);
    };

    const abrirPapeleraCategorias = async () => {
        const loadingToast = toast.loading('Buscando eliminadas...');
        try {
            const inactivas = await obtenerCategorias('inactivas');
            setCategoriasInactivas(inactivas);
            setIsPapeleraCategoriasOpen(true);
            toast.dismiss(loadingToast);
        } catch (error) {
            toast.error('Error al cargar la papelera', { id: loadingToast });
        }
    };

    const ejecutarReactivacionCategoria = async (id: string) => {
        const loadingToast = toast.loading('Restaurando...');
        try {
            await reactivarCategoria(id);
            toast.success('Categoría restaurada', { id: loadingToast });
            
            const inactivas = await obtenerCategorias('inactivas');
            setCategoriasInactivas(inactivas);
            cargarDatos(); 
            if (inactivas.length === 0) setIsPapeleraCategoriasOpen(false);
        } catch (error) {
            toast.error('Error al restaurar', { id: loadingToast });
        }
    };

    // --- MANEJO DE UNIDADES DE MEDIDA ---
    const abrirPapeleraUnidades = async () => {
        const loadingToast = toast.loading('Buscando eliminadas...');
        try {
            const inactivas = await obtenerUnidades('inactivas');
            setUnidadesInactivas(inactivas);
            setIsPapeleraUnidadesOpen(true);
            toast.dismiss(loadingToast);
        } catch (error) {
            toast.error('Error al cargar la papelera', { id: loadingToast });
        }
    };

    const ejecutarReactivacionUnidad = async (id: string) => {
        const loadingToast = toast.loading('Restaurando...');
        try {
            await reactivarUnidad(id);
            toast.success('Unidad restaurada', { id: loadingToast });
            
            const inactivas = await obtenerUnidades('inactivas');
            setUnidadesInactivas(inactivas);
            cargarDatos(); 
            if (inactivas.length === 0) setIsPapeleraUnidadesOpen(false);
        } catch (error) {
            toast.error('Error al restaurar', { id: loadingToast });
        }
    };

    // --- LÓGICA DE ELIMINACIÓN Y REACTIVACIÓN (GENERAL) ---
    const handleDeleteClick = (id: string, nombre: string, tipo: 'material' | 'categoria' | 'unidad') => {
        setItemAEliminar({ id, nombre, tipo });
        setIsConfirmOpen(true);
    };

    const ejecutarEliminacion = async () => {
        if (!itemAEliminar) return;
        const loadingToast = toast.loading('Eliminando...');
        try {
            if (itemAEliminar.tipo === 'material') {
                await eliminarMaterial(itemAEliminar.id);
            } else if (itemAEliminar.tipo === 'categoria') {
                await eliminarCategoria(itemAEliminar.id);
                if (formData.categoriaId === itemAEliminar.id) setFormData(prev => ({ ...prev, categoriaId: '' }));
            } else if (itemAEliminar.tipo === 'unidad') {
                await eliminarUnidad(itemAEliminar.id);
                if (formData.unidadMedidaId === itemAEliminar.id) setFormData(prev => ({ ...prev, unidadMedidaId: '' }));
            }
            
            const textoExito = itemAEliminar.tipo === 'material' ? 'Material eliminado' : itemAEliminar.tipo === 'categoria' ? 'Categoría eliminada' : 'Unidad eliminada';
            toast.success(textoExito, { id: loadingToast });
            
            setIsConfirmOpen(false);
            setItemAEliminar(null);
            cargarDatos();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Error al eliminar', { id: loadingToast });
        }
    };

    const handleReactivar = async (id: string) => {
        const loadingToast = toast.loading('Reactivando material...');
        try {
            await reactivarMaterial(id);
            toast.success('Material reactivado', { id: loadingToast });
            cargarDatos();
        } catch (error) {
            toast.error('Error al reactivar', { id: loadingToast });
        }
    };

    const materialesFiltrados = materiales.filter(mat => {
        // 1. Filtro de búsqueda por texto
        const busqueda = searchTerm.toLowerCase();
        const matchSearch = mat.nombre.toLowerCase().includes(busqueda) || 
                            (mat.proveedor?.nombre && mat.proveedor.nombre.toLowerCase().includes(busqueda));
        
        // 2. Filtro de Categoría
        const matchCategoria = filtros.categoriaId === '' || mat.categoriaId === filtros.categoriaId;
        
        // 3. Filtro de Proveedor
        const matchProveedor = filtros.proveedorId === '' || mat.proveedorId === filtros.proveedorId;

        // Solo devuelve el material si cumple TODAS las condiciones
        return matchSearch && matchCategoria && matchProveedor;
    });

    return (
        <div className="module-container">
            
            {/* 1. CABECERA PRINCIPAL (Limpia, sin duplicados) */}
            <div className="module-header">
                <div className="module-title">
                    <Box size={28} color="var(--color-primary)" />
                    <h2>Catálogo de Materiales</h2>
                </div>
                <button className="btn-primary" onClick={() => abrirModal()}>
                    <Plus size={20} /> Nuevo Material
                </button>
            </div>

            {/* 2. DESCRIPCIÓN */}
            <div className="module-description">
                <p>Gestiona tu inventario de piedras, cadenas y fornituras. Controla precios y niveles de stock.</p>
            </div>

            {/* 3. BARRA DE HERRAMIENTAS (Búsqueda a la izq, Filtros a la der) */}
            <div className="toolbar-container">
                <div className="search-wrapper">
                    <SearchBar placeholder="Buscar material..." value={searchTerm} onChange={setSearchTerm} />
                </div>

                <FilterGroup 
                    values={filtros}
                    onChange={(name, value) => setFiltros(prev => ({ ...prev, [name]: value }))}
                    onClear={() => {
                        setFiltros({ estado: 'activos', categoriaId: '', proveedorId: '' });
                        setSearchTerm('');
                    }}
                    filters={[
                        {
                            name: 'estado',
                            placeholder: 'Ver Activos',
                            options: [
                                { id: 'activos', nombre: 'Ver Activos' },
                                { id: 'inactivos', nombre: 'Papelera' },
                                { id: 'todos', nombre: 'Ver Todos' }
                            ]
                        },
                        {
                            name: 'categoriaId',
                            placeholder: 'Todas las Categorías',
                            options: categorias
                        },
                        {
                            name: 'proveedorId',
                            placeholder: 'Todos los Proveedores',
                            options: proveedores
                        }
                    ]}
                />
            </div>


            {/* TABLA PRINCIPAL */}
            <div className="table-container">
                {isLoading ? (
                    <div className="loading-state">Cargando materiales...</div>
                ) : materiales.length === 0 ? (
                    <div className="empty-state">No hay materiales registrados.</div>
                ) : materialesFiltrados.length === 0 ? (
                    <div className="empty-state">No se encontraron resultados para "{searchTerm}"</div>
                ) : (
                    <table className="kyro-table materials-table">
                        <thead>
                            <tr>
                                <th style={{ width: '90px', textAlign: 'center' }}>Img</th>
                                <th style={{ width: '180px' }}>Material</th>
                                <th style={{ width: '220px' }}>Proveedor</th>
                                <th style={{ width: '110px' }}>Precio</th>
                                <th style={{ width: '110px' }}>Unidad</th>
                                <th style={{ width: '120px', textAlign: 'center' }}>Stock</th>
                                <th style={{ width: '120px', textAlign: 'center' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {materialesFiltrados.map((mat) => (
                                <tr key={mat.id} className={mat.activo === false ? 'row-inactiva' : ''}>
                                    <td className="text-center">
                                        <div className="material-thumb">
                                            {mat.imagenUrl ? (
                                                <img
                                                    src={mat.imagenUrl} alt={mat.nombre}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                                />
                                            ) : (
                                                <ImageIcon size={24} color="#94a3b8" />
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <span className="truncate-text font-medium">{mat.nombre}</span>
                                            {mat.activo === false && <span className="badge-eliminado">Eliminado</span>}
                                        </div>
                                    </td>
                                    <td>
                                        <span className="truncate-text text-muted" title={mat.proveedor?.nombre || 'Sin Proveedor'}>
                                            {mat.proveedor?.nombre || 'Sin Proveedor'}
                                        </span>
                                    </td>
                                    <td className="font-price">${Number(mat.precioCompra).toFixed(2)}</td>
                                    
                                    <td><span className="badge-unidad">{mat.unidadMedida?.nombre || 'N/A'}</span></td>
                                    
                                    <td align="center">
                                        <div className={`stock-indicator ${mat.stockDisponible <= mat.stockMinimo ? 'low-stock' : 'good-stock'}`}>
                                            {mat.stockDisponible <= mat.stockMinimo && <AlertTriangle size={14} />}
                                            <span>{mat.stockDisponible}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="actions-cell">
                                            <button className="btn-icon edit" onClick={() => abrirModal(mat)} title="Editar">
                                                <Pencil size={18} />
                                            </button>
                                            {mat.activo === false ? (
                                                <button className="btn-icon reactivate" style={{ color: '#16a34a' }} onClick={() => handleReactivar(mat.id)} title="Reactivar">
                                                    <RefreshCcw size={18} />
                                                </button>
                                            ) : (
                                                <button className="btn-icon delete" onClick={() => handleDeleteClick(mat.id, mat.nombre, 'material')} title="Eliminar">
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* MODAL 1: FORMULARIO DE MATERIAL */}
            <Modal
                isOpen={isModalOpen}
                onClose={cerrarModal}
                title={editingId ? 'Editar Material' : 'Nuevo Material'}
                maxWidth="700px"
                zIndex={998}
            >
                <form onSubmit={handleMaterialSubmit} className="modal-form">
                    <div className="form-header-layout">
                        
                        {/* 1. Imagen a la Izquierda (un poco más grande) */}
                        <div className="image-upload-wrapper">
                            <div className="image-dropzone large">
                                <ImageIcon size={36} color="#94a3b8" />
                                <p>Clic para foto</p>
                            </div>
                        </div>

                        {/* 2. Columna Derecha (Nombre arriba, Categoría abajo) */}
                        <div className="header-fields-col">
                            <div className="form-group">
                                <label>Nombre del Material *</label>
                                <input
                                    type="text"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleInputChange}
                                    placeholder="Ej. Agata Verde"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Categoría *</label>
                                <div className="input-group-actions">
                                    <ActionDropdown
                                        value={formData.categoriaId}
                                        options={categorias}
                                        onChange={(val) => setFormData(prev => ({ ...prev, categoriaId: val }))}
                                        placeholder="Selecciona una categoría"
                                        addLabel="Crear Categoría"
                                        onAdd={() => abrirCategoriaModal()}
                                        onEdit={(id) => abrirCategoriaModal(id)}
                                        onDelete={(id, nombre) => handleDeleteClick(id, nombre, 'categoria')}
                                        onRecover={() => abrirPapeleraCategorias()}
                                        recoverLabel="Papelera"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Proveedor (Opcional)</label>
                        <ActionDropdown
                            value={formData.proveedorId || ''}
                            options={proveedores}
                            onChange={(val) => setFormData(prev => ({ ...prev, proveedorId: val }))}
                            placeholder="Selecciona proveedor"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Unidad de Compra *</label>
                            <div className="input-group-actions">
                                <ActionDropdown
                                    value={formData.unidadMedidaId}
                                    options={unidades}
                                    onChange={(val) => setFormData(prev => ({ ...prev, unidadMedidaId: val }))}
                                    placeholder=" Unidad"
                                    addLabel="Crear Unidad"
                                    onAdd={() => {
                                        setUnidadAEditar(null);
                                        setIsUnidadModalOpen(true);
                                    }}
                                    onEdit={(id) => {
                                        const und = unidades.find(u => u.id === id);
                                        if (und) {
                                            setUnidadAEditar(und);
                                            setIsUnidadModalOpen(true);
                                        }
                                    }}
                                    onDelete={(id, nombre) => handleDeleteClick(id, nombre, 'unidad')}
                                    onRecover={() => abrirPapeleraUnidades()}
                                    recoverLabel="Papelera"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Precio de Compra ($) *</label>
                            <input
                                type="number"
                                name="precioCompra"
                                value={formData.precioCompra || ''}
                                onChange={handleInputChange}
                                step="0.01"
                                min="0"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>
                                {editingId ? 'Cantidad' : 'Cantidad Comprada *'}
                            </label>
                            <input
                                type="number"
                                name="cantidadComprada"
                                value={formData.cantidadComprada || ''}
                                onChange={handleInputChange}
                                step="0.01"
                                min="0"
                                placeholder="Ej. 10 o 2.5"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Stock Mínimo (Alerta)</label>
                            <input type="number" name="stockMinimo" value={formData.stockMinimo || ''} onChange={handleInputChange} min="0" placeholder='Opcional'/>
                        </div>
                        <div className="form-group">
                            <label>Stock Máximo</label>
                            <input type="number" name="stockMaximo" value={formData.stockMaximo || ''} onChange={handleInputChange} min="0" placeholder="Opcional"/>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-secondary" onClick={cerrarModal}>Cancelar</button>
                        <button type="submit" className="btn-primary">Guardar Material</button>
                    </div>
                </form>
            </Modal>

            {/* MODAL SECUNDARIO: CATEGORÍA */}
            <CategoriaModal
                isOpen={isCategoriaModalOpen}
                onClose={() => setIsCategoriaModalOpen(false)}
                categoriaAEditar={categoriaAEditar}
                onSuccess={(nuevoId) => {
                    cargarDatos();
                    if (nuevoId) setFormData(prev => ({ ...prev, categoriaId: nuevoId }));
                }}
            />

            {/* MODAL SECUNDARIO: UNIDAD DE MEDIDA */}
            <UnidadMedidaModal 
                isOpen={isUnidadModalOpen}
                onClose={() => setIsUnidadModalOpen(false)}
                unidadAEditar={unidadAEditar}
                onSuccess={(nuevoId) => {
                    cargarDatos();
                    if (nuevoId) setFormData(prev => ({ ...prev, unidadMedidaId: nuevoId }));
                }}
            />

            {/* MODAL: PAPELERA DE CATEGORÍAS */}
            <Modal
                isOpen={isPapeleraCategoriasOpen}
                onClose={() => setIsPapeleraCategoriasOpen(false)}
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Trash2 size={20} color="var(--color-text-secondary)" />
                        <h3>Categorías Eliminadas</h3>
                    </div>
                }
                maxWidth="400px"
                zIndex={1000}
            >
                <div className="papelera-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {categoriasInactivas.length === 0 ? (
                        <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: '20px 0' }}>No hay categorías eliminadas.</p>
                    ) : (
                        categoriasInactivas.map(cat => (
                            <div key={cat.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid var(--color-border)', borderRadius: '8px', backgroundColor: 'var(--color-background)' }}>
                                <div>
                                    <strong style={{ display: 'block', fontSize: '14px', color: 'var(--color-text)' }}>{cat.nombre}</strong>
                                    {cat.descripcion && <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{cat.descripcion}</span>}
                                </div>
                                <button 
                                    className="btn-icon reactivate" 
                                    style={{ color: '#16a34a', backgroundColor: '#dcfce7' }} 
                                    onClick={() => ejecutarReactivacionCategoria(cat.id)}
                                    title="Restaurar Categoría"
                                >
                                    <RefreshCcw size={16} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </Modal>

            {/* MODAL: PAPELERA DE UNIDADES */}
            <Modal
                isOpen={isPapeleraUnidadesOpen}
                onClose={() => setIsPapeleraUnidadesOpen(false)}
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Trash2 size={20} color="var(--color-text-secondary)" />
                        <h3>Unidades Eliminadas</h3>
                    </div>
                }
                maxWidth="400px"
                zIndex={1000}
            >
                <div className="papelera-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {unidadesInactivas.length === 0 ? (
                        <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: '20px 0' }}>No hay unidades eliminadas.</p>
                    ) : (
                        unidadesInactivas.map(unidad => (
                            <div key={unidad.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid var(--color-border)', borderRadius: '8px', backgroundColor: 'var(--color-background)' }}>
                                <div>
                                    <strong style={{ display: 'block', fontSize: '14px', color: 'var(--color-text)' }}>{unidad.nombre}</strong>
                                </div>
                                <button 
                                    className="btn-icon reactivate" 
                                    style={{ color: '#16a34a', backgroundColor: '#dcfce7' }} 
                                    onClick={() => ejecutarReactivacionUnidad(unidad.id)}
                                    title="Restaurar Unidad"
                                >
                                    <RefreshCcw size={16} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </Modal>

            {/* MODAL GLOBAL DE CONFIRMACIÓN */}
            <ConfirmModal
                isOpen={isConfirmOpen}
                title={`Eliminar ${itemAEliminar?.tipo === 'categoria' ? 'Categoría' : itemAEliminar?.tipo === 'unidad' ? 'Unidad' : 'Material'}`}
                message={`¿Estás seguro de que deseas dar de baja "${itemAEliminar?.nombre}"?`}
                onConfirm={ejecutarEliminacion}
                onCancel={() => setIsConfirmOpen(false)}
                confirmText="Sí, eliminar"
            />
        </div>
    );
};