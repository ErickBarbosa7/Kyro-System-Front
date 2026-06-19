import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Calculator, Plus, Pencil, Trash2, Weight, Box, Sparkles, Clock, DollarSign, TrendingUp } from 'lucide-react';
import { ActionDropdown } from '../../components/ui/ActionDropdown/ActionDropdown';
import { Modal } from '../../components/ui/Modal/Modal';
import { ConfirmModal } from '../../components/ConfirmModal';
import { Loading } from '../../components/Loading/Loading';

import { obtenerPiezas, type PiezaData } from '../../services/piezas.service';
import { obtenerMetales } from '../../services/metales.service';
import { obtenerMateriales } from '../../services/materiales.service';
import { obtenerAcabados } from '../../services/acabados.service';
import { obtenerGastos } from '../../services/gastos-operativos.service';
import {
    obtenerCosteoPieza,
    calcularTotales,
    agregarMetal,
    agregarMaterial,
    agregarAcabado,
    agregarManoObra,
    agregarGasto,
    actualizarMetal,
    actualizarMaterial,
    actualizarAcabado,
    actualizarManoObra,
    actualizarGasto,
    eliminarMetal,
    eliminarMaterial,
    eliminarAcabado,
    eliminarManoObra,
    eliminarGasto,
} from '../../services/costeo.service';

import './Costeo.css';

interface CosteoItem {
    id: string;
    nombre: string;
    cantidad: number;
    costoUnitario: number;
    subtotal: number;
}

interface CosteoSection {
    titulo: string;
    icono: React.ReactNode;
    items: CosteoItem[];
    tipo: 'metal' | 'material' | 'acabado' | 'manoObra' | 'gasto';
    color: string;
}

export const Costeo = () => {
    const [piezas, setPiezas] = useState<(PiezaData & { id: string })[]>([]);
    const [piezaSeleccionada, setPiezaSeleccionada] = useState<string>('');
    const [piezaInfo, setPiezaInfo] = useState<{ clave: string; nombreComercial: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingPiezas, setIsLoadingPiezas] = useState(true);

    const [metalesCatalog, setMetalesCatalog] = useState<{ id: string; nombre: string }[]>([]);
    const [materialesCatalog, setMaterialesCatalog] = useState<{ id: string; nombre: string }[]>([]);
    const [acabadosCatalog, setAcabadosCatalog] = useState<{ id: string; nombre: string }[]>([]);
    const [gastosCatalog, setGastosCatalog] = useState<{ id: string; nombre: string }[]>([]);

    const [sections, setSections] = useState<CosteoSection[]>([
        { titulo: 'Metales', icono: <Weight size={18} />, items: [], tipo: 'metal', color: '#f59e0b' },
        { titulo: 'Materiales', icono: <Box size={18} />, items: [], tipo: 'material', color: '#3b82f6' },
        { titulo: 'Acabados', icono: <Sparkles size={18} />, items: [], tipo: 'acabado', color: '#8b5cf6' },
        { titulo: 'Mano de Obra', icono: <Clock size={18} />, items: [], tipo: 'manoObra', color: '#10b981' },
        { titulo: 'Gastos Aplicados', icono: <DollarSign size={18} />, items: [], tipo: 'gasto', color: '#ef4444' },
    ]);

    const [totales, setTotales] = useState<{
        costeDirecto: number;
        costeTotal: number;
        margenes?: {
            nombre: string;
            precioTaller: number;
            precioMayorista: number;
            precioPublico: number;
        } | null;
    } | null>(null);

    const [modalSection, setModalSection] = useState<CosteoSection['tipo'] | null>(null);
    const [editItemId, setEditItemId] = useState<string | null>(null);
    const [modalData, setModalData] = useState<any>({});
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [deleteTarget, setDeleteTarget] = useState<{ id: string; section: CosteoSection['tipo'] } | null>(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    const labelStyle = { color: 'var(--color-text)', fontWeight: 700 };
    const inputStyle = { backgroundColor: 'var(--color-background)', color: 'var(--color-text)' };

    useEffect(() => {
        cargarCatalogos();
    }, []);

    const cargarCatalogos = async () => {
        setIsLoadingPiezas(true);
        try {
            const [piezasData, metalesData, materialesData, acabadosData, gastosData] = await Promise.all([
                obtenerPiezas('activos'),
                obtenerMetales(),
                obtenerMateriales('activos'),
                obtenerAcabados('activos'),
                obtenerGastos(),
            ]);
            setPiezas(piezasData);
            setMetalesCatalog(metalesData);
            setMaterialesCatalog(materialesData);
            setAcabadosCatalog(acabadosData);
            setGastosCatalog(gastosData.map((g: any) => ({ id: g.id, nombre: g.concepto })));
        } catch (error) {
            toast.error('Error al cargar catálogos');
        } finally {
            setIsLoadingPiezas(false);
        }
    };

    const cargarCosteo = async (piezaId: string) => {
        setIsLoading(true);
        try {
            const [costeoData, totalesData] = await Promise.all([
                obtenerCosteoPieza(piezaId),
                calcularTotales(piezaId),
            ]);

            setPiezaInfo(costeoData.pieza);

            const mapItems = (arr: any[], nombreKey: string, cantidadKey: string, precioKey: string): CosteoItem[] =>
                arr.map((item: any) => ({
                    id: item.id,
                    nombre: item[nombreKey]?.nombre || item[nombreKey] || '—',
                    cantidad: Number(item[cantidadKey]),
                    costoUnitario: Number(item[precioKey]),
                    subtotal: Number(item.subtotal),
                }));

            setSections([
                { titulo: 'Metales', icono: <Weight size={18} />, items: mapItems(costeoData.metales, 'metal', 'pesoUtilizadoGr', 'precioGramoSnapshot'), tipo: 'metal', color: '#f59e0b' },
                { titulo: 'Materiales', icono: <Box size={18} />, items: mapItems(costeoData.materiales, 'material', 'cantidadUtilizada', 'costoUnitarioSnapshot'), tipo: 'material', color: '#3b82f6' },
                { titulo: 'Acabados', icono: <Sparkles size={18} />, items: mapItems(costeoData.acabados, 'acabado', 'cantidad', 'costoUnitarioSnapshot'), tipo: 'acabado', color: '#8b5cf6' },
                { titulo: 'Mano de Obra', icono: <Clock size={18} />, items: mapItems(costeoData.manoObra, 'actividad', 'tiempoHrs', 'costoPorHora'), tipo: 'manoObra', color: '#10b981' },
                { titulo: 'Gastos Aplicados', icono: <DollarSign size={18} />, items: mapItems(costeoData.gastos, 'gastoOperativo', 'importeAplicado', 'importeAplicado'), tipo: 'gasto', color: '#ef4444' },
            ]);

            setTotales(totalesData);
        } catch (error) {
            toast.error('Error al cargar el costeo de la pieza');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePiezaChange = (value: string) => {
        setPiezaSeleccionada(value);
        if (value) {
            cargarCosteo(value);
        } else {
            setPiezaInfo(null);
            setTotales(null);
            setSections(prev => prev.map(s => ({ ...s, items: [] })));
        }
    };

    const abrirModalAgregar = (tipo: CosteoSection['tipo']) => {
        setModalSection(tipo);
        setEditItemId(null);
        setModalData({});
        setIsModalOpen(true);
    };

    const abrirModalEditar = (tipo: CosteoSection['tipo'], item: CosteoItem) => {
        setModalSection(tipo);
        setEditItemId(item.id);
        if (tipo === 'metal') setModalData({ metalId: item.nombre, pesoUtilizadoGr: item.cantidad });
        else if (tipo === 'material') setModalData({ materialId: item.nombre, cantidadUtilizada: item.cantidad });
        else if (tipo === 'acabado') setModalData({ acabadoId: item.nombre, cantidad: item.cantidad });
        else if (tipo === 'manoObra') setModalData({ actividad: item.nombre, tiempoHrs: item.cantidad, costoPorHora: item.costoUnitario });
        else if (tipo === 'gasto') setModalData({ gastoId: item.nombre, importeAplicado: item.subtotal });
        setIsModalOpen(true);
    };

    const handleModalSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!piezaSeleccionada) return;

        const loadingToast = toast.loading('Guardando...');
        try {
            if (modalSection === 'metal') {
                if (editItemId) {
                    await actualizarMetal(editItemId, { pesoUtilizadoGr: modalData.pesoUtilizadoGr });
                } else {
                    await agregarMetal(piezaSeleccionada, { metalId: modalData.metalId, pesoUtilizadoGr: modalData.pesoUtilizadoGr });
                }
            } else if (modalSection === 'material') {
                if (editItemId) {
                    await actualizarMaterial(editItemId, { cantidadUtilizada: modalData.cantidadUtilizada });
                } else {
                    await agregarMaterial(piezaSeleccionada, { materialId: modalData.materialId, cantidadUtilizada: modalData.cantidadUtilizada });
                }
            } else if (modalSection === 'acabado') {
                if (editItemId) {
                    await actualizarAcabado(editItemId, { cantidad: modalData.cantidad });
                } else {
                    await agregarAcabado(piezaSeleccionada, { acabadoId: modalData.acabadoId, cantidad: modalData.cantidad });
                }
            } else if (modalSection === 'manoObra') {
                if (editItemId) {
                    await actualizarManoObra(editItemId, { actividad: modalData.actividad, tiempoHrs: modalData.tiempoHrs, costoPorHora: modalData.costoPorHora });
                } else {
                    await agregarManoObra(piezaSeleccionada, { actividad: modalData.actividad, tiempoHrs: modalData.tiempoHrs, costoPorHora: modalData.costoPorHora });
                }
            } else if (modalSection === 'gasto') {
                if (editItemId) {
                    await actualizarGasto(editItemId, { importeAplicado: modalData.importeAplicado });
                } else {
                    await agregarGasto(piezaSeleccionada, { gastoId: modalData.gastoId, importeAplicado: modalData.importeAplicado });
                }
            }

            toast.success('Guardado correctamente', { id: loadingToast });
            setIsModalOpen(false);
            cargarCosteo(piezaSeleccionada);
        } catch (error) {
            toast.error('Error al guardar', { id: loadingToast });
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        const loadingToast = toast.loading('Eliminando...');
        try {
            const { id, section } = deleteTarget;
            if (section === 'metal') await eliminarMetal(id);
            else if (section === 'material') await eliminarMaterial(id);
            else if (section === 'acabado') await eliminarAcabado(id);
            else if (section === 'manoObra') await eliminarManoObra(id);
            else if (section === 'gasto') await eliminarGasto(id);

            toast.success('Eliminado correctamente', { id: loadingToast });
            setIsConfirmOpen(false);
            setDeleteTarget(null);
            cargarCosteo(piezaSeleccionada);
        } catch (error) {
            toast.error('Error al eliminar', { id: loadingToast });
        }
    };

    const renderModalForm = () => {
        if (!modalSection) return null;

        if (modalSection === 'metal') {
            return (
                <>
                    {!editItemId && (
                        <div className="form-group">
                            <label style={labelStyle}>Metal</label>
                            <ActionDropdown
                                value={modalData.metalId || ''}
                                options={metalesCatalog}
                                onChange={(val) => setModalData((prev: any) => ({ ...prev, metalId: val }))}
                                placeholder="Selecciona metal"
                            />
                        </div>
                    )}
                    <div className="form-group">
                        <label style={labelStyle}>Peso Utilizado (gr) *</label>
                        <input style={inputStyle} type="number" name="pesoUtilizadoGr" value={modalData.pesoUtilizadoGr || ''} onChange={(e) => setModalData((prev: any) => ({ ...prev, pesoUtilizadoGr: Number(e.target.value) }))} step="0.01" min="0" placeholder="0.00" required />
                    </div>
                </>
            );
        }

        if (modalSection === 'material') {
            return (
                <>
                    {!editItemId && (
                        <div className="form-group">
                            <label style={labelStyle}>Material</label>
                            <ActionDropdown
                                value={modalData.materialId || ''}
                                options={materialesCatalog}
                                onChange={(val) => setModalData((prev: any) => ({ ...prev, materialId: val }))}
                                placeholder="Selecciona material"
                            />
                        </div>
                    )}
                    <div className="form-group">
                        <label style={labelStyle}>Cantidad Utilizada *</label>
                        <input style={inputStyle} type="number" name="cantidadUtilizada" value={modalData.cantidadUtilizada || ''} onChange={(e) => setModalData((prev: any) => ({ ...prev, cantidadUtilizada: Number(e.target.value) }))} step="0.01" min="0" placeholder="0.00" required />
                    </div>
                </>
            );
        }

        if (modalSection === 'acabado') {
            return (
                <>
                    {!editItemId && (
                        <div className="form-group">
                            <label style={labelStyle}>Acabado</label>
                            <ActionDropdown
                                value={modalData.acabadoId || ''}
                                options={acabadosCatalog}
                                onChange={(val) => setModalData((prev: any) => ({ ...prev, acabadoId: val }))}
                                placeholder="Selecciona acabado"
                            />
                        </div>
                    )}
                    <div className="form-group">
                        <label style={labelStyle}>Cantidad *</label>
                        <input style={inputStyle} type="number" name="cantidad" value={modalData.cantidad || ''} onChange={(e) => setModalData((prev: any) => ({ ...prev, cantidad: Number(e.target.value) }))} step="0.01" min="0" placeholder="0.00" required />
                    </div>
                </>
            );
        }

        if (modalSection === 'manoObra') {
            return (
                <>
                    <div className="form-group">
                        <label style={labelStyle}>Actividad *</label>
                        <input style={inputStyle} type="text" name="actividad" value={modalData.actividad || ''} onChange={(e) => setModalData((prev: any) => ({ ...prev, actividad: e.target.value }))} placeholder="Ej. Ensamble, Engaste..." required />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label style={labelStyle}>Tiempo (hrs) *</label>
                            <input style={inputStyle} type="number" name="tiempoHrs" value={modalData.tiempoHrs || ''} onChange={(e) => setModalData((prev: any) => ({ ...prev, tiempoHrs: Number(e.target.value) }))} step="0.5" min="0" placeholder="0.00" required />
                        </div>
                        <div className="form-group">
                            <label style={labelStyle}>Costo por Hora ($) *</label>
                            <input style={inputStyle} type="number" name="costoPorHora" value={modalData.costoPorHora || ''} onChange={(e) => setModalData((prev: any) => ({ ...prev, costoPorHora: Number(e.target.value) }))} step="0.01" min="0" placeholder="0.00" required />
                        </div>
                    </div>
                </>
            );
        }

        if (modalSection === 'gasto') {
            return (
                <>
                    {!editItemId && (
                        <div className="form-group">
                            <label style={labelStyle}>Gasto Operativo</label>
                            <ActionDropdown
                                value={modalData.gastoId || ''}
                                options={gastosCatalog}
                                onChange={(val) => setModalData((prev: any) => ({ ...prev, gastoId: val }))}
                                placeholder="Selecciona gasto"
                            />
                        </div>
                    )}
                    <div className="form-group">
                        <label style={labelStyle}>Importe Aplicado ($) *</label>
                        <input style={inputStyle} type="number" name="importeAplicado" value={modalData.importeAplicado || ''} onChange={(e) => setModalData((prev: any) => ({ ...prev, importeAplicado: Number(e.target.value) }))} step="0.01" min="0" placeholder="0.00" required />
                    </div>
                </>
            );
        }

        return null;
    };

    return (
        <div className="module-container">
            <div className="module-header">
                <div className="module-title">
                    <Calculator size={28} color="var(--color-primary)" />
                    <h2 style={{ color: 'var(--color-primary)' }}>Costeo de Piezas</h2>
                </div>
            </div>

            <div className="module-description">
                <p>Calcula y administra los costos de producción de cada pieza: metales, materiales, acabados, mano de obra y gastos.</p>
            </div>

            <div className="costeo-selector">
                <div className="costeo-selector-label">
                    <label style={labelStyle}>Selecciona una Pieza</label>
                </div>
                <div className="costeo-selector-input">
                    <ActionDropdown
                        value={piezaSeleccionada}
                        options={piezas.map(p => ({ id: p.id, nombre: `${p.clave} — ${p.nombreComercial}` }))}
                        onChange={handlePiezaChange}
                        placeholder="Buscar y seleccionar pieza..."
                    />
                </div>
            </div>

            {piezaInfo && (
                <div className="costeo-info-card">
                    <div className="costeo-info-clave">{piezaInfo.clave}</div>
                    <div className="costeo-info-nombre">{piezaInfo.nombreComercial}</div>
                </div>
            )}

            {isLoading ? (
                <Loading texto="Cargando costeo..." />
            ) : piezaSeleccionada ? (
                <>
                    <div className="costeo-grid">
                        {sections.map(section => (
                            <div key={section.tipo} className="costeo-section" style={{ borderTopColor: section.color }}>
                                <div className="costeo-section-header">
                                    <div className="costeo-section-title">
                                        {section.icono}
                                        <span>{section.titulo}</span>
                                    </div>
                                    <button className="btn-icon add" onClick={() => abrirModalAgregar(section.tipo)} title={`Agregar ${section.titulo.toLowerCase()}`}>
                                        <Plus size={18} />
                                    </button>
                                </div>

                                {section.items.length === 0 ? (
                                    <div className="costeo-section-empty">
                                        <p>Sin registros</p>
                                    </div>
                                ) : (
                                    <div className="costeo-items">
                                        {section.items.map(item => (
                                            <div key={item.id} className="costeo-item">
                                                <div className="costeo-item-info">
                                                    <span className="costeo-item-nombre">{item.nombre}</span>
                                                    <span className="costeo-item-detalle">
                                                        {section.tipo === 'metal' && `${item.cantidad} gr × $${item.costoUnitario.toFixed(2)}`}
                                                        {section.tipo === 'material' && `${item.cantidad} und × $${item.costoUnitario.toFixed(2)}`}
                                                        {section.tipo === 'acabado' && `${item.cantidad} × $${item.costoUnitario.toFixed(2)}`}
                                                        {section.tipo === 'manoObra' && `${item.cantidad} hrs × $${item.costoUnitario.toFixed(2)}/hr`}
                                                        {section.tipo === 'gasto' && `$${item.subtotal.toFixed(2)}`}
                                                    </span>
                                                </div>
                                                <div className="costeo-item-actions">
                                                    <span className="costeo-item-subtotal">${item.subtotal.toFixed(2)}</span>
                                                    <button className="btn-icon edit" onClick={() => abrirModalEditar(section.tipo, item)} title="Editar">
                                                        <Pencil size={14} />
                                                    </button>
                                                    <button className="btn-icon delete" onClick={() => { setDeleteTarget({ id: item.id, section: section.tipo }); setIsConfirmOpen(true); }} title="Eliminar">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {section.items.length > 0 && (
                                    <div className="costeo-section-total" style={{ color: section.color }}>
                                        Total: ${section.items.reduce((sum, i) => sum + i.subtotal, 0).toFixed(2)}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {totales && (
                        <div className="costeo-totales-card">
                            <div className="costeo-totales-header">
                                <TrendingUp size={20} />
                                <span>Resumen de Costos</span>
                            </div>
                            <div className="costeo-totales-grid">
                                <div className="costeo-total-item">
                                    <span className="costeo-total-label">Coste Directo</span>
                                    <span className="costeo-total-value">${totales.costeDirecto.toFixed(2)}</span>
                                </div>
                                <div className="costeo-total-item">
                                    <span className="costeo-total-label">Coste Total</span>
                                    <span className="costeo-total-value costeo-total-value--grande">${totales.costeTotal.toFixed(2)}</span>
                                </div>
                                {totales.margenes && (
                                    <>
                                        <div className="costeo-total-item">
                                            <span className="costeo-total-label">Margen Taller ({((totales.margenes.margenTaller - 1) * 100).toFixed(0)}%)</span>
                                            <span className="costeo-total-value">${totales.margenes.precioTaller.toFixed(2)}</span>
                                        </div>
                                        <div className="costeo-total-item">
                                            <span className="costeo-total-label">Margen Mayorista ({((totales.margenes.margenMayorista - 1) * 100).toFixed(0)}%)</span>
                                            <span className="costeo-total-value">${totales.margenes.precioMayorista.toFixed(2)}</span>
                                        </div>
                                        <div className="costeo-total-item">
                                            <span className="costeo-total-label">Margen Público ({((totales.margenes.margenPublico - 1) * 100).toFixed(0)}%)</span>
                                            <span className="costeo-total-value costeo-total-value--precio">${totales.margenes.precioPublico.toFixed(2)}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </>
            ) : !isLoadingPiezas ? (
                <div className="costeo-empty">
                    <Calculator size={48} color="var(--color-text-secondary)" opacity={0.4} />
                    <p>Selecciona una pieza para ver su desglose de costos</p>
                </div>
            ) : null}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={<span style={{ color: 'var(--color-text)' }}>{editItemId ? 'Editar' : 'Agregar'} {modalSection === 'metal' ? 'Metal' : modalSection === 'material' ? 'Material' : modalSection === 'acabado' ? 'Acabado' : modalSection === 'manoObra' ? 'Mano de Obra' : 'Gasto'}</span>}
                maxWidth="500px"
                zIndex={998}
            >
                <form onSubmit={handleModalSubmit} className="modal-form">
                    {renderModalForm()}
                    <div className="modal-footer" style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                        <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                        <button type="submit" className="btn-primary">{editItemId ? 'Guardar Cambios' : 'Agregar'}</button>
                    </div>
                </form>
            </Modal>

            <ConfirmModal
                isOpen={isConfirmOpen}
                title="Eliminar elemento"
                message="¿Estás seguro de eliminar este elemento del costeo?"
                onConfirm={handleDelete}
                onCancel={() => { setIsConfirmOpen(false); setDeleteTarget(null); }}
                confirmText="Sí, eliminar"
            />
        </div>
    );
};
