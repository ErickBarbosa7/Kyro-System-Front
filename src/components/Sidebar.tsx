import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Store, Box, Gem, Sparkles,
  Palette, Crown, Calculator, PackageSearch,
  Receipt, Percent, PanelLeftClose, PanelLeftOpen,
} from 'lucide-react';
import './Sidebar.css';
import { SidebarProfile } from './Configuracion/SidebarProfile/SidebarProfile';

const sections = [
  {
    label: 'General',
    links: [
      { to: '/dashboard',  Icon: LayoutDashboard, label: 'Panel principal' },
    ],
  },
  {
    label: 'Catálogos',
    links: [
      { to: '/proveedores', Icon: Store,    label: 'Proveedores' },
      { to: '/materiales',  Icon: Box,      label: 'Materiales' },
      { to: '/metales',     Icon: Gem,      label: 'Metales' },
      { to: '/acabados',    Icon: Sparkles, label: 'Acabados' },
    ],
  },
  {
    label: 'Producción',
    links: [
      { to: '/colecciones', Icon: Palette,    label: 'Colecciones' },
      { to: '/piezas',      Icon: Crown,      label: 'Piezas' },
      { to: '/costeo',      Icon: Calculator, label: 'Costeo' },
    ],
  },
  {
    label: 'Inventario',
    links: [
      { to: '/stock', Icon: PackageSearch, label: 'Stock y movimientos' },
    ],
  },
  {
    label: 'Finanzas',
    links: [
      { to: '/gastos',   Icon: Receipt, label: 'Gastos operativos' },
      { to: '/margenes', Icon: Percent, label: 'Márgenes y precios' },
    ],
  },
];

export const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [usuario, setUsuario] = useState<any>(null);

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('kyro_usuario');
    if (usuarioGuardado) {
      setUsuario(JSON.parse(usuarioGuardado));
    }
  }, []);

  return (
    <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>

      {/* ── Header ── */}
      <div className="sidebar-logo">
        <div className="logo-left">
          <span className="logo-text">Kyro System</span>
        </div>
        <button
          className="menu-button"
          onClick={() => setIsOpen((v) => !v)}
          aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
          title={isOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          {isOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
        </button>
      </div>

      {/* ── Navegación ── */}
      <nav className="sidebar-nav">
        {sections.map((section) => (
          <div key={section.label}>
            <span className="sidebar-category">{section.label}</span>
            {section.links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `nav-link${isActive ? ' nav-link--active' : ''}`
                }
              >
                <span className="nav-icon">
                  <link.Icon size={18} />
                </span>
                <span className="nav-label">{link.label}</span>
                <span className="nav-tooltip">{link.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {usuario && (
        <SidebarProfile
          usuario={usuario}
          sidebarOpen={isOpen} // ← pasamos el estado
        />
      )}
    </aside>
  );
};