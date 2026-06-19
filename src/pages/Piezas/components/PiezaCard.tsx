import React from 'react';
import { Pencil, Image as ImageIcon, Gem } from 'lucide-react';
import type { PiezaSummary } from '../types';
import './PiezaCard.css';

interface PiezaCardProps {
    pieza: PiezaSummary;
    onSelect: (pieza: PiezaSummary) => void;
    onEdit: (id: string) => void;
}

export const PiezaCard: React.FC<PiezaCardProps> = ({ pieza, onSelect, onEdit }) => {
    const getStatusBadge = () => {
        if (pieza.estado === 'DESCONTINUADO') return <span className="card-badge discontinued">Descontinuado</span>;
        if (pieza.estado === 'BORRADOR') return <span className="card-badge draft">Borrador</span>;
        return null;
    };

    return (
        <div className="pieza-card">
            <div className="card-image-wrapper" onClick={() => onSelect(pieza)}>
                {pieza.imagenUrl ? (
                    <img src={pieza.imagenUrl} alt={pieza.nombreComercial} className="card-image" />
                ) : (
                    <div className="card-image-placeholder">
                        <Gem size={32} color="var(--color-border)" />
                    </div>
                )}
                {getStatusBadge()}
            </div>
            <div className="card-body" onClick={() => onSelect(pieza)}>
                <span className="card-clave">{pieza.clave}</span>
                <h3 className="card-title">{pieza.nombreComercial}</h3>
                {pieza.tipo && <span className="card-tipo">{pieza.tipo.nombre}</span>}
            </div>
            <div className="card-actions" onClick={(e) => e.stopPropagation()}>
                <button className="card-edit-btn" onClick={() => onEdit(pieza.id)} title="Editar">
                    <Pencil size={14} />
                </button>
            </div>
        </div>
    );
};
