import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../services/auth.service';
import toast from 'react-hot-toast'; 
import { Player } from '@lottiefiles/react-lottie-player';

// Importaciones de animaciones 
import animacionFondoPlane from '../../assets/plane.json'; 
import animacionRobot from '../../assets/robot.json';
import animacionWelcome from '../../assets/welcome.json'; 

import './Login.css';

export const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const handleIngresar = async (e: React.FormEvent) => { 
        e.preventDefault(); 
        setIsLoading(true);

        try {
            const respuesta = await login({ email, password });
            toast.success(`¡Bienvenido al sistema, ${respuesta.usuario.nombre}!`);
            navigate('/dashboard');
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Error al conectar con el servidor");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div 
                className="brand-logo" 
                onClick={() => navigate('/')} 
                style={{ cursor: 'pointer' }}
                title="Volver a la página principal"
            >
                Kyro-System
            </div>


            <div className="plane-bg-container">
                <Player autoplay loop src={animacionFondoPlane} className="plane-bg-player" speed={0.5} />
            </div>

            <div className="login-card-wrapper">
                <div className="login-sidebar">
                    <div className="sidebar-content">
                        <h2>Control total para cada creación</h2>
                        <p>Supervisa materiales, inventario y producción para mantener cada pieza bajo control.</p>
                    </div>
                    <div className="robot-container">
                        <Player autoplay loop src={animacionRobot} className="robot-player" speed={0.8}/>
                    </div>
                </div>

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
                            <h2>¡Hola de nuevo!</h2>
                            <p>Ingresa tus credenciales para continuar</p>
                        </div>

                        <form onSubmit={handleIngresar} className="login-form">
                            <div className="form-field">
                                <label>Correo Electrónico:</label>
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="usuario@correo.com" />
                            </div>
                            <div className="form-field">
                                <label>Contraseña:</label>
                                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
                            </div>
                            <button type="submit" disabled={isLoading} className="submit-button">
                                {isLoading ? 'Verificando...' : 'Iniciar Sesión'}
                            </button>
                            <div className="register-prompt">
                                <span>¿Aún no tienes una cuenta? </span>
                                <button type="button" onClick={() => navigate('/registrar')} className="register-link-button">Regístrate</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};