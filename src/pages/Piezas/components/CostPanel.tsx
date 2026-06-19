import React from 'react';
import { DollarSign, TrendingUp, Calculator } from 'lucide-react';
import type { CosteoBreakdown } from '../types';
import './CostPanel.css';

interface CostPanelProps {
    costeo: CosteoBreakdown;
}

export const CostPanel: React.FC<CostPanelProps> = ({ costeo }) => {
    const items = [
        { label: 'Metales', value: costeo.totalMetales, color: '#f59e0b' },
        { label: 'Materiales', value: costeo.totalMateriales, color: '#10b981' },
        { label: 'Acabados', value: costeo.totalAcabados, color: '#8b5cf6' },
        { label: 'Mano de Obra', value: costeo.totalManoObra, color: '#3b82f6' },
    ];

    return (
        <div className="cost-panel">
            <div className="cost-panel-header">
                <Calculator size={18} />
                <span>Resumen de Costeo</span>
            </div>

            <div className="cost-panel-items">
                {items.map(item => (
                    <div key={item.label} className="cost-item">
                        <div className="cost-item-left">
                            <div className="cost-dot" style={{ background: item.color }} />
                            <span className="cost-item-label">{item.label}</span>
                        </div>
                        <div className="cost-items-count">
                            {item.label === 'Metales' && costeo.items.metales.length}
                            {item.label === 'Materiales' && costeo.items.materiales.length}
                            {item.label === 'Acabados' && costeo.items.acabados.length}
                            {item.label === 'Mano de Obra' && costeo.items.manoObra.length}
                            {item.label === 'Metales' && costeo.items.metales.length === 0 && '—'}
                            {item.label === 'Materiales' && costeo.items.materiales.length === 0 && '—'}
                            {item.label === 'Acabados' && costeo.items.acabados.length === 0 && '—'}
                            {item.label === 'Mano de Obra' && costeo.items.manoObra.length === 0 && '—'}
                        </div>
                        <span className="cost-item-value">${item.value.toFixed(2)}</span>
                    </div>
                ))}
            </div>

            <div className="cost-divider" />

            <div className="cost-total-row">
                <span>Costo Directo</span>
                <span className="cost-total-value">${costeo.costeDirecto.toFixed(2)}</span>
            </div>

            {costeo.margen && (
                <>
                    <div className="cost-panel-margins">
                        <div className="cost-panel-margins-header">
                            <TrendingUp size={14} />
                            <span>Precios Finales</span>
                        </div>
                        <div className="cost-margin-row">
                            <span>Taller ({Math.round(costeo.margen.margenTaller)}%)</span>
                            <span className="cost-margin-value">${costeo.margen.precioTaller.toFixed(2)}</span>
                        </div>
                        <div className="cost-margin-row">
                            <span>Mayorista ({Math.round(costeo.margen.margenMayorista)}%)</span>
                            <span className="cost-margin-value">${costeo.margen.precioMayorista.toFixed(2)}</span>
                        </div>
                        <div className="cost-margin-row final">
                            <span>Público ({Math.round(costeo.margen.margenPublico)}%)</span>
                            <span className="cost-margin-value publico">${costeo.margen.precioPublico.toFixed(2)}</span>
                        </div>
                    </div>
                    <div className="cost-margin-name">{costeo.margen.nombre}</div>
                </>
            )}

            {!costeo.margen && (
                <div className="cost-no-margin">
                    <DollarSign size={14} />
                    <span>Sin configuración de márgenes</span>
                </div>
            )}
        </div>
    );
};
