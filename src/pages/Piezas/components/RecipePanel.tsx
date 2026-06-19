import React, { useState, useMemo } from 'react';
import { Plus, X, UserCircle } from 'lucide-react';
import { SearchBar } from '../../../components/ui/SearchBar/SearchBar';
import type { PiezaDraft } from '../types';
import './RecipePanel.css';

interface CatalogItem {
    id: string;
    nombre: string;
    precio?: number;
    precioPorGramo?: number;
    costoUnitario?: number;
    costoBase?: number;
    [key: string]: any;
}

interface RecipePanelProps {
    draft: PiezaDraft;
    onChange: (draft: PiezaDraft) => void;
    metales: CatalogItem[];
    materiales: CatalogItem[];
    acabados: CatalogItem[];
}

type TabId = 'metales' | 'materiales' | 'acabados' | 'manoObra';

const idFieldMap: Record<TabId, string> = {
    metales: 'metalId',
    materiales: 'materialId',
    acabados: 'acabadoId',
    manoObra: '',
};

const qtyFieldMap: Record<TabId, string> = {
    metales: 'pesoUtilizadoGr',
    materiales: 'cantidadUtilizada',
    acabados: 'cantidad',
    manoObra: '',
};

const snapshotFieldMap: Record<TabId, string> = {
    metales: 'precioGramoSnapshot',
    materiales: 'costoUnitarioSnapshot',
    acabados: 'costoUnitarioSnapshot',
    manoObra: '',
};

const unitMap: Record<TabId, string> = {
    metales: 'gr',
    materiales: 'pz',
    acabados: 'pz',
    manoObra: 'hrs',
};

const stepMap: Record<TabId, string> = {
    metales: '0.1',
    materiales: '1',
    acabados: '1',
    manoObra: '0.5',
};

const getPrice = (item: CatalogItem, tab: TabId): number => {
    switch (tab) {
        case 'metales': return Number(item.precioPorGramo || 0);
        case 'materiales': return Number(item.costoUnitario || 0);
        case 'acabados': return Number(item.costoBase || 0);
        default: return 0;
    }
};

const defaultQty = (tab: TabId): number => tab === 'metales' ? 1 : 1;

export const RecipePanel: React.FC<RecipePanelProps> = ({ draft, onChange, metales, materiales, acabados }) => {
    const [activeTab, setActiveTab] = useState<TabId>('metales');
    const [searchTerm, setSearchTerm] = useState('');

    const [moActividad, setMoActividad] = useState('');
    const [moTiempo, setMoTiempo] = useState(1);
    const [moCostoHr, setMoCostoHr] = useState(0);

    const tabs: { id: TabId; label: string; count: number }[] = [
        { id: 'metales', label: 'Metales', count: draft.metales.length },
        { id: 'materiales', label: 'Materiales', count: draft.materiales.length },
        { id: 'acabados', label: 'Acabados', count: draft.acabados.length },
        { id: 'manoObra', label: 'Mano de Obra', count: draft.manoObra.length },
    ];

    const catalogMap: Record<TabId, CatalogItem[]> = {
        metales,
        materiales,
        acabados,
        manoObra: [],
    };

    const filteredCatalog = useMemo(() => {
        const items = catalogMap[activeTab];
        if (!searchTerm.trim()) return items;
        const term = searchTerm.toLowerCase();
        return items.filter(item => item.nombre.toLowerCase().includes(term));
    }, [activeTab, searchTerm, metales, materiales, acabados]);

    const findInDraft = (id: string, tab: TabId): number => {
        const arr = draft[tab] as any[];
        const idField = idFieldMap[tab];
        return arr.findIndex((item: any) => item[idField] === id);
    };

    const addItem = (item: CatalogItem) => {
        if (activeTab === 'manoObra') return;
        const idField = idFieldMap[activeTab];
        const qtyField = qtyFieldMap[activeTab];

        const existingIdx = findInDraft(item.id, activeTab);
        if (existingIdx >= 0) {
            const arr = [...(draft[activeTab] as any[])];
            const existing = { ...arr[existingIdx] };
            existing[qtyField] = Number(existing[qtyField]) + defaultQty(activeTab);
            existing.subtotal = existing[qtyField] * getPrice(item, activeTab);
            arr[existingIdx] = existing;
            onChange({ ...draft, [activeTab]: arr });
            return;
        }

        const price = getPrice(item, activeTab);
        const qty = defaultQty(activeTab);
        const snapshotField = snapshotFieldMap[activeTab];

        const newItem: any = {
            [idField]: item.id,
            nombre: item.nombre,
            [qtyField]: qty,
            [snapshotField]: price,
            subtotal: qty * price,
        };

        onChange({ ...draft, [activeTab]: [...(draft[activeTab] as any[]), newItem] });
    };

    const updateQuantity = (index: number, quantity: number) => {
        const arr = [...(draft[activeTab] as any[])];
        const qtyField = qtyFieldMap[activeTab];
        const item = { ...arr[index] };
        item[qtyField] = quantity > 0 ? quantity : 0;
        const snapshotField = snapshotFieldMap[activeTab];
        item.subtotal = quantity * Number(item[snapshotField] || 0);
        arr[index] = item;
        onChange({ ...draft, [activeTab]: arr });
    };

    const removeItem = (index: number) => {
        const arr = (draft[activeTab] as any[]).filter((_, i) => i !== index);
        onChange({ ...draft, [activeTab]: arr });
    };

    const agregarManoObra = () => {
        if (!moActividad.trim()) return;
        const subtotal = moTiempo * moCostoHr;
        onChange({
            ...draft,
            manoObra: [...draft.manoObra, { actividad: moActividad.trim(), tiempoHrs: moTiempo, costoPorHora: moCostoHr, subtotal }],
        });
        setMoActividad('');
        setMoTiempo(1);
        setMoCostoHr(0);
    };

    const renderDraftItems = () => {
        const items = draft[activeTab] as any[];
        if (items.length === 0) {
            return <div className="recipe-empty">Agrega insumos desde el catálogo de arriba</div>;
        }
        const qtyField = qtyFieldMap[activeTab];
        const unit = unitMap[activeTab];
        const step = stepMap[activeTab];
        return (
            <div className="recipe-items-list">
                {items.map((item, index) => (
                    <div key={index} className="recipe-item">
                        <span className="recipe-item-name">{item.nombre}</span>
                        <div className="recipe-item-controls">
                            <input
                                type="number"
                                className="recipe-item-qty"
                                value={item[qtyField]}
                                min="0"
                                step={step}
                                onChange={(e) => updateQuantity(index, Number(e.target.value))}
                            />
                            <span className="recipe-item-unit">{unit}</span>
                            <span className="recipe-item-subtotal">${item.subtotal?.toFixed(2)}</span>
                            <button className="recipe-item-remove" onClick={() => removeItem(index)}>
                                <X size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="recipe-panel">
            <div className="recipe-tabs">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`recipe-tab ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => { setActiveTab(tab.id); setSearchTerm(''); }}
                    >
                        {tab.label}
                        {tab.count > 0 && <span className="recipe-tab-badge">{tab.count}</span>}
                    </button>
                ))}
            </div>

            {activeTab !== 'manoObra' && (
                <div className="recipe-search-section">
                    <SearchBar
                        placeholder={`Buscar ${tabs.find(t => t.id === activeTab)?.label.toLowerCase()}...`}
                        value={searchTerm}
                        onChange={setSearchTerm}
                    />
                    <div className="recipe-catalog">
                        {filteredCatalog.length === 0 ? (
                            <div className="recipe-empty">Sin resultados</div>
                        ) : (
                            filteredCatalog.slice(0, 8).map(item => {
                                const inDraft = findInDraft(item.id, activeTab) >= 0;
                                return (
                                    <div
                                        key={item.id}
                                        className={`recipe-catalog-item`}
                                        onClick={() => addItem(item)}
                                    >
                                        <span className="recipe-catalog-name">{item.nombre}</span>
                                        <span className="recipe-catalog-price">${getPrice(item, activeTab).toFixed(2)}</span>
                                        <button className={`recipe-catalog-add ${inDraft ? 'in-draft' : ''}`}>
                                            {inDraft ? (
                                                <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>+1</span>
                                            ) : (
                                                <Plus size={14} />
                                            )}
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'manoObra' && (
                <div className="mo-form">
                    <div className="mo-form-row">
                        <div className="mo-field mo-field--wide">
                            <label>Actividad</label>
                            <input
                                value={moActividad}
                                onChange={(e) => setMoActividad(e.target.value)}
                                placeholder="Ej. Fundición, Engarce, Pulido..."
                            />
                        </div>
                        <div className="mo-field">
                            <label>Horas</label>
                            <input
                                type="number"
                                min="0"
                                step="0.5"
                                value={moTiempo}
                                onChange={(e) => setMoTiempo(Number(e.target.value))}
                            />
                        </div>
                        <div className="mo-field">
                            <label>$ / Hora</label>
                            <input
                                type="number"
                                min="0"
                                step="10"
                                value={moCostoHr}
                                onChange={(e) => setMoCostoHr(Number(e.target.value))}
                            />
                        </div>
                        <button className="mo-add-btn" onClick={agregarManoObra} disabled={!moActividad.trim()}>
                            <Plus size={16} /> Agregar
                        </button>
                    </div>
                    {draft.manoObra.length > 0 && (
                        <div className="mo-divider" />
                    )}
                </div>
            )}

            <div className="recipe-divider" />

            {activeTab === 'manoObra' ? (
                draft.manoObra.length === 0 ? (
                    <div className="recipe-empty">Completa el formulario de arriba y da clic en "Agregar"</div>
                ) : (
                    <div className="recipe-items-list">
                        {draft.manoObra.map((mo, idx) => (
                            <div key={idx} className="recipe-item mo-item-row">
                                <div className="mo-item-info">
                                    <UserCircle size={16} color="var(--color-text-secondary)" />
                                    <span className="recipe-item-name">{mo.actividad}</span>
                                </div>
                                <div className="recipe-item-controls">
                                    <span className="recipe-item-unit-label">{Number(mo.tiempoHrs).toFixed(1)} hrs</span>
                                    <span className="recipe-item-unit-label" style={{ color: 'var(--color-text-secondary)' }}>
                                        x ${Number(mo.costoPorHora).toFixed(2)}/hr
                                    </span>
                                    <span className="recipe-item-subtotal">${mo.subtotal?.toFixed(2)}</span>
                                    <button className="recipe-item-remove" onClick={() => removeItem(idx)}>
                                        <X size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            ) : (
                renderDraftItems()
            )}
        </div>
    );
};
