import { NavLink, Outlet } from 'react-router-dom';
import { User, Palette, ChevronRight, Settings } from 'lucide-react';
import './SettingsLayout.css';

export const SettingsLayout = () => {
    return (
        <div className="config-container">
            <header className="config-header">
                <h1>Configuración del Sistema</h1>
                <p>Gestiona tu cuenta, preferencias de interfaz y ajustes generales.</p>
            </header>

            <div className="config-layout">
                {/* Menú lateral izquierdo */}
                <aside className="config-sidebar">
                    <nav>
                        <NavLink 
                            to="/perfil" 
                            className={({ isActive }) => `config-nav-btn ${isActive ? 'active' : ''}`}
                        >
                            <User size={18} />
                            <span>Mi Perfil</span>
                            <ChevronRight size={14} className="chevron" />
                        </NavLink>
                        
                        <NavLink 
                            to="/configuracion/apariencia" 
                            className={({ isActive }) => `config-nav-btn ${isActive ? 'active' : ''}`}
                        >
                            <Palette size={18} />
                            <span>Apariencia</span>
                            <ChevronRight size={14} className="chevron" />
                        </NavLink>

                         <NavLink 
                            to="/configuracion/general" 
                            className={({ isActive }) => `config-nav-btn ${isActive ? 'active' : ''}`}
                        >
                            <Settings size={18} />
                            <span>Configuracion</span>
                            <ChevronRight size={14} className="chevron" />
                        </NavLink>
                    </nav>
                </aside>

                {/* Contenedor derecho dinámico */}
                <main className="config-content">
                    <Outlet /> {/* Aquí React Router inyecta la página activa (ProfilePage o AparienciaPage) */}
                </main>
            </div>
        </div>
    );
};