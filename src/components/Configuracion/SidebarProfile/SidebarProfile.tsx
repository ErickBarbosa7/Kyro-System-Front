import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MoreVertical, User, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './SidebarProfile.css';

interface UsuarioProps {
    nombre: string;
    apellido?: string | null;
    email: string;
    rol: {
        nombre: string;
    };
}

interface SidebarProfileProps {
    usuario: UsuarioProps;
    sidebarOpen: boolean; // ← nuevo prop
}

export const SidebarProfile = ({ usuario, sidebarOpen }: SidebarProfileProps) => {
    const navigate = useNavigate();

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [dropdownPos, setDropdownPos] = useState({ bottom: 0, left: 0, width: 0 });

    const profileRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const getInitials = (nombre: string, apellido?: string | null) => {
        const primeraLetra = nombre ? nombre.charAt(0).toUpperCase() : '';
        const segundaLetra = apellido ? apellido.charAt(0).toUpperCase() : '';
        if (!apellido && nombre.length > 1) {
            return primeraLetra + nombre.charAt(1).toUpperCase();
        }
        return `${primeraLetra}${segundaLetra}`;
    };

    const openMenu = () => {
        if (profileRef.current) {
            const rect = profileRef.current.getBoundingClientRect();

            if (sidebarOpen) {
                // Sidebar abierta: dropdown ocupa el ancho del perfil con margen
                setDropdownPos({
                    bottom: window.innerHeight - rect.top + 8,
                    left: rect.left + 8,
                    width: rect.width - 16,
                });
            } else {
                // Sidebar cerrada: dropdown aparece a la derecha del avatar, con ancho fijo
                setDropdownPos({
                    bottom: window.innerHeight - rect.bottom + 8,
                    left: rect.right + 10,
                    width: 200,
                });
            }
        }
        setIsMenuOpen((v) => !v);
    };

    // Cierra al hacer clic fuera
    useEffect(() => {
        if (!isMenuOpen) return;
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            const outsideProfile = profileRef.current && !profileRef.current.contains(target);
            const outsideDropdown = dropdownRef.current && !dropdownRef.current.contains(target);
            if (outsideProfile && outsideDropdown) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMenuOpen]);

    // Si el sidebar se cierra/abre mientras el dropdown está abierto, cerrarlo
    useEffect(() => {
        setIsMenuOpen(false);
    }, [sidebarOpen]);

    const handleLogout = () => {
        localStorage.removeItem('kyro_token');
        localStorage.removeItem('kyro_usuario');
        window.location.href = '/login';
    };

    return (
        <div className="sidebar-profile" ref={profileRef}>

            <div className="profile-avatar">
                {getInitials(usuario.nombre, usuario.apellido)}
            </div>

            <div className="profile-info">
                <span className="profile-name">
                    {usuario.nombre} {usuario.apellido || ''}
                </span>
                <span className="profile-role">{usuario.rol.nombre}</span>
            </div>

            {/* Botón solo visible cuando el sidebar está abierto */}
            <button
                className={`profile-more ${isMenuOpen ? 'active' : ''}`}
                title="Opciones de cuenta"
                onClick={openMenu}
            >
                <MoreVertical size={18} />
            </button>

            {/* Cuando está cerrado, el avatar entero es clickeable */}
            {!sidebarOpen && (
                <button
                    className="profile-avatar-btn"
                    onClick={openMenu}
                    aria-label="Opciones de cuenta"
                />
            )}

            {isMenuOpen && createPortal(
                <div
                    className="profile-dropdown"
                    ref={dropdownRef}
                    style={{
                        position: 'fixed',
                        bottom: dropdownPos.bottom,
                        left: dropdownPos.left,
                        width: dropdownPos.width,
                    }}
                >
                    <button onClick={() => { setIsMenuOpen(false); navigate('/perfil'); }}>
                        <User size={16} />
                        <span>Mi Perfil</span>
                    </button>

                    <button onClick={() => { setIsMenuOpen(false); navigate('/configuracion'); }}>
                        <Settings size={16} />
                        <span>Configuración</span>
                    </button>

                    <div className="dropdown-divider"></div>

                    <button onClick={handleLogout} className="dropdown-logout">
                        <LogOut size={16} />
                        <span>Cerrar sesión</span>
                    </button>
                </div>,
                document.body
            )}
        </div>
    );
};