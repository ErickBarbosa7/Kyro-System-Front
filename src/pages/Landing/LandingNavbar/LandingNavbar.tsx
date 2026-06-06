import { Gem } from 'lucide-react';
import { Link } from 'react-router-dom';
import './LandingNavbar.css';

export const LandingNavbar = () => (
    <nav className="public-navbar">
        <div className="nav-logo">
            <Gem size={26} color="var(--color-primary)" />
            <span className="landing-logo-text">Kyro System</span>
        </div>

        <div className="nav-links-center">
            <a href="#modulos" className="nav-link">Módulos</a>
            <a href="#beneficios" className="nav-link">Beneficios</a>
        </div>

        <div className="nav-actions">
            <Link to="/registrar" className="lnav-btn-outline">Crear cuenta</Link>
            <Link to="/login" className="lnav-btn-primary">Iniciar Sesión</Link>
        </div>
    </nav>
);