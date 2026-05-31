import { Link } from 'react-router-dom';
import './Sidebar.css'; 

export const Sidebar = () => {
    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <h2>Kyro-System</h2>
            </div>
            <nav className="sidebar-nav">
                <Link to="/dashboard" className="nav-link">Panel Principal</Link>
                <Link to="/inventario" className="nav-link">Inventario</Link>
                <Link to="/taller" className="nav-link">Taller</Link>
            </nav>
        </aside>
    );
};