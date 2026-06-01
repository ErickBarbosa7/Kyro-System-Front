import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Pencil, Trash2, Box, Image as ImageIcon, AlertTriangle, RefreshCcw } from 'lucide-react';
import { SearchBar } from '../../components/ui/SearchBar/SearchBar';
import { FilterSelect } from '../../components/ui/FilterSelect/FilterSelect';
import { ConfirmModal } from '../../components/ConfirmModal';
import { ActionDropdown } from '../../components/ui/ActionDropdown/ActionDropdown';
import { Modal } from '../../components/ui/Modal/Modal'; 
import { reactivarCategoria } from '../../services/categorias-materiales.service'; 
// SERVICIOS
import {
    obtenerMateriales,
    crearMaterial,
    actualizarMaterial,
    eliminarMaterial,
    reactivarMaterial,
    type Material,
    type MaterialFormData
} from '../../services/materiales.service';
import { obtenerProveedores } from '../../services/proveedores.service';
import {
    obtenerCategorias,
    crearCategoria,
    actualizarCategoria,
    eliminarCategoria,
    type CategoriaMaterial
} from '../../services/categorias-materiales.service';

import './Materiales.css';

export const Materiales = () => {
    // === ESTADOS ===
    const [materiales, setMateriales] = useState<Material[]>([]);
    const [proveedores, setProveedores] = useState<{ id: string; nombre: string }[]>([]);
    const [categorias, setCategorias] = useState<CategoriaMaterial[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Búsqueda y Filtro
    const [searchTerm, setSearchTerm] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('activos');

    // Modal Materiales
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<MaterialFormData>({
        nombre: '', categoriaId: '', proveedorId: '', unidadCompra: '',
        precioCompra: 0, cantidadComprada: 0, stockMinimo: 0, stockMaximo: 0, imagenUrl: '',
    });

    // Modal de Categorías (Micro-CRUD)
    const [isCategoriaModalOpen, setIsCategoriaModalOpen] = useState(false);
    const [editingCategoriaId, setEditingCategoriaId] = useState<string | null>(null);
    const [categoriaFormData, setCategoriaFormData] = useState({ nombre: '', descripcion: '' });

    // Confirmación (Eliminar Material o Categoría)
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [itemAEliminar, setItemAEliminar] = useState<{ id: string, nombre: string, tipo: 'material' | 'categoria' } | null>(null);

    // Papelera de Categorías
    const [isPapeleraCategoriasOpen, setIsPapeleraCategoriasOpen] = useState(false);
    const [categoriasInactivas, setCategoriasInactivas] = useState<CategoriaMaterial[]>([]);

    // === EFECTOS ===
    useEffect(() => {
        cargarDatos();
    }, [filtroEstado]);

    // === FUNCIONES DE RED ===
    const cargarDatos = async () => {
        setIsLoading(true);
        try {
            const [materialesData, proveedoresData, categoriasData] = await Promise.all([
                obtenerMateriales(filtroEstado),
                obtenerProveedores('activos'),
                obtenerCategorias('activas')
            ]);
            setMateriales(materialesData);
            setProveedores(proveedoresData);
            setCategorias(categoriasData);
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
        if (!formData.unidadCompra.trim()) return toast.error('La unidad es obligatoria');
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

    // --- LÓGICA DE CATEGORÍAS ---
    const handleCategoriaSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!categoriaFormData.nombre.trim()) return toast.error('El nombre es obligatorio');

        const loadingToast = toast.loading('Guardando categoría...');
        try {
            if (editingCategoriaId) {
                await actualizarCategoria(editingCategoriaId, categoriaFormData);
                toast.success('Categoría actualizada', { id: loadingToast });
            } else {
                const nuevaCategoria = await crearCategoria(categoriaFormData);
                toast.success('Categoría creada', { id: loadingToast });
                setFormData(prev => ({ ...prev, categoriaId: nuevaCategoria.id }));
            }
            cerrarCategoriaModal();
            cargarDatos();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Error al guardar', { id: loadingToast });
        }
    };

    const abrirCategoriaModal = (categoriaIdAEditar?: string) => {
        if (categoriaIdAEditar) {
            const cat = categorias.find(c => c.id === categoriaIdAEditar);
            if (cat) {
                setEditingCategoriaId(cat.id);
                setCategoriaFormData({ nombre: cat.nombre, descripcion: cat.descripcion || '' });
            }
        } else {
            setEditingCategoriaId(null);
            setCategoriaFormData({ nombre: '', descripcion: '' });
        }
        setIsCategoriaModalOpen(true);
    };

    const cerrarCategoriaModal = () => {
        setIsCategoriaModalOpen(false);
        setEditingCategoriaId(null);
        setCategoriaFormData({ nombre: '', descripcion: '' });
    };

    // --- LÓGICA PAPELERA DE CATEGORÍAS ---
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

    // --- LÓGICA DE ELIMINACIÓN GENERALIZADA ---
    const handleDeleteClick = (id: string, nombre: string, tipo: 'material' | 'categoria') => {
        setItemAEliminar({ id, nombre, tipo });
        setIsConfirmOpen(true);
    };

    const ejecutarEliminacion = async () => {
        if (!itemAEliminar) return;
        const loadingToast = toast.loading('Eliminando...');
        try {
            if (itemAEliminar.tipo === 'material') {
                await eliminarMaterial(itemAEliminar.id);
            } else {
                await eliminarCategoria(itemAEliminar.id);
                if (formData.categoriaId === itemAEliminar.id) {
                    setFormData(prev => ({ ...prev, categoriaId: '' }));
                }
            }
            toast.success(`${itemAEliminar.tipo === 'material' ? 'Material' : 'Categoría'} eliminado`, { id: loadingToast });
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

    // === MANEJADORES DE INTERFAZ ===
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const parsedValue = type === 'number' ? (value === '' ? 0 : Number(value)) : value;
        setFormData(prev => ({ ...prev, [name]: parsedValue }));
    };

    const abrirModal = (material?: Material) => {
        if (material) {
            setEditingId(material.id);
            setFormData({
                nombre: material.nombre, categoriaId: material.categoriaId,
                proveedorId: material.proveedorId || '', unidadCompra: material.unidadCompra,
                precioCompra: material.precioCompra, cantidadComprada: material.cantidadComprada,
                stockMinimo: material.stockMinimo, stockMaximo: material.stockMaximo || 0,
                imagenUrl: material.imagenUrl || '',
            });
        } else {
            setEditingId(null);
            setFormData({
                nombre: '', categoriaId: '', proveedorId: '', unidadCompra: '',
                precioCompra: 0, cantidadComprada: 0, stockMinimo: 0, stockMaximo: 0, imagenUrl: '',
            });
        }
        setIsModalOpen(true);
    };

    const cerrarModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
    };

    const materialesFiltrados = materiales.filter(mat => {
        const busqueda = searchTerm.toLowerCase();
        return (mat.nombre.toLowerCase().includes(busqueda) || (mat.proveedor?.nombre && mat.proveedor.nombre.toLowerCase().includes(busqueda)));
    });

    return (
        <div className="module-container">
            {/* CABECERA */}
            <div className="module-header">
                <div className="module-title">
                    <Box size={28} color="var(--color-primary)" />
                    <h2>Catálogo de Materiales</h2>
                </div>

                <div className="header-actions">
                    <SearchBar placeholder="Buscar material..." value={searchTerm} onChange={setSearchTerm} />
                    <FilterSelect
                        value={filtroEstado}
                        onChange={setFiltroEstado}
                        options={[
                            { value: 'activos', label: 'Ver Activos' },
                            { value: 'inactivos', label: 'Papelera' },
                            { value: 'todos', label: 'Ver Todos' }
                        ]}
                    />
                    <button className="btn-primary" onClick={() => abrirModal()}>
                        <Plus size={20} /> Nuevo Material
                    </button>
                </div>
            </div>

            <div className="module-description">
                <p>Gestiona tu inventario de piedras, cadenas y fornituras. Controla precios y niveles de stock.</p>
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
                                <tr key={mat.id}>
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
                                    <td><span className="truncate-text font-medium">{mat.nombre}</span></td>
                                    <td>
                                        <span className="truncate-text text-muted" title={mat.proveedor?.nombre || 'Sin Proveedor'}>
                                            {mat.proveedor?.nombre || 'Sin Proveedor'}
                                        </span>
                                    </td>
                                    <td className="font-price">${Number(mat.precioCompra).toFixed(2)}</td>
                                    <td><span className="badge-unidad">{mat.unidadCompra}</span></td>
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

            {/* MODAL 1: MATERIAL */}
            <Modal
                isOpen={isModalOpen}
                onClose={cerrarModal}
                title={editingId ? 'Editar Material' : 'Nuevo Material'}
                maxWidth="700px"
                zIndex={998}
            >
                <form onSubmit={handleMaterialSubmit} className="modal-form">
                    <div className="image-upload-container">
                        <div className="image-dropzone">
                            <ImageIcon size={32} color="#94a3b8" />
                            <p>Clic para subir foto</p>
                        </div>
                    </div>

                    <div className="form-row">
                        {/* QUITAMOS EL style={{ flex: 2 }} AQUÍ */}
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

                        {/* QUITAMOS EL style={{ flex: 1 }} AQUÍ */}
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
                            <input
                                type="text"
                                name="unidadCompra"
                                value={formData.unidadCompra}
                                onChange={handleInputChange}
                                placeholder="Ej. PIEZA, GRAMO"
                                required
                            />
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
                                {editingId ? 'Cantidad (Solo ajuste)' : 'Cantidad Comprada *'}
                            </label>
                            <input
                                type="number"
                                name="cantidadComprada"
                                value={formData.cantidadComprada || ''}
                                onChange={handleInputChange}
                                step="0.01"
                                min="0"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Stock Mínimo (Alerta)</label>
                            <input type="number" name="stockMinimo" value={formData.stockMinimo || ''} onChange={handleInputChange} min="0" />
                        </div>
                        <div className="form-group">
                            <label>Stock Máximo</label>
                            <input type="number" name="stockMaximo" value={formData.stockMaximo || ''} onChange={handleInputChange} min="0" />
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-secondary" onClick={cerrarModal}>Cancelar</button>
                        <button type="submit" className="btn-primary">Guardar Material</button>
                    </div>
                </form>
            </Modal>

            {/* MODAL 2: CATEGORÍAS */}
            <Modal
                isOpen={isCategoriaModalOpen}
                onClose={cerrarCategoriaModal}
                title={editingCategoriaId ? 'Editar Categoría' : 'Nueva Categoría'}
                maxWidth="400px"
                zIndex={999}
            >
                <form onSubmit={handleCategoriaSubmit} className="modal-form">
                    <div className="form-group">
                        <label>Nombre de la Categoría *</label>
                        <input
                            type="text"
                            value={categoriaFormData.nombre}
                            onChange={(e) => setCategoriaFormData(prev => ({ ...prev, nombre: e.target.value }))}
                            placeholder="Ej. Piedras"
                            autoFocus
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Descripción (Opcional)</label>
                        <textarea
                            value={categoriaFormData.descripcion}
                            onChange={(e) => setCategoriaFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                            placeholder="Breve detalle..."
                            rows={2}
                        />
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn-secondary" onClick={cerrarCategoriaModal}>Cancelar</button>
                        <button type="submit" className="btn-primary">Guardar</button>
                    </div>
                </form>
            </Modal>

            {/* MODAL 3: PAPELERA DE CATEGORÍAS */}
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

            <ConfirmModal
                isOpen={isConfirmOpen}
                title={`Eliminar ${itemAEliminar?.tipo === 'categoria' ? 'Categoría' : 'Material'}`}
                message={`¿Estás seguro de que deseas dar de baja "${itemAEliminar?.nombre}"?`}
                onConfirm={ejecutarEliminacion}
                onCancel={() => setIsConfirmOpen(false)}
                confirmText="Sí, eliminar"
            />
        </div>
    );
};