import { Link } from 'react-router-dom';
import './Sidebar.css'; 

export const Sidebar = () => {
    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <h2>Kyro-System</h2>
            </div>
           <nav className="sidebar-nav">
                <span className="sidebar-category">General</span>
                <Link to="/dashboard" className="nav-link">Panel Principal</Link>
                
                <span className="sidebar-category">Catálogos</span>
                <Link to="/proveedores" className="nav-link">Proveedores</Link>
                <Link to="/materiales" className="nav-link">Materiales</Link>
                <Link to="/metales" className="nav-link">Metales</Link>
                <Link to="/acabados" className="nav-link">Acabados</Link>
                
                <span className="sidebar-category">Producción</span>
                <Link to="/colecciones" className="nav-link">Colecciones</Link>
                <Link to="/piezas" className="nav-link">Piezas</Link>
                <Link to="/costeo" className="nav-link">Costeo</Link>

                <span className="sidebar-category">Inventario</span>
                <Link to="/colecciones" className="nav-link">Stock y Movimientos</Link>

                <span className="sidebar-category">Finanzas</span>
                <Link to="/colecciones" className="nav-link">Gastos Operativos</Link>
                <Link to="/colecciones" className="nav-link">Margenes y Precios</Link>
            </nav>
        </aside>
    );
};