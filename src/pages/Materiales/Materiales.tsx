import React, { useState, useEffect, useMemo, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Box, Image as ImageIcon, AlertTriangle, FileText, Trash2, RefreshCcw } from 'lucide-react';
import { SearchBar } from '../../components/ui/SearchBar/SearchBar';
import { ConfirmModal } from '../../components/ConfirmModal';
import { ActionDropdown } from '../../components/ui/ActionDropdown/ActionDropdown';
import { Modal } from '../../components/ui/Modal/Modal'; 
import { FilterGroup } from '../../components/ui/FilterGroup/FilterGroup';
import { DataTable, type ColumnConfig } from '../../components/ui/DataTable/DataTable';

import { generarPDFMateriales } from '../../utils/reportes';

// COMPONENTES EXTERNOS
import { CategoriaModal } from './CategoriaModal/CategoriaModal';
import { UnidadMedidaModal } from './UnidadMedidaModal/UnidadMedidaModal';

// SERVICIOS
import { reactivarCategoria, obtenerCategorias, eliminarCategoria, type CategoriaMaterial } from '../../services/categorias-materiales.service'; 
import { obtenerUnidades, eliminarUnidad, reactivarUnidad } from '../../services/unidades-medida.service';
import { obtenerMateriales, crearMaterial, actualizarMaterial, eliminarMaterial, reactivarMaterial, type Material } from '../../services/materiales.service';
import { obtenerProveedores } from '../../services/proveedores.service';
import { Loading } from '../../components/Loading/Loading';
import { FieldError } from '../../components/ui/FieldError/FieldError';

import './Materiales.css';

interface FormState {
    nombre: string;
    categoriaId: string;
    proveedorId: string;
    unidadMedidaId: string;
    precioCompra: string | number;
    cantidadComprada: string | number;
    stockMinimo: string | number;
    stockMaximo: string | number;
    imagenUrl: string;
    observaciones: string;
}

export const Materiales = () => {
    // === ESTADOS GLOBALES ===
    const [materiales, setMateriales] = useState<Material[]>([]);
    const [proveedores, setProveedores] = useState<{ id: string; nombre: string }[]>([]);
    const [categorias, setCategorias] = useState<CategoriaMaterial[]>([]);
    const [unidades, setUnidades] = useState<{ id: string; nombre: string }[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState('');
    
    const [filtros, setFiltros] = useState({
        estado: 'activos', 
        categoriaId: '',   
        proveedorId: ''    
    });

    // Estados Imágenes
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Modal Materiales
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<FormState>({
        nombre: '', categoriaId: '', proveedorId: '', unidadMedidaId: '', 
        precioCompra: '', cantidadComprada: '', stockMinimo: 0, stockMaximo: '', imagenUrl: '', observaciones: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    // === ESTILOS MÁGICOS A PRUEBA DE FALLOS ===
    const labelStyle = { color: 'var(--color-text)', fontWeight: 700 };
    const inputStyle = { backgroundColor: 'var(--color-background)', color: 'var(--color-text)' };

    // Modales Secundarios
    const [isCategoriaModalOpen, setIsCategoriaModalOpen] = useState(false);
    const [categoriaAEditar, setCategoriaAEditar] = useState<{ id: string; nombre: string; descripcion?: string } | null>(null);
    
    const [isUnidadModalOpen, setIsUnidadModalOpen] = useState(false);
    const [unidadAEditar, setUnidadAEditar] = useState<{ id: string; nombre: string } | null>(null);

    // Papeleras
    const [isPapeleraCategoriasOpen, setIsPapeleraCategoriasOpen] = useState(false);
    const [categoriasInactivas, setCategoriasInactivas] = useState<CategoriaMaterial[]>([]);
    
    const [isPapeleraUnidadesOpen, setIsPapeleraUnidadesOpen] = useState(false);
    const [unidadesInactivas, setUnidadesInactivas] = useState<{ id: string; nombre: string }[]>([]);

    // Confirmación
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [itemAEliminar, setItemAEliminar] = useState<{ id: string, nombre: string, tipo: 'material' | 'categoria' | 'unidad'} | null>(null);

    // === EFECTOS ===
    useEffect(() => {
        cargarDatos();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filtros.estado, filtros.categoriaId, filtros.proveedorId]);

    const cargarDatos = async () => {
        setIsLoading(true);
        try {
            const [materialesData, proveedoresData, categoriasData, unidadesData] = await Promise.all([
                obtenerMateriales(filtros.estado as any),
                obtenerProveedores('activos'),
                obtenerCategorias('activas'),
                obtenerUnidades('activas')
            ]);

            setMateriales(materialesData);
            setProveedores(proveedoresData);
            setCategorias(categoriasData);
            setUnidades(unidadesData);
        } catch (error) {
            toast.error('Error al cargar los datos de materiales');
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file)); 
        }
    };

    const requiredMsg = (label: string) => `${label} es obligatorio`;
    const validate = (data: FormState): Record<string, string> => {
        const e: Record<string, string> = {};
        if (!data.nombre?.trim()) e.nombre = requiredMsg('El nombre');
        if (!data.categoriaId) e.categoriaId = 'La categoría es obligatoria';
        if (!data.unidadMedidaId) e.unidadMedidaId = 'La unidad es obligatoria';
        if (Number(data.precioCompra) <= 0) e.precioCompra = 'El precio debe ser mayor a 0';
        if (!editingId && Number(data.cantidadComprada) <= 0) e.cantidadComprada = 'Ingresa una cantidad inicial';
        return e;
    };

    const handleMaterialSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const validationErrors = validate(formData);
        setErrors(validationErrors);
        setTouched({ nombre: true, categoriaId: true, unidadMedidaId: true, precioCompra: true, cantidadComprada: true });
        if (Object.keys(validationErrors).length > 0) return;

        if (!formData.nombre.trim()) return toast.error('El nombre es obligatorio');
        if (!formData.categoriaId) return toast.error('Debes seleccionar una categoría');
        if (!formData.unidadMedidaId) return toast.error('La unidad es obligatoria');
        if (Number(formData.precioCompra) <= 0) return toast.error('El precio debe ser mayor a 0');
        if (!editingId && Number(formData.cantidadComprada) <= 0) return toast.error('Ingresa una cantidad inicial');

        const loadingToast = toast.loading(editingId ? 'Actualizando...' : 'Guardando...');
        try {
            const dataToSend = new FormData();
            dataToSend.append('nombre', formData.nombre);
            dataToSend.append('categoriaId', formData.categoriaId);
            dataToSend.append('unidadMedidaId', formData.unidadMedidaId);
            dataToSend.append('precioCompra', String(formData.precioCompra));
            dataToSend.append('cantidadComprada', String(formData.cantidadComprada));
            dataToSend.append('stockMinimo', String(formData.stockMinimo));
            dataToSend.append('stockMaximo', formData.stockMaximo !== '' ? String(formData.stockMaximo) : '');
            
            if (formData.proveedorId) {
                dataToSend.append('proveedorId', formData.proveedorId);
            }

            if (formData.observaciones) {
                dataToSend.append('observaciones', formData.observaciones);
            }

            if (imageFile) {
                dataToSend.append('imagen', imageFile);
            }

            if (editingId) {
                await actualizarMaterial(editingId, dataToSend);
                toast.success('Material actualizado', { id: loadingToast });
            } else {
                await crearMaterial(dataToSend);
                toast.success('Material registrado', { id: loadingToast });
            }
            cerrarModal();
            cargarDatos();
        } catch (error: any) {
            const errorMsg = error.response?.data?.error || 'Ocurrió un error al guardar';
            toast.error(errorMsg, { id: loadingToast });
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
                stockMinimo: material.stockMinimo ?? 0, 
                stockMaximo: material.stockMaximo ?? '', 
                imagenUrl: material.imagenUrl || '',
                observaciones: material.observaciones || '',
            });
        } else {
            setEditingId(null);
            setFormData({
                nombre: '', categoriaId: '', proveedorId: '', unidadMedidaId: '',
                precioCompra: '', cantidadComprada: '', stockMinimo: 0, stockMaximo: '', imagenUrl: '', observaciones: '',
            });
        }
        setErrors({});
        setTouched({});
        setIsModalOpen(true);
    };

    const cerrarModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setImageFile(null);
        setImagePreview('');
    };

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
        const loadingToast = toast.loading('Restaurando categoría...');
        try {
            await reactivarCategoria(id);
            toast.success('Categoría restaurada exitosamente', { id: loadingToast });
            
            const inactivas = await obtenerCategorias('inactivas');
            setCategoriasInactivas(inactivas);
            cargarDatos(); 
            if (inactivas.length === 0) setIsPapeleraCategoriasOpen(false);
        } catch (error) {
            toast.error('Error al restaurar categoría', { id: loadingToast });
        }
    };

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
        const loadingToast = toast.loading('Restaurando unidad...');
        try {
            await reactivarUnidad(id);
            toast.success('Unidad restaurada exitosamente', { id: loadingToast });
            
            const inactivas = await obtenerUnidades('inactivas');
            setUnidadesInactivas(inactivas);
            cargarDatos(); 
            if (inactivas.length === 0) setIsPapeleraUnidadesOpen(false);
        } catch (error) {
            toast.error('Error al restaurar unidad', { id: loadingToast });
        }
    };

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
            toast.success('Material reactivado exitosamente', { id: loadingToast });
            cargarDatos();
        } catch (error) {
            toast.error('Error al reactivar', { id: loadingToast });
        }
    };

    const materialesFiltrados = materiales.filter(mat => {
        const busqueda = searchTerm.toLowerCase();
        const matchSearch = mat.nombre.toLowerCase().includes(busqueda) || 
                            (mat.proveedor?.nombre && mat.proveedor.nombre.toLowerCase().includes(busqueda));
        
        const matchCategoria = filtros.categoriaId === '' || mat.categoriaId === filtros.categoriaId;
        const matchProveedor = filtros.proveedorId === '' || mat.proveedorId === filtros.proveedorId;

        return matchSearch && matchCategoria && matchProveedor;
    });

    const columns: ColumnConfig<Material>[] = useMemo(() => [
        {
            key: 'imagenUrl',
            label: 'Img',
            width: '90px',
            align: 'center',
            render: (mat: Material) => (
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
            )
        },
        {
            key: 'nombre',
            label: 'Material',
            width: '180px',
            sortable: true,
            render: (mat: Material) => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span className="truncate-text font-medium">{mat.nombre}</span>
                    {mat.activo === false && <span className="badge-eliminado">Eliminado</span>}
                </div>
            )
        },
        {
            key: 'proveedor',
            label: 'Proveedor',
            width: '220px',
            sortable: true,
            getSortValue: (mat: Material) => mat.proveedor?.nombre || '',
            render: (mat: Material) => (
                <span className="truncate-text text-muted" title={mat.proveedor?.nombre || 'Sin Proveedor'}>
                    {mat.proveedor?.nombre || 'Sin Proveedor'}
                </span>
            )
        },
        {
            key: 'precioCompra',
            label: 'Precio',
            width: '110px',
            sortable: true,
            render: (mat: Material) => <span className="font-price">${Number(mat.precioCompra).toFixed(2)}</span>
        },
        {
            key: 'unidadMedida',
            label: 'Unidad',
            width: '110px',
            sortable: true,
            getSortValue: (mat: Material) => mat.unidadMedida?.nombre || '',
            render: (mat: Material) => <span className="badge-unidad">{mat.unidadMedida?.nombre || 'N/A'}</span>
        },
        {
            key: 'stockDisponible',
            label: 'Stock',
            width: '120px',
            align: 'center',
            sortable: true,
            render: (mat: Material) => (
                <div className={`stock-indicator ${mat.stockDisponible <= mat.stockMinimo ? 'low-stock' : 'good-stock'}`}>
                    {mat.stockDisponible <= mat.stockMinimo && <AlertTriangle size={14} />}
                    <span>{mat.stockDisponible}</span>
                </div>
            )
        },
        {
            key: 'acciones',
            label: '',
            width: '50px',
            align: 'center',
            render: (mat: Material) => (
                <ActionDropdown
                    variant="contextual"
                    contextualId={mat.id}
                    contextualName={mat.nombre}
                    onEdit={() => abrirModal(mat)}
                    onDelete={mat.activo !== false ? (id, nombre) => handleDeleteClick(id!, nombre!, 'material') : undefined}
                    onRecover={mat.activo === false ? () => handleReactivar(mat.id) : undefined}
                    recoverLabel="Reactivar"
                />
            )
        }
    ], [categorias, proveedores, unidades]);

    return (
        <div className="module-container">
            <div className="module-header">
                <div className="module-title">
                    <Box size={28} color="var(--color-primary)" />
                    <h2 style={{ color: 'var(--color-primary)' }}>Catálogo de Materiales</h2>
                </div>
                <div className="header-actions">
                    <button 
                        className="btn-secondary" 
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        onClick={() => generarPDFMateriales(materialesFiltrados, filtros.estado)}
                        title="Exportar la vista actual a formato PDF"
                    >
                        <FileText size={20} /> Exportar PDF
                    </button>
                    <button className="btn-primary" onClick={() => abrirModal()}>
                        <Plus size={20} /> Nuevo Material
                    </button>
                </div>
            </div>

            <div className="module-description">
                <p>Gestiona tu inventario de piedras, cadenas y fornituras. Controla precios y niveles de stock.</p>
            </div>

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
                            hideEmptyOption: true,
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

            <div className="table-container">
                {isLoading ? (
                    <Loading texto="Cargando materiales..." />
                ) : (
                    <DataTable
                        data={materialesFiltrados}
                        columns={columns}
                        className="materials-table"
                        emptyMessage={searchTerm ? `No se encontraron resultados para "${searchTerm}"` : "No hay materiales registrados."}
                        rowClassName={(mat) => (mat.activo === false ? 'row-inactiva' : '')}
                        defaultSort={{ key: 'nombre', direction: 'desc' }}
                        itemsPerPageOptions={[5, 10, 25, 50]}
                    />
                )}
            </div>

            {/* MODAL PRINCIPAL: MATERIALES */}
            <Modal
                isOpen={isModalOpen}
                onClose={cerrarModal}
                title={<span style={{ color: 'var(--color-text)' }}>{editingId ? 'Editar Material' : 'Nuevo Material'}</span>}
                maxWidth="700px"
                zIndex={998}
            >
                <form onSubmit={handleMaterialSubmit} className="modal-form">
                    <div className="form-header-layout">
                        <div className="image-upload-wrapper">
                            <div 
                                className="image-dropzone large"
                                onClick={() => fileInputRef.current?.click()}
                                title="Seleccionar imagen del material"
                            >
                                {imagePreview || formData.imagenUrl ? (
                                    <img
                                        src={imagePreview || formData.imagenUrl} 
                                        alt="Previsualización"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '14px' }}
                                    />
                                ) : (
                                    <>
                                        <ImageIcon size={36} color="#94a3b8" />
                                        <p>Clic para foto</p>
                                    </>
                                )}
                            </div>
                            <input 
                                type="file"
                                ref={fileInputRef}
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={handleImageChange}
                            />
                        </div>

                        <div className="header-fields-col">
                            <div className={`form-group ${errors.nombre && touched.nombre ? 'form-group--error' : ''}`}>
                                <label style={labelStyle}>Nombre del Material *</label>
                                <input
                                    style={inputStyle}
                                    type="text"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleInputChange}
                                    onBlur={() => handleBlur('nombre')}
                                    placeholder="Ej. Agata Verde"
                                />
                                <FieldError message={touched.nombre ? errors.nombre : undefined} />
                            </div>

                            <div className={`form-group ${errors.categoriaId && touched.categoriaId ? 'form-group--error' : ''}`}>
                                <label style={labelStyle}>Categoría *</label>
                                <div className="input-group-actions">
                                    <ActionDropdown
                                        value={formData.categoriaId}
                                        options={categorias}
                                        onChange={(val) => {
                                            setFormData(prev => ({ ...prev, categoriaId: val }));
                                            if (touched.categoriaId) {
                                                const newErrors = validate({ ...formData, categoriaId: val });
                                                setErrors(prev => ({ ...prev, categoriaId: newErrors.categoriaId }));
                                            }
                                        }}
                                        placeholder="Selecciona una categoría"
                                        addLabel="Crear Categoría"
                                        onAdd={() => abrirCategoriaModal()}
                                        onEdit={(id) => abrirCategoriaModal(id)}
                                        onDelete={(id, nombre) => handleDeleteClick(id, nombre, 'categoria')}
                                        onRecover={() => abrirPapeleraCategorias()}
                                        recoverLabel="Papelera"
                                    />
                                </div>
                                <FieldError message={touched.categoriaId ? errors.categoriaId : undefined} />
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label style={labelStyle}>Proveedor (Opcional)</label>
                        <ActionDropdown
                            value={formData.proveedorId || ''}
                            options={proveedores}
                            onChange={(val) => setFormData(prev => ({ ...prev, proveedorId: val }))}
                            placeholder="Selecciona proveedor"
                        />
                    </div>

                    <div className="form-row">
                        <div className={`form-group ${errors.unidadMedidaId && touched.unidadMedidaId ? 'form-group--error' : ''}`}>
                            <label style={labelStyle}>Unidad de Compra *</label>
                            <div className="input-group-actions">
                                <ActionDropdown
                                    value={formData.unidadMedidaId}
                                    options={unidades}
                                    onChange={(val) => {
                                        setFormData(prev => ({ ...prev, unidadMedidaId: val }));
                                        if (touched.unidadMedidaId) {
                                            const newErrors = validate({ ...formData, unidadMedidaId: val });
                                            setErrors(prev => ({ ...prev, unidadMedidaId: newErrors.unidadMedidaId }));
                                        }
                                    }}
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
                            <FieldError message={touched.unidadMedidaId ? errors.unidadMedidaId : undefined} />
                        </div>

                        <div className={`form-group ${errors.precioCompra && touched.precioCompra ? 'form-group--error' : ''}`}>
                            <label style={labelStyle}>Precio de Compra ($) *</label>
                            <input
                                style={inputStyle}
                                type="number"
                                name="precioCompra"
                                value={formData.precioCompra}
                                onChange={handleInputChange}
                                onBlur={() => handleBlur('precioCompra')}
                                step="0.01"
                                min="0"
                            />
                            <FieldError message={touched.precioCompra ? errors.precioCompra : undefined} />
                        </div>

                        <div className={`form-group ${errors.cantidadComprada && touched.cantidadComprada ? 'form-group--error' : ''}`}>
                            <label style={labelStyle}>
                                {editingId ? 'Cantidad' : 'Cantidad Comprada *'}
                            </label>
                            <input
                                style={inputStyle}
                                type="number"
                                name="cantidadComprada"
                                value={formData.cantidadComprada}
                                onChange={handleInputChange}
                                onBlur={() => handleBlur('cantidadComprada')}
                                step="0.01"
                                min="0"
                                placeholder="Ej. 10 o 2.5"
                            />
                            <FieldError message={touched.cantidadComprada ? errors.cantidadComprada : undefined} />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label style={labelStyle}>Stock Mínimo (Alerta)</label>
                            <input style={inputStyle} type="number" name="stockMinimo" value={formData.stockMinimo} onChange={handleInputChange} min="0" placeholder='Opcional'/>
                        </div>
                        <div className="form-group">
                            <label style={labelStyle}>Stock Máximo</label>
                            <input style={inputStyle} type="number" name="stockMaximo" value={formData.stockMaximo} onChange={handleInputChange} min="0" placeholder="Opcional (Sin límite)"/>
                        </div>
                    </div>

                    <div className="form-group">
                        <label style={labelStyle}>Observaciones</label>
                        <textarea
                            style={inputStyle}
                            name="observaciones"
                            value={formData.observaciones}
                            onChange={handleInputChange}
                            placeholder="Notas adicionales sobre el material..."
                            rows={2}
                        />
                    </div>

                    <div className="modal-footer" style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                        <button type="button" className="btn-secondary" onClick={cerrarModal}>Cancelar</button>
                        <button type="submit" className="btn-primary">Guardar Material</button>
                    </div>
                </form>
            </Modal>

            <CategoriaModal
                isOpen={isCategoriaModalOpen}
                onClose={() => setIsCategoriaModalOpen(false)}
                categoriaAEditar={categoriaAEditar}
                onSuccess={(nuevoId) => {
                    cargarDatos();
                    if (nuevoId) setFormData(prev => ({ ...prev, categoriaId: nuevoId }));
                }}
            />

            <UnidadMedidaModal 
                isOpen={isUnidadModalOpen}
                onClose={() => setIsUnidadModalOpen(false)}
                unidadAEditar={unidadAEditar}
                onSuccess={(nuevoId) => {
                    cargarDatos();
                    if (nuevoId) setFormData(prev => ({ ...prev, unidadMedidaId: nuevoId }));
                }}
            />

            <Modal
                isOpen={isPapeleraCategoriasOpen}
                onClose={() => setIsPapeleraCategoriasOpen(false)}
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Trash2 size={20} color="var(--color-text-secondary)" />
                        <span style={{ color: 'var(--color-text)' }}>Categorías Eliminadas</span>
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

            <Modal
                isOpen={isPapeleraUnidadesOpen}
                onClose={() => setIsPapeleraUnidadesOpen(false)}
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Trash2 size={20} color="var(--color-text-secondary)" />
                        <span style={{ color: 'var(--color-text)' }}>Unidades Eliminadas</span>
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