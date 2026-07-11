import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Warehouse, Plus } from 'lucide-react';
import { obtenerResumenInventario, type ItemInventario } from '../../services/inventario.service';
import { obtenerMovimientos, type MovimientoData } from '../../services/stock.service';
import { obtenerMateriales } from '../../services/materiales.service';
import { obtenerMetales } from '../../services/metales.service';
import { obtenerAcabados } from '../../services/acabados.service';
import { cacheGet, cacheSet, CACHE_KEYS } from '../../utils/cache';
import { TabStockActual } from './TabStockActual';
import { TabHistorialMovimientos } from './TabHistorialMovimientos';
import { RegistrarMovimientoSlideOver } from './RegistrarMovimientoSlideOver';
import './Inventario.css';

type TabId = 'stock' | 'historial';

interface ProductoCatalogo {
    id: string;
    nombre: string;
}

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

export const Inventario = () => {
    const [activeTab, setActiveTab] = useState<TabId>('stock');

    // Stock actual state
    const [items, setItems] = useState<ItemInventario[]>([]);
    const [isLoadingStock, setIsLoadingStock] = useState(true);

    // Historial state
    const [movimientos, setMovimientos] = useState<MovimientoStock[]>([]);
    const [isLoadingMovimientos, setIsLoadingMovimientos] = useState(true);

    // Catalogs for the movement form
    const [catalogoMateriales, setCatalogoMateriales] = useState<ProductoCatalogo[]>([]);
    const [catalogoMetales, setCatalogoMetales] = useState<ProductoCatalogo[]>([]);
    const [catalogoAcabados, setCatalogoAcabados] = useState<ProductoCatalogo[]>([]);

    // Slide-over state
    const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);

    // Stock tab filters
    const [stockSearch, setStockSearch] = useState('');
    const [stockFiltros, setStockFiltros] = useState({ tipo: '', estado: '' });

    // Historial tab filters
    const [historialSearch, setHistorialSearch] = useState('');
    const [historialFiltros, setHistorialFiltros] = useState({ tipo: '' });

    useEffect(() => {
        cargarStock();
        cargarHistorial();
        cargarCatalogos();
    }, []);

    const cargarStock = async () => {
        setIsLoadingStock(true);
        try {
            const data = await obtenerResumenInventario();
            setItems(data);
        } catch {
            toast.error('Error al cargar el inventario');
        } finally {
            setIsLoadingStock(false);
        }
    };

    const cargarHistorial = async () => {
        setIsLoadingMovimientos(true);
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
        } catch {
            toast.error('Error al cargar movimientos de stock');
        } finally {
            setIsLoadingMovimientos(false);
        }
    };

    const cargarCatalogos = async () => {
        const cachedMat = cacheGet<ProductoCatalogo[]>(CACHE_KEYS.CATALOGO_MATERIALES);
        const cachedMet = cacheGet<ProductoCatalogo[]>(CACHE_KEYS.CATALOGO_METALES);
        const cachedAca = cacheGet<ProductoCatalogo[]>(CACHE_KEYS.CATALOGO_ACABADOS);

        if (cachedMat && cachedMet && cachedAca) {
            setCatalogoMateriales(cachedMat);
            setCatalogoMetales(cachedMet);
            setCatalogoAcabados(cachedAca);
            return;
        }

        try {
            const [mat, met, aca] = await Promise.all([
                obtenerMateriales('todos'),
                obtenerMetales(),
                obtenerAcabados('todos'),
            ]);
            const mapeoMat = mat.map((m: any) => ({ id: m.id, nombre: m.nombre }));
            const mapeoMet = met.map((m: any) => ({ id: m.id, nombre: m.nombre }));
            const mapeoAca = aca.map((a: any) => ({ id: a.id, nombre: a.nombre }));
            cacheSet(CACHE_KEYS.CATALOGO_MATERIALES, mapeoMat);
            cacheSet(CACHE_KEYS.CATALOGO_METALES, mapeoMet);
            cacheSet(CACHE_KEYS.CATALOGO_ACABADOS, mapeoAca);
            setCatalogoMateriales(mapeoMat);
            setCatalogoMetales(mapeoMet);
            setCatalogoAcabados(mapeoAca);
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

    const handleMovimientoCreado = async () => {
        await Promise.all([cargarStock(), cargarHistorial()]);
    };

    const tabs: { id: TabId; label: string }[] = [
        { id: 'stock', label: 'Stock Actual' },
        { id: 'historial', label: 'Historial de Movimientos' },
    ];

    return (
        <div className="module-container">
            <div className="module-header">
                <div className="module-title">
                    <Warehouse size={28} color="var(--color-primary)" />
                    <h2 style={{ color: 'var(--color-primary)' }}>Inventario</h2>
                </div>
                <button className="btn-primary" onClick={() => setIsSlideOverOpen(true)}>
                    <Plus size={20} /> Registrar Movimiento
                </button>
            </div>

            <div className="module-description">
                <p>Monitorea tus existencias y registra movimientos de entrada, salida o ajuste.</p>
            </div>

            <div className="inventario-tabs">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`inventario-tab ${activeTab === tab.id ? 'inventario-tab--active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === 'stock' ? (
                <TabStockActual
                    items={items}
                    isLoading={isLoadingStock}
                    searchTerm={stockSearch}
                    onSearchChange={setStockSearch}
                    filtros={stockFiltros}
                    onFilterChange={(name, value) => setStockFiltros(prev => ({ ...prev, [name]: value }))}
                    onFilterClear={() => { setStockFiltros({ tipo: '', estado: '' }); setStockSearch(''); }}
                />
            ) : (
                <TabHistorialMovimientos
                    movimientos={movimientos}
                    isLoading={isLoadingMovimientos}
                    searchTerm={historialSearch}
                    onSearchChange={setHistorialSearch}
                    filtros={historialFiltros}
                    onFilterChange={(name, value) => setHistorialFiltros(prev => ({ ...prev, [name]: value }))}
                    onFilterClear={() => { setHistorialFiltros({ tipo: '' }); setHistorialSearch(''); }}
                />
            )}

            <RegistrarMovimientoSlideOver
                isOpen={isSlideOverOpen}
                onClose={() => setIsSlideOverOpen(false)}
                onSuccess={handleMovimientoCreado}
                catalogoMateriales={catalogoMateriales}
                catalogoMetales={catalogoMetales}
                catalogoAcabados={catalogoAcabados}
            />
        </div>
    );
};
