import {
    Users, Layers, Atom, Sparkles, FolderOpen,
    Gem, DollarSign, Package, Receipt, TrendingUp
} from 'lucide-react';
import './ModulesSection.css';

const modules = [
    {
        icon: <Users size={20} />,
        name: 'Proveedores',
        route: '/proveedores',
        desc: 'Contacto, redes y estado de cada proveedor.',
    },
    {
        icon: <Layers size={20} />,
        name: 'Materiales',
        route: '/materiales',
        desc: 'Pedrería, hilos, broches, cadenas y más, con costo unitario automático.',
    },
    {
        icon: <Atom size={20} />,
        name: 'Metales',
        route: '/metales',
        desc: 'Plata, oro, acero — precio por gramo y stock en tiempo real.',
    },
    {
        icon: <Sparkles size={20} />,
        name: 'Acabados',
        route: '/acabados',
        desc: 'Baños y tratamientos con tipo de cobro configurable.',
    },
    {
        icon: <FolderOpen size={20} />,
        name: 'Colecciones',
        route: '/colecciones',
        desc: 'Agrupa piezas por colección con claves propias.',
    },
    {
        icon: <Gem size={20} />,
        name: 'Piezas',
        route: '/piezas',
        desc: 'Catálogo completo con SKU, imagen y estado de cada diseño.',
    },
    {
        icon: <DollarSign size={20} />,
        name: 'Costeo',
        route: '/costeo',
        desc: 'Desglose total: materiales + metales + MO + gastos.',
    },
    {
        icon: <Package size={20} />,
        name: 'Inventario',
        route: '/stock',
        desc: 'Alertas automáticas de stock bajo, crítico y agotado.',
    },
    {
        icon: <Receipt size={20} />,
        name: 'Gastos Operativos',
        route: '/gastos',
        desc: 'Renta, luz, nómina y otros costos indirectos.',
    },
    {
        icon: <TrendingUp size={20} />,
        name: 'Márgenes',
        route: '/margenes',
        desc: 'Configura precios Taller, Mayorista y Público al instante.',
    },
];

export const ModulesSection = () => (
    <section id="modulos" className="modules-section">
        <div className="modules-inner">
            <div className="modules-header">
                <p className="section-eyebrow">Sistema completo</p>
                <h2>10 módulos integrados</h2>
                <p className="section-subtitle">
                    Desde el primer proveedor hasta el precio de venta final, todo conectado en una sola plataforma.
                </p>
            </div>
            
            <div className="modules-grid">
                {modules.map((m) => (
                    <div className="module-item" key={m.name}>
                        <div className="module-icon">{m.icon}</div>
                        <div className="module-text">
                            <span className="module-name">{m.name}</span>
                            <span className="module-desc">{m.desc}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </section>
);