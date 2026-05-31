import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../services/auth.service';
import toast from 'react-hot-toast'; 
import './Login.css';

export const Login = () => {
    // ==========================================
    // BLOQUE 1: LA MEMORIA (Estados)
    // ==========================================
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    // const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    // ==========================================
    // BLOQUE 2: LAS ACCIONES (Lógica)
    // ==========================================
    const handleIngresar = async (e: React.FormEvent) => { 
        e.preventDefault(); 
        
        setIsLoading(true);

        try {
            const respuesta = await login({ email, password });
            
            // 2. Usamos toast.success en lugar del console.log
            toast.success(`¡Bienvenido al sistema, ${respuesta.usuario.nombre}!`);
            
            navigate('/dashboard');
            
        } catch (err: any) {
            // 3. Usamos toast.error para mostrar el fallo flotante
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
            <div className="login-sidebar">
                <div className="sidebar-content">
                    <h2>Mejora la calidad de tus procesos</h2>
                    <p>Un sistema balanceado e inteligente llenará tu trabajo de eficiencia y tranquilidad.</p>
                </div>
            </div>

            <div className="login-container">
                <div className="login-box">
                    <div className="login-header">
                        <div className="logo-placeholder">K</div>
                        <h2>¡Hola de nuevo!</h2>
                        <p>Ingresa tus credenciales para continuar</p>
                    </div>

                    {/* El bloque div de "error-alert" que estaba aquí */}

                    <form onSubmit={handleIngresar} className="login-form">
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
                            {isLoading ? 'Verificando...' : 'Iniciar Sesión'}
                        </button>
                        
                        <div className="register-prompt">
                            <span>¿Aún no tienes una cuenta? </span>
                            <button 
                                type="button" 
                                onClick={() => navigate('/registrar')}
                                className="register-link-button"
                            >
                                Regístrate
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};