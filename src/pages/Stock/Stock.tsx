import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Warehouse } from 'lucide-react';
import { SearchBar } from '../../components/ui/SearchBar/SearchBar';
import { Modal } from '../../components/ui/Modal/Modal';
import { ActionDropdown } from '../../components/ui/ActionDropdown/ActionDropdown';
import { FilterGroup } from '../../components/ui/FilterGroup/FilterGroup';
import { DataTable, type ColumnConfig } from '../../components/ui/DataTable/DataTable';
import { Loading } from '../../components/Loading/Loading';
import { FieldError } from '../../components/ui/FieldError/FieldError';
import { obtenerMovimientos, crearMovimiento, type CrearMovimientoData } from '../../services/stock.service';
import { obtenerMateriales } from '../../services/materiales.service';
import { obtenerMetales } from '../../services/metales.service';
import { obtenerAcabados } from '../../services/acabados.service';

import './Stock.css';

interface MovimientoStock {
    id: string;
    tipoProducto: string;
    productoId: string;
    nombreProducto: string;
    tipo: 'entrada' | 'salida' | 'ajuste' | 'merma';
    cantidad: number;
    motivo: string;
    fecha: string;
    usuario: string;
}

type TipoProducto = 'MATERIAL' | 'METAL' | 'ACABADO';
type TipoMov = 'ENTRADA' | 'SALIDA' | 'AJUSTE' | 'MERMA';

interface ProductoCatalogo {
    id: string;
    nombre: string;
}

export const Stock = () => {
    const [movimientos, setMovimientos] = useState<MovimientoStock[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filtros, setFiltros] = useState({
        tipo: '',
        fechaDesde: '',
        fechaHasta: '',
    });

    const [catalogoMateriales, setCatalogoMateriales] = useState<ProductoCatalogo[]>([]);
    const [catalogoMetales, setCatalogoMetales] = useState<ProductoCatalogo[]>([]);
    const [catalogoAcabados, setCatalogoAcabados] = useState<ProductoCatalogo[]>([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [movForm, setMovForm] = useState<CrearMovimientoData>({
        tipoProducto: 'MATERIAL',
        productoId: '',
        tipoMovimiento: 'ENTRADA',
        cantidad: 0,
        motivo: '',
    });

    const validate = (data: CrearMovimientoData): Record<string, string> => {
        const e: Record<string, string> = {};
        if (!data.productoId) e.productoId = 'Selecciona un producto';
        if (Number(data.cantidad) <= 0) e.cantidad = 'La cantidad debe ser mayor a cero';
        return e;
    };

    const labelStyle = { color: 'var(--color-text)', fontWeight: 700 };
    const inputStyle = { backgroundColor: 'var(--color-background)', color: 'var(--color-text)' };

    useEffect(() => {
        cargarMovimientos();
        cargarCatalogos();
    }, []);

    const cargarMovimientos = async () => {
        setIsLoading(true);
        try {
            const data: MovimientoData[] = await obtenerMovimientos();
            const mapeados: MovimientoStock[] = data.map(m => ({
                id: m.id,
                tipoProducto: m.tipoProducto,
                productoId: m.productoId,
                nombreProducto: '',
                tipo: m.tipoMovimiento.toLowerCase() as MovimientoStock['tipo'],
                cantidad: Number(m.cantidad),
                motivo: m.motivo || '',
                fecha: m.fecha,
                usuario: m.usuario ? `${m.usuario.nombre} ${m.usuario.apellido || ''}`.trim() : '',
            }));
            setMovimientos(mapeados);
        } catch (error) {
            toast.error('Error al cargar movimientos de stock');
        } finally {
            setIsLoading(false);
        }
    };

    const cargarCatalogos = async () => {
        try {
            const [mat, met, aca] = await Promise.all([
                obtenerMateriales('todos'),
                obtenerMetales(),
                obtenerAcabados('todos'),
            ]);
            setCatalogoMateriales(mat.map((m: any) => ({ id: m.id, nombre: m.nombre })));
            setCatalogoMetales(met.map((m: any) => ({ id: m.id, nombre: m.nombre })));
            setCatalogoAcabados(aca.map((a: any) => ({ id: a.id, nombre: a.nombre })));
        } catch {
            console.error('Error cargando catálogos');
        }
    };

    const getNombreProducto = (tipoProducto: string, productoId: string): string => {
        let catalogo: ProductoCatalogo[];
        switch (tipoProducto) {
            case 'MATERIAL': catalogo = catalogoMateriales; break;
            case 'METAL': catalogo = catalogoMetales; break;
            case 'ACABADO': catalogo = catalogoAcabados; break;
            default: return '';
        }
        return catalogo.find(p => p.id === productoId)?.nombre || '';
    };

    useEffect(() => {
        if (catalogoMateriales.length > 0 || catalogoMetales.length > 0 || catalogoAcabados.length > 0) {
            setMovimientos(prev => prev.map(m => ({
                ...m,
                nombreProducto: getNombreProducto(m.tipoProducto, m.productoId),
            })));
        }
    }, [catalogoMateriales, catalogoMetales, catalogoAcabados]);

    const movimientosFiltrados = movimientos.filter(mov => {
        const busqueda = searchTerm.toLowerCase();
        const matchSearch = mov.nombreProducto.toLowerCase().includes(busqueda) ||
                            mov.motivo.toLowerCase().includes(busqueda);
        const matchTipo = !filtros.tipo || mov.tipo === filtros.tipo;
        return matchSearch && matchTipo;
    });

    const productosDisponibles = useMemo(() => {
        switch (movForm.tipoProducto) {
            case 'MATERIAL': return catalogoMateriales;
            case 'METAL': return catalogoMetales;
            case 'ACABADO': return catalogoAcabados;
            default: return [];
        }
    }, [movForm.tipoProducto, catalogoMateriales, catalogoMetales, catalogoAcabados]);

    const handleCrearMovimiento = async (e: React.FormEvent) => {
        e.preventDefault();
        const validationErrors = validate(movForm);
        setErrors(validationErrors);
        setTouched({ productoId: true, cantidad: true });
        if (Object.keys(validationErrors).length > 0) return;

        const loadingToast = toast.loading('Registrando movimiento...');
        try {
            await crearMovimiento(movForm);
            toast.success('Movimiento registrado', { id: loadingToast });
            setErrors({});
            setTouched({});
            setIsModalOpen(false);
            setMovForm({ tipoProducto: 'MATERIAL', productoId: '', tipoMovimiento: 'ENTRADA', cantidad: 0, motivo: '' });
            cargarMovimientos();
            cargarCatalogos();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Error al registrar movimiento', { id: loadingToast });
        }
    };

    const columns: ColumnConfig<MovimientoStock>[] = useMemo(() => [
        {
            key: 'fecha',
            label: 'Fecha',
            width: '140px',
            sortable: true,
            render: (mov) => new Date(mov.fecha).toLocaleDateString('es-MX'),
        },
        {
            key: 'nombreProducto',
            label: 'Producto',
            width: '200px',
            sortable: true,
        },
        {
            key: 'tipo',
            label: 'Tipo',
            width: '110px',
            render: (mov) => (
                <span className={`mov-tipo mov-tipo--${mov.tipo}`}>
                    {mov.tipo === 'entrada' ? 'Entrada' : mov.tipo === 'salida' ? 'Salida' : mov.tipo === 'merma' ? 'Merma' : 'Ajuste'}
                </span>
            ),
        },
        {
            key: 'cantidad',
            label: 'Cantidad',
            width: '110px',
            sortable: true,
            render: (mov) => (
                <span className={`mov-cantidad mov-cantidad--${mov.tipo}`}>
                    {mov.tipo === 'entrada' ? '+' : mov.tipo === 'salida' ? '-' : ''}{mov.cantidad}
                </span>
            ),
        },
        {
            key: 'motivo',
            label: 'Motivo',
            width: '160px',
        },
        {
            key: 'usuario',
            label: 'Usuario',
            width: '160px',
        },
    ], []);

    return (
        <div className="module-container">
            <div className="module-header">
                <div className="module-title">
                    <Warehouse size={28} color="var(--color-primary)" />
                    <h2 style={{ color: 'var(--color-primary)' }}>Stock y Movimientos</h2>
                </div>
                <button className="btn-primary" onClick={() => { setErrors({}); setTouched({}); setIsModalOpen(true); }}>
                    <Plus size={20} /> Nuevo Movimiento
                </button>
            </div>

            <div className="module-description">
                <p>Controla las entradas, salidas y ajustes de inventario. Mantén un registro detallado de todos los movimientos de stock.</p>
            </div>

            <div className="toolbar-container">
                <div className="search-wrapper">
                    <SearchBar
                        placeholder="Buscar por material o referencia..."
                        value={searchTerm}
                        onChange={setSearchTerm}
                    />
                </div>
                <FilterGroup
                    values={filtros}
                    onChange={(name, value) => setFiltros(prev => ({ ...prev, [name]: value }))}
                    onClear={() => {
                        setFiltros({ tipo: '', fechaDesde: '', fechaHasta: '' });
                        setSearchTerm('');
                    }}
                    filters={[
                        {
                            name: 'tipo',
                            placeholder: 'Todos los movimientos',
                            options: [
                                { id: 'entrada', nombre: 'Entradas' },
                                { id: 'salida', nombre: 'Salidas' },
                                { id: 'ajuste', nombre: 'Ajustes' },
                                { id: 'merma', nombre: 'Mermas' },
                            ],
                        },
                    ]}
                />
            </div>

            <div className="table-container">
                {isLoading ? (
                    <Loading texto="Cargando movimientos..." />
                ) : (
                    <DataTable
                        data={movimientosFiltrados}
                        columns={columns}
                        className="stock-table"
                        emptyMessage={
                            searchTerm
                                ? `No se encontraron resultados para "${searchTerm}"`
                                : 'No hay movimientos de stock registrados.'
                        }
                        defaultSort={{ key: 'fecha', direction: 'desc' }}
                        itemsPerPageOptions={[10, 25, 50]}
                    />
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => { setErrors({}); setTouched({}); setIsModalOpen(false); }}
                title={<span style={{ color: 'var(--color-text)' }}>Nuevo Movimiento de Stock</span>}
                maxWidth="550px"
                zIndex={998}
            >
                <form onSubmit={handleCrearMovimiento} className="modal-form">
                    <div className="form-group">
                        <label style={labelStyle}>Tipo de Producto *</label>
                        <ActionDropdown
                            value={movForm.tipoProducto}
                            options={[
                                { id: 'MATERIAL', nombre: 'Material' },
                                { id: 'METAL', nombre: 'Metal' },
                                { id: 'ACABADO', nombre: 'Acabado' },
                            ]}
                            onChange={(val) => {
                                setMovForm(prev => ({ ...prev, tipoProducto: val as TipoProducto, productoId: '' }));
                                setErrors(prev => ({ ...prev, productoId: '' }));
                            }}
                            placeholder="Selecciona tipo"
                        />
                    </div>

                    <div className={`form-group ${errors.productoId && touched.productoId ? 'form-group--error' : ''}`}>
                        <label style={labelStyle}>Producto *</label>
                        <ActionDropdown
                            value={movForm.productoId}
                            options={productosDisponibles}
                            onChange={(val) => {
                                const next = { ...movForm, productoId: val };
                                setMovForm(next);
                                if (touched.productoId) {
                                    const newErrors = validate(next);
                                    setErrors(prev => ({ ...prev, productoId: newErrors.productoId }));
                                }
                            }}
                            placeholder="Selecciona un producto"
                        />
                        <FieldError message={touched.productoId ? errors.productoId : undefined} />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label style={labelStyle}>Tipo de Movimiento *</label>
                            <ActionDropdown
                                value={movForm.tipoMovimiento}
                                options={[
                                    { id: 'ENTRADA', nombre: 'Entrada' },
                                    { id: 'SALIDA', nombre: 'Salida' },
                                    { id: 'AJUSTE', nombre: 'Ajuste' },
                                    { id: 'MERMA', nombre: 'Merma' },
                                ]}
                                onChange={(val) => setMovForm(prev => ({ ...prev, tipoMovimiento: val as TipoMov }))}
                                placeholder="Selecciona movimiento"
                            />
                        </div>

                        <div className={`form-group ${errors.cantidad && touched.cantidad ? 'form-group--error' : ''}`}>
                            <label style={labelStyle}>Cantidad *</label>
                            <input
                                style={inputStyle}
                                type="number"
                                name="cantidad"
                                value={movForm.cantidad}
                                onChange={(e) => {
                                    const next = { ...movForm, cantidad: Number(e.target.value) };
                                    setMovForm(next);
                                    if (touched.cantidad) {
                                        const newErrors = validate(next);
                                        setErrors(prev => ({ ...prev, cantidad: newErrors.cantidad }));
                                    }
                                }}
                                onBlur={() => {
                                    setTouched(prev => ({ ...prev, cantidad: true }));
                                    const newErrors = validate(movForm);
                                    setErrors(prev => ({ ...prev, cantidad: newErrors.cantidad }));
                                }}
                                step="0.01"
                                min="0.01"
                                required
                            />
                            <FieldError message={touched.cantidad ? errors.cantidad : undefined} />
                        </div>
                    </div>

                    <div className="form-group">
                        <label style={labelStyle}>Motivo (Opcional)</label>
                        <textarea
                            style={inputStyle}
                            value={movForm.motivo}
                            onChange={(e) => setMovForm(prev => ({ ...prev, motivo: e.target.value }))}
                            placeholder="Razón del movimiento..."
                            rows={2}
                        />
                    </div>

                    <div className="modal-footer" style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                        <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                        <button type="submit" className="btn-primary">Registrar Movimiento</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
