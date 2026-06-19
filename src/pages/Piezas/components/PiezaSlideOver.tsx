import React, { useEffect, useState } from 'react';
import { X, Edit3, Gem, Clock, Weight, Image as ImageIcon, Package, Layers, DollarSign } from 'lucide-react';
import { Loading } from '../../../components/Loading/Loading';
import { obtenerPiezaPorId } from '../../../services/piezas.service';
import { calcularTotales } from '../../../services/costeo.service';
import type { PiezaFullData, CosteoBreakdown } from '../types';
import './PiezaSlideOver.css';

interface PiezaSlideOverProps {
    isOpen: boolean;
    piezaId: string | null;
    onClose: () => void;
    onEdit: (id: string) => void;
}

export const PiezaSlideOver: React.FC<PiezaSlideOverProps> = ({ isOpen, piezaId, onClose, onEdit }) => {
    const [pieza, setPieza] = useState<PiezaFullData | null>(null);
    const [costeo, setCosteo] = useState<CosteoBreakdown | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!isOpen || !piezaId) return;
        setIsLoading(true);
        Promise.all([
            obtenerPiezaPorId(piezaId),
            calcularTotales(piezaId).catch(() => null),
        ])
            .then(([piezaData, costeoData]) => {
                setPieza(piezaData);
                if (costeoData) {
                    setCosteo({
                        totalMetales: costeoData.desglose.metales.total,
                        totalMateriales: costeoData.desglose.materiales.total,
                        totalAcabados: costeoData.desglose.acabados.total,
                        totalManoObra: costeoData.desglose.manoObra.total,
                        costeDirecto: costeoData.costeDirecto,
                        costeTotal: costeoData.costeTotal,
                        margen: costeoData.margenes,
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

    if (!isOpen) return null;

    return (
        <>
            <div className="slide-over-backdrop" onClick={onClose} />
            <div className="slide-over">
                <div className="slide-over-header">
                    <h2>{pieza?.nombreComercial || 'Cargando...'}</h2>
                    <div className="slide-over-header-actions">
                        {piezaId && (
                            <button className="btn-primary" onClick={() => { onEdit(piezaId); onClose(); }}>
                                <Edit3 size={16} /> Editar
                            </button>
                        )}
                        <button className="btn-icon" onClick={onClose}>
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="slide-over-body">
                    {isLoading ? (
                        <Loading texto="Cargando detalles..." />
                    ) : pieza ? (
                        <>
                            <div className="slide-over-image-section">
                                {pieza.imagenUrl ? (
                                    <img src={pieza.imagenUrl} alt={pieza.nombreComercial} className="slide-over-image" />
                                ) : (
                                    <div className="slide-over-image-placeholder">
                                        <ImageIcon size={48} color="var(--color-border)" />
                                    </div>
                                )}
                            </div>

                            <div className="slide-over-info-grid">
                                <div className="slide-over-info-item">
                                    <Gem size={14} />
                                    <span className="info-label">Clave</span>
                                    <span className="info-value">{pieza.clave}</span>
                                </div>
                                <div className="slide-over-info-item">
                                    <Package size={14} />
                                    <span className="info-label">Tipo</span>
                                    <span className="info-value">{pieza.tipo?.nombre || '—'}</span>
                                </div>
                                <div className="slide-over-info-item">
                                    <Layers size={14} />
                                    <span className="info-label">Colección</span>
                                    <span className="info-value">{pieza.coleccion?.nombre || '—'}</span>
                                </div>
                                <div className="slide-over-info-item">
                                    <Weight size={14} />
                                    <span className="info-label">Peso</span>
                                    <span className="info-value">{pieza.pesoTotal ? `${pieza.pesoTotal} gr` : '—'}</span>
                                </div>
                                <div className="slide-over-info-item">
                                    <Clock size={14} />
                                    <span className="info-label">Tiempo Fab.</span>
                                    <span className="info-value">{pieza.tiempoFabricacionHrs ? `${pieza.tiempoFabricacionHrs} hrs` : '—'}</span>
                                </div>
                                <div className="slide-over-info-item">
                                    <DollarSign size={14} />
                                    <span className="info-label">Estado</span>
                                    <span className="info-value">{pieza.estado}</span>
                                </div>
                            </div>

                            {pieza.descripcion && (
                                <div className="slide-over-section">
                                    <h4>Descripción</h4>
                                    <p>{pieza.descripcion}</p>
                                </div>
                            )}

                            <div className="slide-over-section">
                                <h4>Receta de Materiales</h4>
                                {pieza.costeoMetales?.length > 0 && (
                                    <div className="slide-over-recipe-list">
                                        <h5>Metales</h5>
                                        {pieza.costeoMetales.map((m: any) => (
                                            <div key={m.id} className="slide-over-recipe-item">
                                                <span>{m.metal?.nombre}</span>
                                                <span>{Number(m.pesoUtilizadoGr).toFixed(2)} gr</span>
                                                <span>${Number(m.subtotal).toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {pieza.costeoMateriales?.length > 0 && (
                                    <div className="slide-over-recipe-list">
                                        <h5>Materiales</h5>
                                        {pieza.costeoMateriales.map((m: any) => (
                                            <div key={m.id} className="slide-over-recipe-item">
                                                <span>{m.material?.nombre}</span>
                                                <span>{Number(m.cantidadUtilizada)} pz</span>
                                                <span>${Number(m.subtotal).toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {pieza.costeoAcabados?.length > 0 && (
                                    <div className="slide-over-recipe-list">
                                        <h5>Acabados</h5>
                                        {pieza.costeoAcabados.map((a: any) => (
                                            <div key={a.id} className="slide-over-recipe-item">
                                                <span>{a.acabado?.nombre}</span>
                                                <span>{Number(a.cantidad)} pz</span>
                                                <span>${Number(a.subtotal).toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {pieza.costeoManoObra?.length > 0 && (
                                    <div className="slide-over-recipe-list">
                                        <h5>Mano de Obra</h5>
                                        {pieza.costeoManoObra.map((mo: any) => (
                                            <div key={mo.id} className="slide-over-recipe-item">
                                                <span>{mo.actividad}</span>
                                                <span>{Number(mo.tiempoHrs)} hrs</span>
                                                <span>${Number(mo.subtotal).toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {(!pieza.costeoMetales?.length && !pieza.costeoMateriales?.length && !pieza.costeoAcabados?.length && !pieza.costeoManoObra?.length) && (
                                    <p className="slide-over-empty">Sin receta registrada</p>
                                )}
                            </div>

                            {costeo && (
                                <div className="slide-over-section costeo-section">
                                    <h4>Costeo</h4>
                                    <div className="costeo-summary">
                                        <div className="costeo-row">
                                            <span>Costo Directo</span>
                                            <span className="costeo-value">${costeo.costeDirecto.toFixed(2)}</span>
                                        </div>
                                        {costeo.margen && (
                                            <>
                                                <div className="costeo-row">
                                                    <span>Precio Taller ({Math.round(costeo.margen.margenTaller)}%)</span>
                                                    <span className="costeo-value">${costeo.margen.precioTaller.toFixed(2)}</span>
                                                </div>
                                                <div className="costeo-row">
                                                    <span>Precio Mayorista ({Math.round(costeo.margen.margenMayorista)}%)</span>
                                                    <span className="costeo-value">${costeo.margen.precioMayorista.toFixed(2)}</span>
                                                </div>
                                                <div className="costeo-row final">
                                                    <span>Precio Público ({Math.round(costeo.margen.margenPublico)}%)</span>
                                                    <span className="costeo-value publico">${costeo.margen.precioPublico.toFixed(2)}</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <p className="slide-over-error">No se pudieron cargar los datos</p>
                    )}
                </div>
            </div>
        </>
    );
};
