import { useEffect, useState } from 'react';
import { Sparkles, Package, CircleDollarSign, TrendingUp, Activity, ShieldAlert } from 'lucide-react';
import { obtenerResumenDashboard, type ResumenDashboard } from '../services/dashboard.service';
import './Dashboard.css';

const currency = (n: number) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 2 }).format(n);

export const Dashboard = () => {
    const [nombreUsuario, setNombreUsuario] = useState('');
    const [saludo, setSaludo] = useState('Bienvenido');
    const [data, setData] = useState<ResumenDashboard | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const usuarioGuardado = localStorage.getItem('kyro_usuario');
        if (usuarioGuardado) {
            const usuario = JSON.parse(usuarioGuardado);
            setNombreUsuario(usuario.nombre || 'Administrador');
        }

        const horaActual = new Date().getHours();
        if (horaActual < 12) setSaludo('Buenos días');
        else if (horaActual < 19) setSaludo('Buenas tardes');
        else setSaludo('Buenas noches');

        cargarResumen();
    }, []);

    const cargarResumen = async () => {
        setIsLoading(true);
        try {
            const res = await obtenerResumenDashboard();
            setData(res);
        } catch {
            console.error('Error al cargar resumen del dashboard');
        } finally {
            setIsLoading(false);
        }
    };

    const totalAlertas = data
        ? data.inventario.materialesAgotados + data.inventario.materialesBajoStock + data.inventario.metalesStockCritico
        : 0;

    return (
        <div className="module-container">
            <div className="module-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
                <div className="module-title" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
                    <h2 style={{ color: 'var(--color-text)', margin: 0, fontSize: '1.3rem', fontWeight: 700 }}>
                        {saludo}, {nombreUsuario}
                    </h2>
                    <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                        Panel principal del sistema Kyro
                    </p>
                </div>
            </div>

            {isLoading ? (
                <div className="dash-loading">Cargando resumen...</div>
            ) : data ? (
                <>
                    <div className="stats-grid">
                        <div className="stat-card active-card">
                            <span className="stat-title">
                                <Sparkles size={18} /> Piezas
                            </span>
                            <span className="stat-value">{data.piezas.activas}</span>
                            <span className="stat-desc">
                                {data.piezas.total} registradas en {data.piezas.porColeccion.length} colecciones
                            </span>
                        </div>

                        <div className="stat-card active-card">
                            <span className="stat-title">
                                <Package size={18} /> Materiales y Metales
                            </span>
                            <span className="stat-value">{data.inventario.totalMateriales + data.inventario.totalMetales}</span>
                            <span className="stat-desc">
                                {data.inventario.totalMateriales} materiales · {data.inventario.totalMetales} metales
                            </span>
                        </div>

                        <div className="stat-card active-card">
                            <span className="stat-title">
                                <TrendingUp size={18} /> Gastos Operativos
                            </span>
                            <span className="stat-value">{currency(data.finanzas.gastosAcumulados)}</span>
                            <span className="stat-desc">Acumulados</span>
                        </div>

                        <div className="stat-card active-card">
                            <span className="stat-title">
                                <CircleDollarSign size={18} /> Valor en Inventario
                            </span>
                            <span className="stat-value">{currency(data.inventario.valorTotalInventario)}</span>
                            <span className="stat-desc">
                                {totalAlertas > 0
                                    ? `${totalAlertas} producto(s) requieren atención`
                                    : 'Sin alertas de stock'}
                            </span>
                        </div>
                    </div>

                    <div className="dash-grid">
                        <div className="dash-card-module">
                            <div className="dash-card-header">
                                <Activity size={18} />
                                <span>Actividad reciente</span>
                            </div>
                            <div className="dash-card-content">
                                {data.actividadReciente.length === 0 ? (
                                    <p className="dash-empty">Aún no hay movimientos. Ve a <strong>Stock</strong> para registrar el primero.</p>
                                ) : (
                                    data.actividadReciente.map(m => (
                                        <div key={m.id} className="dash-row">
                                            <span className={`dash-badge dash-badge--${m.tipoMovimiento.toLowerCase()}`}>
                                                {m.tipoMovimiento === 'ENTRADA' ? 'ENT' : m.tipoMovimiento === 'SALIDA' ? 'SAL' : m.tipoMovimiento === 'MERMA' ? 'MER' : 'AJU'}
                                            </span>
                                            <span className="dash-row-main">{Number(m.cantidad).toFixed(2)} · {m.motivo || 'Sin motivo'}</span>
                                            <span className="dash-row-meta">{m.usuario?.nombre} · {new Date(m.fecha).toLocaleDateString('es-MX')}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="dash-card-module">
                            <div className="dash-card-header">
                                <Sparkles size={18} />
                                <span>Últimas piezas</span>
                            </div>
                            <div className="dash-card-content">
                                {data.piezas.ultimas.length === 0 ? (
                                    <p className="dash-empty">Aún no hay piezas. Ve a <strong>Piezas</strong> para crear la primera.</p>
                                ) : (
                                    data.piezas.ultimas.map(p => (
                                        <div key={p.id} className="dash-row">
                                            <span className="dash-code">{p.clave}</span>
                                            <span className="dash-row-main">{p.nombreComercial}</span>
                                            <span className="dash-row-meta">{p.tipo?.nombre} · {p.coleccion?.nombre}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {totalAlertas > 0 && (
                            <div className="dash-card-module dash-card-module--alert">
                                <div className="dash-card-header">
                                    <ShieldAlert size={18} />
                                    <span>Alertas de inventario</span>
                                </div>
                                <div className="dash-card-content">
                                    {data.inventario.materialesAgotados > 0 && (
                                        <div className="dash-alert-row">
                                            <span className="dash-alert-dot" style={{ color: 'var(--color-danger)' }}>●</span>
                                            <span>{data.inventario.materialesAgotados} material(es) agotados</span>
                                        </div>
                                    )}
                                    {data.inventario.materialesBajoStock > 0 && (
                                        <div className="dash-alert-row">
                                            <span className="dash-alert-dot" style={{ color: 'var(--color-warning)' }}>●</span>
                                            <span>{data.inventario.materialesBajoStock} material(es) por agotarse</span>
                                        </div>
                                    )}
                                    {data.inventario.metalesStockCritico > 0 && (
                                        <div className="dash-alert-row">
                                            <span className="dash-alert-dot" style={{ color: 'var(--color-danger)' }}>●</span>
                                            <span>{data.inventario.metalesStockCritico} metal(es) con stock crítico</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center', padding: '40px 0' }}>
                    No se pudieron cargar los datos. Verifica la conexión con el servidor.
                </p>
            )}
        </div>
    );
};
