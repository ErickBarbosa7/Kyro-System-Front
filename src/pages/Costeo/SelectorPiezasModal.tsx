import { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Loader } from 'lucide-react';
import { Modal } from '../../components/ui/Modal/Modal';
import { obtenerPiezas } from '../../services/piezas.service';
import './SelectorPiezasModal.css';

interface PiezaOption {
    id: string;
    clave: string;
    nombreComercial: string;
    imagenUrl?: string;
    tipo?: { nombre: string };
    coleccion?: { nombre: string };
}

interface SelectorPiezasModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (piezaId: string) => void;
}

const stringToColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return `hsl(${Math.abs(hash % 360)}, 55%, 45%)`;
};

const getInitial = (nombre: string) => nombre.trim().charAt(0).toUpperCase() || '?';

export const SelectorPiezasModal = ({ isOpen, onClose, onSelect }: SelectorPiezasModalProps) => {
    const [piezas, setPiezas] = useState<PiezaOption[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [hasLoaded, setHasLoaded] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen && !hasLoaded) {
            cargarPiezas();
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
        if (!isOpen) {
            setSearchTerm('');
        }
    }, [isOpen]);

    const cargarPiezas = async () => {
        setIsLoading(true);
        try {
            const data = await obtenerPiezas('activos');
            setPiezas(data);
            setHasLoaded(true);
        } catch {
            setPiezas([]);
        } finally {
            setIsLoading(false);
        }
    };

    const filtered = useMemo(() => {
        const term = searchTerm.toLowerCase().trim();
        if (!term) return piezas;
        return piezas.filter(p =>
            p.clave.toLowerCase().includes(term) ||
            p.nombreComercial.toLowerCase().includes(term) ||
            (p.tipo?.nombre || '').toLowerCase().includes(term) ||
            (p.coleccion?.nombre || '').toLowerCase().includes(term)
        );
    }, [searchTerm, piezas]);

    const handleSelect = (id: string) => {
        onSelect(id);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Seleccionar Pieza" maxWidth="560px">
            <div className="selector-modal-search">
                <div className="search-bar-container">
                    <Search size={20} className="search-icon" />
                    <input
                        ref={inputRef}
                        type="text"
                        className="search-input"
                        placeholder="Buscar pieza por nombre, clave, tipo o colección..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button className="clear-btn" onClick={() => setSearchTerm('')}>
                            <span style={{ fontSize: 16 }}>✕</span>
                        </button>
                    )}
                </div>
            </div>

            {isLoading ? (
                <div className="selector-modal-loading">
                    <Loader size={20} className="spin" />
                    Cargando piezas...
                </div>
            ) : filtered.length === 0 ? (
                <div className="selector-modal-empty">
                    {searchTerm ? 'No se encontraron piezas con ese criterio' : 'No hay piezas activas disponibles'}
                </div>
            ) : (
                <>
                    <div className="selector-modal-list">
                        {filtered.map(p => (
                            <button
                                key={p.id}
                                className="selector-modal-item"
                                onClick={() => handleSelect(p.id)}
                            >
                                <div
                                    className="selector-modal-avatar"
                                    style={{ backgroundColor: stringToColor(p.nombreComercial) }}
                                >
                                    {p.imagenUrl ? (
                                        <img src={p.imagenUrl} alt={p.nombreComercial} />
                                    ) : (
                                        getInitial(p.nombreComercial)
                                    )}
                                </div>
                                <div className="selector-modal-info">
                                    <div className="selector-modal-nombre">{p.nombreComercial}</div>
                                    <div className="selector-modal-meta">
                                        {p.clave}
                                        {p.coleccion?.nombre && ` · ${p.coleccion.nombre}`}
                                        {p.tipo?.nombre && ` · ${p.tipo.nombre}`}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                    <div className="selector-modal-counter">
                        Mostrando {filtered.length} de {piezas.length} pieza{piezas.length !== 1 ? 's' : ''}
                    </div>
                </>
            )}
        </Modal>
    );
};
