import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Store, Box, Gem, Sparkles, 
  Palette, Crown, Calculator, PackageSearch, 
  Receipt, Percent, Pin 
} from 'lucide-react';
import './Sidebar.css';

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
      { to: '/inventario',  Icon: PackageSearch, label: 'Stock y movimientos' },
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
  const [isPinned, setIsPinned] = useState(false);

  return (
    <aside className={`sidebar ${isPinned ? 'sidebar--pinned' : ''}`}>
      
      <div className="sidebar-logo">
        <div className="logo-icon">
          <Gem size={24} color="var(--color-primary)" />
        </div>
        <span className="logo-text">Kyro System</span>
        
        <button 
          className={`pin-button ${isPinned ? 'pin-button--active' : ''}`}
          onClick={() => setIsPinned(!isPinned)}
          title={isPinned ? "Desanclar menú" : "Anclar menú"}
        >
          <Pin size={18} />
        </button>
      </div>
      
      <nav className="sidebar-nav">
        {sections.map((s) => (
          <div key={s.label}>
            <span className="sidebar-category">{s.label}</span>
            {s.links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `nav-link${isActive ? ' nav-link--active' : ''}`
                }
              >
                <span className="nav-icon">
                  <l.Icon size={18} />
                </span>
                <span className="nav-label">{l.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
};