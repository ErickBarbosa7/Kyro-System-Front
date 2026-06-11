import { useNavigate } from 'react-router-dom';
import { logout } from '../../services/auth.service';
import { LogOut } from 'lucide-react';
import './Navbar.css'; 

export const Navbar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        logout(); 
        navigate('/login'); 
    };

    return (
        <header className="navbar">
            <span className="navbar-brand">
                Kyro System
            </span>
            <button onClick={handleLogout} className="btn-logout" title="Cerrar sesión">
                <LogOut size={16} />
                <span>Cerrar Sesión</span>
            </button>
        </header>
    );
};