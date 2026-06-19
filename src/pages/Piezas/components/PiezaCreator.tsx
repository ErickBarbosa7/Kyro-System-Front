import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Save, Image as ImageIcon, Check, X } from 'lucide-react';
import { ActionDropdown } from '../../../components/ui/ActionDropdown/ActionDropdown';
import { FieldError } from '../../../components/ui/FieldError/FieldError';
import { Loading } from '../../../components/Loading/Loading';
import { RecipePanel } from './RecipePanel';
import { CostPanel } from './CostPanel';
import { useCosteoCalculator } from '../../../hooks/useCosteoCalculator';
import type { PiezaDraft, MargenConfig, CatalogOption } from '../types';
import { crearPiezaCompleta, actualizarPiezaCompleta, obtenerPiezaPorId } from '../../../services/piezas.service';
import { obtenerMetales } from '../../../services/metales.service';
import { obtenerMateriales } from '../../../services/materiales.service';
import { obtenerAcabados } from '../../../services/acabados.service';
import { obtenerConfiguraciones } from '../../../services/configuracion-margenes.service';
import { subirImagen } from '../../../services/upload.service';
import { obtenerTiposPieza, crearTipoPieza } from '../../../services/tipos-pieza.service';
import { obtenerColecciones, crearColeccion, actualizarColeccion, eliminarColeccion } from '../../../services/colecciones.service';
import './PiezaCreator.css';

interface PiezaCreatorProps {
    isOpen: boolean;
    piezaId?: string | null;
    onClose: () => void;
    onSaved: () => void;
}

const initialDraft: PiezaDraft = {
    clave: '', nombreComercial: '', tipoId: '', coleccionId: '',
    descripcion: '', pesoTotal: '', tiempoFabricacionHrs: '', imagenUrl: '',
    metales: [], materiales: [], acabados: [], manoObra: [],
};

export const PiezaCreator: React.FC<PiezaCreatorProps> = ({ isOpen, piezaId, onClose, onSaved }) => {
    const [draft, setDraft] = useState<PiezaDraft>(initialDraft);
    const [margen, setMargen] = useState<MargenConfig | null>(null);
    const [metales, setMetales] = useState<CatalogOption[]>([]);
    const [materiales, setMateriales] = useState<CatalogOption[]>([]);
    const [acabados, setAcabados] = useState<CatalogOption[]>([]);
    const [tipos, setTipos] = useState<CatalogOption[]>([]);
    const [colecciones, setColecciones] = useState<CatalogOption[]>([]);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [crudModal, setCrudModal] = useState<{
        type: 'tipo' | 'coleccion';
        action: 'add' | 'edit';
        editId?: string;
        nombre: string;
        codigo: string;
    } | null>(null);

    const [confirmDelete, setConfirmDelete] = useState<{
        type: 'tipo' | 'coleccion';
        id: string;
        nombre: string;
    } | null>(null);

    const costeo = useCosteoCalculator(draft, margen);

    useEffect(() => {
        if (!isOpen) return;
        const loadData = async () => {
            setIsLoading(true);
            try {
                const [metalesData, materialesData, acabadosData, margenesData, tiposData, coleccionesData] = await Promise.all([
                    obtenerMetales(),
                    obtenerMateriales('activos'),
                    obtenerAcabados('activos'),
                    obtenerConfiguraciones(),
                    obtenerTiposPieza(),
                    obtenerColecciones('activos'),
                ]);
                setMetales(metalesData);
                setMateriales(materialesData);
                setAcabados(acabadosData);
                setTipos(tiposData);
                setColecciones(coleccionesData);

                const activo = margenesData.find((m: any) => m.activo);
                setMargen(activo || margenesData[0] || null);

                if (piezaId) {
                    const pieza = await obtenerPiezaPorId(piezaId);
                    setDraft({
                        clave: pieza.clave || '',
                        nombreComercial: pieza.nombreComercial || '',
                        tipoId: pieza.tipo?.id || '',
                        coleccionId: pieza.coleccion?.id || '',
                        descripcion: pieza.descripcion || '',
                        pesoTotal: pieza.pesoTotal ?? '',
                        tiempoFabricacionHrs: pieza.tiempoFabricacionHrs ?? '',
                        imagenUrl: pieza.imagenUrl || '',
                        metales: (pieza.costeoMetales || []).map((m: any) => ({
                            metalId: m.metalId,
                            nombre: m.metal?.nombre || '',
                            pesoUtilizadoGr: Number(m.pesoUtilizadoGr),
                            precioGramoSnapshot: Number(m.precioGramoSnapshot),
                            subtotal: Number(m.subtotal),
                        })),
                        materiales: (pieza.costeoMateriales || []).map((m: any) => ({
                            materialId: m.materialId,
                            nombre: m.material?.nombre || '',
                            cantidadUtilizada: Number(m.cantidadUtilizada),
                            costoUnitarioSnapshot: Number(m.costoUnitarioSnapshot),
                            subtotal: Number(m.subtotal),
                        })),
                        acabados: (pieza.costeoAcabados || []).map((a: any) => ({
                            acabadoId: a.acabadoId,
                            nombre: a.acabado?.nombre || '',
                            cantidad: Number(a.cantidad),
                            costoUnitarioSnapshot: Number(a.costoUnitarioSnapshot),
                            subtotal: Number(a.subtotal),
                        })),
                        manoObra: (pieza.costeoManoObra || []).map((mo: any) => ({
                            actividad: mo.actividad || '',
                            tiempoHrs: Number(mo.tiempoHrs),
                            costoPorHora: Number(mo.costoPorHora),
                            subtotal: Number(mo.subtotal),
                        })),
                    });
                    if (pieza.imagenUrl) {
                        setImagePreview(pieza.imagenUrl);
                    }
                }
            } catch {
                toast.error('Error al cargar los datos');
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [isOpen, piezaId]);

    useEffect(() => {
        if (!isOpen) {
            setDraft(initialDraft);
            setImageFile(null);
            setImagePreview('');
            setErrors({});
            setTouched({});
            setIsSaving(false);
            setMargen(null);
            setMetales([]);
            setMateriales([]);
            setAcabados([]);
            setTipos([]);
            setColecciones([]);
        }
    }, [isOpen]);

    const validate = (data: PiezaDraft): Record<string, string> => {
        const e: Record<string, string> = {};
        if (!data.clave?.trim()) e.clave = 'La clave es obligatoria';
        if (!data.nombreComercial?.trim()) e.nombreComercial = 'El nombre comercial es obligatorio';
        if (!data.tipoId) e.tipoId = 'Selecciona un tipo de pieza';
        if (!data.coleccionId) e.coleccionId = 'Selecciona una colección';
        return e;
    };

    const handleFieldChange = (field: string, value: any) => {
        const next = { ...draft, [field]: value };
        setDraft(next);
        if (touched[field]) {
            const newErrors = validate(next);
            setErrors(prev => ({ ...prev, [field]: newErrors[field] }));
        }
    };

    const handleBlur = (field: string) => {
        setTouched(prev => ({ ...prev, [field]: true }));
        const newErrors = validate(draft);
        setErrors(prev => ({ ...prev, [field]: newErrors[field] }));
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImageFile(file);
        const reader = new FileReader();
        reader.onload = (ev) => setImagePreview(ev.target?.result as string);
        reader.readAsDataURL(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (!file || !file.type.startsWith('image/')) return;
        setImageFile(file);
        const reader = new FileReader();
        reader.onload = (ev) => setImagePreview(ev.target?.result as string);
        reader.readAsDataURL(file);
    };

    const handleSave = async () => {
        const validationErrors = validate(draft);
        setErrors(validationErrors);
        setTouched({ clave: true, nombreComercial: true, tipoId: true, coleccionId: true });

        if (Object.keys(validationErrors).length > 0) {
            const firstKey = Object.keys(validationErrors)[0];
            const el = document.querySelector(`[data-field="${firstKey}"]`);
            el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        setIsSaving(true);
        const loadingToast = toast.loading(piezaId ? 'Actualizando pieza...' : 'Guardando pieza...');

        try {
            let imagenUrl = draft.imagenUrl;
            if (imageFile) {
                imagenUrl = await subirImagen(imageFile, 'piezas');
            }

            const dataToSend = {
                tipoId: draft.tipoId,
                coleccionId: draft.coleccionId,
                clave: draft.clave.trim(),
                nombreComercial: draft.nombreComercial.trim(),
                descripcion: draft.descripcion?.trim() || undefined,
                pesoTotal: draft.pesoTotal !== '' ? Number(draft.pesoTotal) : undefined,
                tiempoFabricacionHrs: draft.tiempoFabricacionHrs !== '' ? Number(draft.tiempoFabricacionHrs) : undefined,
                imagenUrl: imagenUrl || undefined,
                metales: draft.metales.map(m => ({ metalId: m.metalId, pesoUtilizadoGr: Number(m.pesoUtilizadoGr) })),
                materiales: draft.materiales.map(m => ({ materialId: m.materialId, cantidadUtilizada: Number(m.cantidadUtilizada) })),
                acabados: draft.acabados.map(a => ({ acabadoId: a.acabadoId, cantidad: Number(a.cantidad) })),
                manoObra: draft.manoObra.map(mo => ({ actividad: mo.actividad, tiempoHrs: Number(mo.tiempoHrs), costoPorHora: Number(mo.costoPorHora) })),
            };

            if (piezaId) {
                await actualizarPiezaCompleta(piezaId, dataToSend);
                toast.success('Pieza actualizada', { id: loadingToast });
            } else {
                await crearPiezaCompleta(dataToSend);
                toast.success('Pieza creada', { id: loadingToast });
            }

            onSaved();
            onClose();
        } catch (error: any) {
            const errorMsg = error.response?.data?.error || 'Error al guardar la pieza';
            toast.error(errorMsg, { id: loadingToast });
        } finally {
            setIsSaving(false);
        }
    };

    const openCrudAdd = (type: 'tipo' | 'coleccion') => {
        setCrudModal({ type, action: 'add', nombre: '', codigo: '' });
    };

    const openCrudEdit = (type: 'tipo' | 'coleccion', id: string) => {
        const items = type === 'tipo' ? tipos : colecciones;
        const item = items.find(i => i.id === id);
        if (!item) return;
        setCrudModal({ type, action: 'edit', editId: id, nombre: item.nombre, codigo: item.codigo || '' });
    };

    const handleCrudSave = async () => {
        if (!crudModal) return;
        const { type, action, editId, nombre, codigo } = crudModal;
        if (!nombre.trim() || !codigo.trim()) {
            toast.error('Todos los campos son obligatorios');
            return;
        }

        try {
            if (type === 'tipo') {
                const result = await crearTipoPieza({ nombre: nombre.trim(), codigo: codigo.trim() });
                const newItem: CatalogOption = { id: result.id || result._id, nombre: result.nombre, codigo: result.codigo };
                setTipos(prev => [...prev, newItem]);
                setDraft(prev => ({ ...prev, tipoId: newItem.id }));
            } else {
                if (action === 'add') {
                    const result = await crearColeccion({ nombre: nombre.trim(), codigo: codigo.trim() });
                    const newItem: CatalogOption = { id: result.id || result._id, nombre: result.nombre, codigo: result.codigo };
                    setColecciones(prev => [...prev, newItem]);
                    setDraft(prev => ({ ...prev, coleccionId: newItem.id }));
                } else if (editId) {
                    await actualizarColeccion(editId, { nombre: nombre.trim(), codigo: codigo.trim() });
                    setColecciones(prev => prev.map(c => c.id === editId ? { ...c, nombre: nombre.trim(), codigo: codigo.trim() } : c));
                    toast.success('Colección actualizada');
                }
            }
            setCrudModal(null);
        } catch (error: any) {
            const errorMsg = error.response?.data?.error || 'Error al guardar';
            toast.error(errorMsg);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!confirmDelete) return;
        const { type, id } = confirmDelete;

        try {
            if (type === 'coleccion') {
                await eliminarColeccion(id);
                setColecciones(prev => prev.filter(c => c.id !== id));
                if (draft.coleccionId === id) {
                    setDraft(prev => ({ ...prev, coleccionId: '' }));
                }
                toast.success('Colección eliminada');
            }
            setConfirmDelete(null);
        } catch (error: any) {
            const errorMsg = error.response?.data?.error || 'Error al eliminar';
            toast.error(errorMsg);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="creator-overlay">
            <div className="creator-header">
                <button className="creator-back-btn" onClick={onClose}>
                    <ArrowLeft size={16} />
                    Volver
                </button>
                <h2 className="creator-title">
                    {piezaId ? 'Editar Pieza' : 'Nueva Pieza'}
                </h2>
            </div>

            {isLoading ? (
                <div className="creator-loading">
                    <Loading texto="Cargando información..." />
                </div>
            ) : (
                <>
                    <div className="creator-body">
                        <div className="creator-left">
                            <div className="creator-image-upload">
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text)' }}>
                                    Imagen
                                </label>
                                <div
                                    className="creator-image-dropzone"
                                    onClick={() => fileInputRef.current?.click()}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={handleDrop}
                                >
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Preview" />
                                    ) : (
                                        <>
                                            <ImageIcon size={28} color="var(--color-border)" />
                                            <p>Click o arrastra una imagen</p>
                                        </>
                                    )}
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={handleImageSelect}
                                />
                            </div>

                            <div className="creator-field" data-field="clave">
                                <label>Clave *</label>
                                <input
                                    className={errors.clave && touched.clave ? 'input-error' : ''}
                                    value={draft.clave}
                                    onChange={(e) => handleFieldChange('clave', e.target.value)}
                                    onBlur={() => handleBlur('clave')}
                                    placeholder="Ej. ANL-001"
                                />
                                <FieldError message={touched.clave ? errors.clave : undefined} />
                            </div>

                            <div className="creator-field" data-field="nombreComercial">
                                <label>Nombre Comercial *</label>
                                <input
                                    className={errors.nombreComercial && touched.nombreComercial ? 'input-error' : ''}
                                    value={draft.nombreComercial}
                                    onChange={(e) => handleFieldChange('nombreComercial', e.target.value)}
                                    onBlur={() => handleBlur('nombreComercial')}
                                    placeholder="Ej. Anillo Luna"
                                />
                                <FieldError message={touched.nombreComercial ? errors.nombreComercial : undefined} />
                            </div>

                            <div className="creator-field" data-field="tipoId">
                                <label>Tipo de Pieza *</label>
                                <ActionDropdown
                                    value={draft.tipoId}
                                    options={tipos}
                                    onChange={(val) => handleFieldChange('tipoId', val)}
                                    placeholder="Selecciona tipo"
                                    onAdd={() => openCrudAdd('tipo')}
                                    addLabel="Crear tipo"
                                />
                                <FieldError message={touched.tipoId ? errors.tipoId : undefined} />
                            </div>

                            <div className="creator-field" data-field="coleccionId">
                                <label>Colección *</label>
                                <ActionDropdown
                                    value={draft.coleccionId}
                                    options={colecciones}
                                    onChange={(val) => handleFieldChange('coleccionId', val)}
                                    placeholder="Selecciona colección"
                                    onAdd={() => openCrudAdd('coleccion')}
                                    addLabel="Crear colección"
                                    onEdit={(id) => openCrudEdit('coleccion', id)}
                                    onDelete={(id, nombre) => setConfirmDelete({ type: 'coleccion', id, nombre })}
                                />
                                <FieldError message={touched.coleccionId ? errors.coleccionId : undefined} />
                            </div>

                            <div className="creator-field">
                                <label>Descripción</label>
                                <textarea
                                    value={draft.descripcion}
                                    onChange={(e) => handleFieldChange('descripcion', e.target.value)}
                                    placeholder="Describe el diseño, materiales o notas relevantes..."
                                />
                            </div>

                            <div className="creator-field">
                                <label>Peso Total (gr)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={draft.pesoTotal}
                                    onChange={(e) => handleFieldChange('pesoTotal', e.target.value === '' ? '' : Number(e.target.value))}
                                    placeholder="0.00"
                                />
                            </div>

                            <div className="creator-field">
                                <label>Tiempo Fabricación (hrs)</label>
                                <input
                                    type="number"
                                    step="0.5"
                                    min="0"
                                    value={draft.tiempoFabricacionHrs}
                                    onChange={(e) => handleFieldChange('tiempoFabricacionHrs', e.target.value === '' ? '' : Number(e.target.value))}
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        <div className="creator-center">
                            <RecipePanel
                                draft={draft}
                                onChange={setDraft}
                                metales={metales}
                                materiales={materiales}
                                acabados={acabados}
                            />
                        </div>

                        <div className="creator-right">
                            <CostPanel costeo={costeo} />
                        </div>
                    </div>

                    <div className="creator-footer">
                        <div className="creator-footer-cost">
                            <span>
                                Costo Directo: <strong>${costeo.costeDirecto.toFixed(2)}</strong>
                            </span>
                            {costeo.margen && (
                                <span className="final-price">
                                    Público: ${costeo.margen.precioPublico.toFixed(2)}
                                </span>
                            )}
                        </div>
                        <button
                            className="btn-creator-save"
                            onClick={handleSave}
                            disabled={isSaving}
                        >
                            <Save size={18} />
                            {isSaving ? 'Guardando...' : 'Guardar Pieza'}
                        </button>
                    </div>
                </>
            )}

            {crudModal && (
                <div className="creator-crud-overlay" onClick={() => setCrudModal(null)}>
                    <div className="creator-crud-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>
                            {crudModal.action === 'add'
                                ? `Nuev${crudModal.type === 'tipo' ? 'o' : 'a'} ${crudModal.type === 'tipo' ? 'Tipo' : 'Colección'}`
                                : `Editar ${crudModal.type === 'tipo' ? 'Tipo' : 'Colección'}`}
                        </h3>
                        <div className="creator-field">
                            <label>Nombre</label>
                            <input
                                value={crudModal.nombre}
                                onChange={(e) => setCrudModal(prev => prev ? { ...prev, nombre: e.target.value } : null)}
                                placeholder={crudModal.type === 'tipo' ? 'Ej. Anillo' : 'Ej. Naturaleza'}
                                autoFocus
                            />
                        </div>
                        <div className="creator-field">
                            <label>Código</label>
                            <input
                                value={crudModal.codigo}
                                onChange={(e) => setCrudModal(prev => prev ? { ...prev, codigo: e.target.value } : null)}
                                placeholder={crudModal.type === 'tipo' ? 'Ej. ANL' : 'Ej. NAT'}
                            />
                        </div>
                        <div className="creator-crud-modal-actions">
                            <button className="btn-crud-cancel" onClick={() => setCrudModal(null)}>
                                Cancelar
                            </button>
                            <button className="btn-crud-save" onClick={handleCrudSave}>
                                {crudModal.action === 'add' ? 'Crear' : 'Guardar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {confirmDelete && (
                <div className="creator-crud-overlay" onClick={() => setConfirmDelete(null)}>
                    <div className="creator-crud-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>Confirmar eliminación</h3>
                        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', margin: 0 }}>
                            ¿Estás seguro de eliminar "{confirmDelete.nombre}"?
                        </p>
                        <div className="creator-crud-modal-actions">
                            <button className="btn-crud-cancel" onClick={() => setConfirmDelete(null)}>
                                Cancelar
                            </button>
                            <button className="btn-crud-danger" onClick={handleDeleteConfirm}>
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
