import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Edit3, Gem, Clock, Weight, Image as ImageIcon, Package, Layers, DollarSign, Trash2 } from 'lucide-react';
import { SlideOver } from '../../../components/ui/SlideOver/SlideOver';
import { ConfirmModal } from '../../../components/ConfirmModal';
import { Loading } from '../../../components/Loading/Loading';
import { obtenerPiezaPorId, eliminarPieza } from '../../../services/piezas.service';
import { calcularTotales } from '../../../services/costeo.service';
import { obtenerConfiguraciones } from '../../../services/configuracion-margenes.service';
import type { PiezaFullData, CosteoBreakdown } from '../types';
import './PiezaSlideOver.css';

interface PiezaSlideOverProps {
    isOpen: boolean;
    piezaId: string | null;
    onClose: () => void;
    onEdit: (id: string) => void;
    onDeleted?: () => void;
}

export const PiezaSlideOver: React.FC<PiezaSlideOverProps> = ({ isOpen, piezaId, onClose, onEdit, onDeleted }) => {
    const [pieza, setPieza] = useState<PiezaFullData | null>(null);
    const [costeo, setCosteo] = useState<CosteoBreakdown | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    useEffect(() => {
        if (!isOpen || !piezaId) return;
        setIsLoading(true);
        Promise.all([
            obtenerPiezaPorId(piezaId),
            calcularTotales(piezaId).catch(() => null),
            obtenerConfiguraciones('activos'),
        ])
            .then(([piezaData, costeoData, configuraciones]) => {
                setPieza(piezaData);
                if (costeoData) {
                    const activo = configuraciones.find((m: any) => m.activo) || configuraciones[0] || null;
                    const margen = activo
                        ? {
                            nombre: activo.nombre,
                            margenTaller: Number(activo.margenTaller),
                            margenMayorista: Number(activo.margenMayorista),
                            margenPublico: Number(activo.margenPublico),
                            precioTaller: Number((costeoData.costeTotal * (1 + Number(activo.margenTaller) / 100)).toFixed(2)),
                            precioMayorista: Number((costeoData.costeTotal * (1 + Number(activo.margenMayorista) / 100)).toFixed(2)),
                            precioPublico: Number((costeoData.costeTotal * (1 + Number(activo.margenPublico) / 100)).toFixed(2)),
                        }
                        : null;
                    setCosteo({
                        totalMetales: costeoData.desglose.metales.total,
                        totalMateriales: costeoData.desglose.materiales.total,
                        totalAcabados: costeoData.desglose.acabados.total,
                        totalManoObra: costeoData.desglose.manoObra.total,
                        costeDirecto: costeoData.costeDirecto,
                        costeTotal: costeoData.costeTotal,
                        margen,
                        items: {
                            metales: [],
                            materiales: [],
                            acabados: [],
                            manoObra: [],
                        },
                    });
                }
            })
            .catch(() => {})
            .finally(() => setIsLoading(false));
    }, [isOpen, piezaId]);

    const handleDelete = async () => {
        if (!piezaId) return;
        const loadingToast = toast.loading('Descontinuando pieza...');
        try {
            await eliminarPieza(piezaId);
            toast.success('Pieza descontinuada', { id: loadingToast });
            setConfirmDelete(false);
            onDeleted?.();
            onClose();
        } catch {
            toast.error('Error al descontinuar la pieza', { id: loadingToast });
        }
    };

    return (
        <>
            <SlideOver
                isOpen={isOpen}
                onClose={onClose}
                title={
                    <div className="modal-title-flex">
                        <span>{pieza?.nombreComercial || 'Detalle de Pieza'}</span>
                        {pieza?.clave && <span className="modal-title-clave">{pieza.clave}</span>}
                    </div>
                }
                width="700px"
            >
                {isLoading ? (
                    <Loading texto="Cargando detalles..." />
                ) : pieza ? (
                    <>
                        <div className="pieza-detail-top">
                            <div className="pieza-detail-image-wrap">
                                {pieza.imagenUrl ? (
                                    <img src={pieza.imagenUrl} alt={pieza.nombreComercial} className="pieza-detail-image" />
                                ) : (
                                    <div className="pieza-detail-image-placeholder">
                                        <ImageIcon size={48} color="var(--color-border)" />
                                    </div>
                                )}
                            </div>

                            <div className="pieza-detail-info-wrap">
                                <div className="pieza-detail-info-grid">
                                    <div className="pieza-detail-info-item">
                                        <Gem size={14} />
                                        <span className="info-label">Clave</span>
                                        <span className="info-value">{pieza.clave}</span>
                                    </div>
                                    <div className="pieza-detail-info-item">
                                        <Package size={14} />
                                        <span className="info-label">Tipo</span>
                                        <span className="info-value">{pieza.tipo?.nombre || '—'}</span>
                                    </div>
                                    <div className="pieza-detail-info-item">
                                        <Layers size={14} />
                                        <span className="info-label">Colección</span>
                                        <span className="info-value">{pieza.coleccion?.nombre || '—'}</span>
                                    </div>
                                    <div className="pieza-detail-info-item">
                                        <Weight size={14} />
                                        <span className="info-label">Peso</span>
                                        <span className="info-value">{pieza.pesoTotal ? `${pieza.pesoTotal} gr` : '—'}</span>
                                    </div>
                                    <div className="pieza-detail-info-item">
                                        <Clock size={14} />
                                        <span className="info-label">Tiempo Fab.</span>
                                        <span className="info-value">{pieza.tiempoFabricacionHrs ? `${pieza.tiempoFabricacionHrs} hrs` : '—'}</span>
                                    </div>
                                    <div className="pieza-detail-info-item">
                                        <DollarSign size={14} />
                                        <span className="info-label">Estado</span>
                                        <span className={`info-value ${pieza.estado === 'DESCONTINUADO' ? 'estado-descontinuado' : ''}`}>{pieza.estado}</span>
                                    </div>
                                </div>

                                {pieza.descripcion && (
                                    <div className="pieza-detail-desc">
                                        <p>{pieza.descripcion}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="pieza-detail-bottom">
                            <div className="pieza-detail-recipe">
                                <h4>Receta de Materiales</h4>
                                {pieza.costeoMetales?.length > 0 && (
                                    <div className="recipe-group">
                                        <h5>Metales</h5>
                                        {pieza.costeoMetales.map((m: any) => (
                                            <div key={m.id} className="recipe-row">
                                                <span>{m.metal?.nombre}</span>
                                                <span>{Number(m.pesoUtilizadoGr).toFixed(2)} gr</span>
                                                <span>${Number(m.subtotal).toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {pieza.costeoMateriales?.length > 0 && (
                                    <div className="recipe-group">
                                        <h5>Materiales</h5>
                                        {pieza.costeoMateriales.map((m: any) => (
                                            <div key={m.id} className="recipe-row">
                                                <span>{m.material?.nombre}</span>
                                                <span>{Number(m.cantidadUtilizada)} pz</span>
                                                <span>${Number(m.subtotal).toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {pieza.costeoAcabados?.length > 0 && (
                                    <div className="recipe-group">
                                        <h5>Acabados</h5>
                                        {pieza.costeoAcabados.map((a: any) => (
                                            <div key={a.id} className="recipe-row">
                                                <span>{a.acabado?.nombre}</span>
                                                <span>{Number(a.cantidad)} pz</span>
                                                <span>${Number(a.subtotal).toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {pieza.costeoManoObra?.length > 0 && (
                                    <div className="recipe-group">
                                        <h5>Mano de Obra</h5>
                                        {pieza.costeoManoObra.map((mo: any) => (
                                            <div key={mo.id} className="recipe-row">
                                                <span>{mo.actividad}</span>
                                                <span>{Number(mo.tiempoHrs)} hrs</span>
                                                <span>${Number(mo.subtotal).toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {(!pieza.costeoMetales?.length && !pieza.costeoMateriales?.length && !pieza.costeoAcabados?.length && !pieza.costeoManoObra?.length) && (
                                    <p className="recipe-empty">Sin receta registrada</p>
                                )}
                            </div>

                            <div className="pieza-detail-costeo-wrap">
                                {costeo && (
                                    <div className="pieza-detail-costeo-card">
                                        <h4>Costeo</h4>
                                        <div className="costeo-summary">
                                            <div className="costeo-row">
                                                <span>Metales</span>
                                                <span className="costeo-value">${costeo.totalMetales.toFixed(2)}</span>
                                            </div>
                                            <div className="costeo-row">
                                                <span>Materiales</span>
                                                <span className="costeo-value">${costeo.totalMateriales.toFixed(2)}</span>
                                            </div>
                                            <div className="costeo-row">
                                                <span>Acabados</span>
                                                <span className="costeo-value">${costeo.totalAcabados.toFixed(2)}</span>
                                            </div>
                                            <div className="costeo-row">
                                                <span>Mano de Obra</span>
                                                <span className="costeo-value">${costeo.totalManoObra.toFixed(2)}</span>
                                            </div>
                                            <div className="costeo-divider" />
                                            <div className="costeo-row total">
                                                <span>Coste Directo</span>
                                                <span className="costeo-value">${costeo.costeDirecto.toFixed(2)}</span>
                                            </div>
                                            <div className="costeo-row total">
                                                <span>Coste Total</span>
                                                <span className="costeo-value costeo-value--grande">${costeo.costeTotal.toFixed(2)}</span>
                                            </div>
                                            {costeo.margen && (
                                                <>
                                                    <div className="costeo-divider" />
                                                    <div className="costeo-row">
                                                        <span>Taller ({Math.round(costeo.margen.margenTaller)}%)</span>
                                                        <span className="costeo-value">${costeo.margen.precioTaller.toFixed(2)}</span>
                                                    </div>
                                                    <div className="costeo-row">
                                                        <span>Mayorista ({Math.round(costeo.margen.margenMayorista)}%)</span>
                                                        <span className="costeo-value">${costeo.margen.precioMayorista.toFixed(2)}</span>
                                                    </div>
                                                    <div className="costeo-row final">
                                                        <span>Público ({Math.round(costeo.margen.margenPublico)}%)</span>
                                                        <span className="costeo-value publico">${costeo.margen.precioPublico.toFixed(2)}</span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="pieza-detail-actions">
                                    <button className="btn-primary" onClick={() => { onEdit(piezaId!); onClose(); }}>
                                        <Edit3 size={16} /> Editar
                                    </button>
                                    {pieza.estado !== 'DESCONTINUADO' && (
                                        <button className="btn-danger" onClick={() => setConfirmDelete(true)}>
                                            <Trash2 size={16} /> Descontinuar
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <p className="pieza-detail-error">No se pudieron cargar los datos</p>
                )}
            </SlideOver>

            <ConfirmModal
                isOpen={confirmDelete}
                title="Descontinuar Pieza"
                message={`¿Estás seguro de descontinuar "${pieza?.nombreComercial}"?`}
                onConfirm={handleDelete}
                onCancel={() => setConfirmDelete(false)}
                confirmText="Sí, descontinuar"
            />
        </>
    );
};
