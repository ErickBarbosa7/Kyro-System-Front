import { useNavigate } from 'react-router-dom';
import { logout } from '../services/auth.service';
import './Navbar.css'; 

export const Navbar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        logout(); 
        navigate('/login'); 
    };

    return (
        <header className="navbar">
            <span style={{ fontWeight: 'bold', color: '#333' }}>
                Sistema de Gestión
            </span>
            <button onClick={handleLogout} className="btn-logout">
                Cerrar Sesión
            </button>
        </header>
    );
};