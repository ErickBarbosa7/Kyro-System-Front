import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registrarUsuario } from '../../services/auth.service'; 
import toast from 'react-hot-toast'; 
import { Player } from '@lottiefiles/react-lottie-player';

import animacionFondoPlane from '../../assets/plane.json'; 
import animacionRobot from '../../assets/robot.json'; // Ajusta la ruta si es diferente
import animacionWelcome from '../../assets/welcome.json'; 

import './Login.css'; // Reutilizamos el mismo CSS

export const Registrar = () => {
    // ==========================================
    // BLOQUE 1: LA MEMORIA (Estados)
    // ==========================================
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState(''); 
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    // ==========================================
    // BLOQUE 2: LAS ACCIONES (Lógica)
    // ==========================================
    const handleRegistro = async (e: React.FormEvent) => { 
        e.preventDefault(); 
        
        setIsLoading(true);

        try {
            await registrarUsuario({ nombre, apellido, email, password });
            toast.success('¡Cuenta creada exitosamente!');
            navigate('/login'); 
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Error al conectar con el servidor");
        } finally {
            setIsLoading(false);
        }
    };

    // ==========================================
    // BLOQUE 3: LA VISTA (HTML / JSX)
    // ==========================================
    return (
        <div className="login-page">
            
            <div className="brand-logo">
                Kyro-System
            </div>

            {/* ==========================================
               Capa de fondo (Animaciones)
               ========================================== */}
            
            
            {/* PLANE (Arriba-derecha) */}
            <div className="plane-bg-container">
                <Player
                    autoplay
                    loop
                    src={animacionFondoPlane}
                    className="plane-bg-player"
                />
            </div>

            {/* ==========================================
               TARJETA PRINCIPAL FLOTANTE (Glassmorphism)
               ========================================== */}
            <div className="login-card-wrapper">
                
                {/* LADO IZQUIERDO (Textos y Robot) */}
                <div className="login-sidebar">
                    <div className="sidebar-content">
                        <h2>Lleva tu gestión al siguiente nivel</h2>
                        <p>Únete a nuestra plataforma y experimenta un control total, optimizado e inteligente.</p>
                    </div>
                    
                    <div className="robot-container">
                        <Player
                            autoplay
                            loop
                            src={animacionRobot}
                            className="robot-player"
                        />
                    </div>
                </div>

                {/* LADO DERECHO (Formulario de Registro) */}
                <div className="login-container">
                    <div className="login-box">
                        <div className="login-header">
                            <div className="logo-placeholder">
                                <Player
                                    autoplay
                                    loop
                                    src={animacionWelcome}
                                />
                            </div>
                            <h2>Crear una Cuenta</h2>
                            <p>Completa los campos para registrarte en el sistema</p>
                        </div>

                        <form onSubmit={handleRegistro} className="login-form">
                            
                            <div className="form-field">
                                <label>Nombre:</label>
                                <input 
                                    type="text" 
                                    value={nombre} 
                                    onChange={(e) => setNombre(e.target.value)} 
                                    required 
                                    placeholder="Ingresa tu nombre"
                                />
                            </div>

                            <div className="form-field">
                                <label>Apellido:</label>
                                <input 
                                    type="text" 
                                    value={apellido} 
                                    onChange={(e) => setApellido(e.target.value)} 
                                    required 
                                    placeholder="Ingresa tu apellido"
                                />
                            </div>

                            <div className="form-field">
                                <label>Correo Electrónico:</label>
                                <input 
                                    type="email" 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                    required 
                                    placeholder="usuario@correo.com"
                                />
                            </div>

                            <div className="form-field">
                                <label>Contraseña:</label>
                                <input 
                                    type="password" 
                                    value={password} 
                                    onChange={(e) => setPassword(e.target.value)} 
                                    required 
                                    placeholder="••••••••"
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={isLoading}
                                className="submit-button"
                            >
                                {isLoading ? 'Registrando...' : 'Registrarse'}
                            </button>
                            
                            <div className="register-prompt">
                                <span>¿Ya tienes una cuenta? </span>
                                <button 
                                    type="button" 
                                    onClick={() => navigate('/login')}
                                    className="register-link-button"
                                >
                                    Inicia Sesión
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            
        </div>
    );
};