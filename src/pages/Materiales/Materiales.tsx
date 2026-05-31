import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Box, Image as ImageIcon, AlertTriangle, X } from 'lucide-react';
import { SearchBar } from '../../components/ui/SearchBar';
import { FilterSelect } from '../../components/ui/FilterSelect';
import './Materiales.css';

export const Materiales = () => {
    // === ESTADOS MOCK (Solo visuales por ahora) ===
    const [searchTerm, setSearchTerm] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('activos');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // DATOS FALSOS BASADOS EN TU IMAGEN PARA VER EL DISEÑO
    const mockMateriales = [
        {
            id: '1',
            nombre: 'Unaquita',
            proveedor: 'JULIE STONE SA DE CV',
            imagenUrl: 'https://ejemplo.com/unaquita.jpg', // Simularemos la imagen con CSS si falla
            precioCompra: 45.00,
            unidadCompra: 'PIEZA',
            stockDisponible: 120,
            stockMinimo: 50,
            activo: true
        },
        {
            id: '2',
            nombre: 'Ágata Verde',
            proveedor: 'JULIE STONE SA DE CV',
            imagenUrl: '', // Sin imagen para ver el placeholder
            precioCompra: 35.00,
            unidadCompra: 'PIEZA CH',
            stockDisponible: 15, // Por debajo del mínimo para ver la alerta
            stockMinimo: 30,
            activo: true
        }
    ];

    return (
        <div className="module-container">
            {/* CABECERA */}
            <div className="module-header">
                <div className="module-title">
                    <Box size={28} color="var(--color-primary)" />
                    <h2>Catálogo de Materiales</h2>
                </div>
                
                <div className="header-actions">
                    <SearchBar 
                        placeholder="Buscar material..." 
                        value={searchTerm} 
                        onChange={setSearchTerm} 
                    />
                    <FilterSelect 
                        value={filtroEstado}
                        onChange={setFiltroEstado}
                        options={[
                            { value: 'activos', label: 'Ver Activos' },
                            { value: 'inactivos', label: 'Papelera' },
                            { value: 'todos', label: 'Ver Todos' }
                        ]}
                    />
                    <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                        <Plus size={20} />
                        Nuevo Material
                    </button>
                </div>
            </div>

            <div className="module-description">
                <p>Gestiona tu inventario de piedras, cadenas y fornituras. Controla precios y niveles de stock.</p>
            </div>

            {/* TABLA PRINCIPAL */}
<div className="table-container">
    <table 
        className="kyro-table materials-table"
        style={{ tableLayout: 'fixed', width: '100%' }}
    >
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
            {mockMateriales.map((mat) => (
                <tr key={mat.id}>
                    
                    {/* IMAGEN */}
                    <td className="text-center">
                        <div className="material-thumb">
                            {mat.imagenUrl ? (
                                <img
                                    src={mat.imagenUrl}
                                    alt={mat.nombre}
                                    className="material-image"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                    }}
                                />
                            ) : (
                                <ImageIcon size={24} color="#94a3b8" />
                            )}
                        </div>
                    </td>

                    {/* MATERIAL */}
                    <td>
                        <span className="truncate-text">
                            {mat.nombre}
                        </span>
                    </td>

                    {/* PROVEEDOR */}
                    <td>
                        <span
                            className="truncate-text text-muted"
                            title={mat.proveedor}
                        >
                            {mat.proveedor}
                        </span>
                    </td>

                    {/* PRECIO */}
                    <td className="font-price">
                        ${mat.precioCompra.toFixed(2)}
                    </td>

                    {/* UNIDAD */}
                    <td>
                        <span className="badge-unidad">
                            {mat.unidadCompra}
                        </span>
                    </td>

                    {/* STOCK */}
                    <td align="center">
                        <div
                            className={`stock-indicator ${
                                mat.stockDisponible <= mat.stockMinimo
                                    ? 'low-stock'
                                    : 'good-stock'
                            }`}
                        >
                            {mat.stockDisponible <= mat.stockMinimo && (
                                <AlertTriangle size={14} />
                            )}

                            <span>{mat.stockDisponible}</span>
                        </div>
                    </td>

                    {/* ACCIONES */}
                    <td>
                        <div className="table-actions">
                            <button className="btn-icon edit">
                                <Pencil size={18} />
                            </button>

                            <button className="btn-icon delete">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </td>
                </tr>
            ))}
        </tbody>
    </table>
</div>

            {/* MODAL (MAQUETA VISUAL) */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '700px' }}>
                        <div className="modal-header">
                            <h3>Nuevo Material</h3>
                            <button className="btn-close" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
                        </div>
                        
                        <div className="modal-form">
                            <div className="image-upload-container">
                                <div className="image-dropzone">
                                    <ImageIcon size={32} color="#94a3b8" />
                                    <p>Clic para subir foto del material</p>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group" style={{ flex: 2 }}>
                                    <label>Nombre del Material *</label>
                                    <input type="text" placeholder="Ej. Unaquita" />
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label>Categoría *</label>
                                    <select className="kyro-select">
                                        <option>Piedras</option>
                                        <option>Cadenas</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Proveedor *</label>
                                <select className="kyro-select">
                                    <option>JULIE STONE SA DE CV</option>
                                </select>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Unidad de Compra *</label>
                                    <input type="text" placeholder="Ej. PIEZA CH" />
                                </div>
                                <div className="form-group">
                                    <label>Precio de Compra ($) *</label>
                                    <input type="number" placeholder="0.00" />
                                </div>
                                <div className="form-group">
                                    <label>Cantidad Comprada *</label>
                                    <input type="number" placeholder="Ej. 100" />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Stock Mínimo (Alerta)</label>
                                    <input type="number" placeholder="Ej. 10" />
                                </div>
                                <div className="form-group">
                                    <label>Stock Máximo</label>
                                    <input type="number" placeholder="Opcional" />
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                                <button className="btn-primary">Guardar Material</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};