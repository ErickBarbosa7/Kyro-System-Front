import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/auth.service';

export const Login = () => {
    // ==========================================
    // BLOQUE 1: LA MEMORIA (Estados)
    // ==========================================
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null); // Tipado básico de TS
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate(); // <--- 2. Tienes que inicializar la herramienta aquí

    // ==========================================
    // BLOQUE 2: LAS ACCIONES (Lógica)
    // ==========================================
    // <--- 3. Le decimos a TypeScript que 'e' es un evento de formulario
    const handleIngresar = async (e: React.FormEvent) => { 
        e.preventDefault(); 
        
        setIsLoading(true);
        setError(null);

        try {
            const respuesta = await login({ email, password });
            console.log("¡Bienvenido al sistema!", respuesta.usuario.nombre);
            
            navigate('/dashboard');
            
        } catch (err: any) {
            setError(err.response?.data?.error || "Error al conectar con el servidor");
        } finally {
            setIsLoading(false);
        }
    };

    // ==========================================
    // BLOQUE 3: LA VISTA (HTML / JSX)
    // ==========================================
    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', fontFamily: 'sans-serif' }}>
            <h2>Acceso al Sistema</h2>

            {error && (
                <div style={{ backgroundColor: '#ffcccc', padding: '10px', marginBottom: '15px', color: 'red' }}>
                    {error}
                </div>
            )}

            <form onSubmit={handleIngresar}>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Correo Electrónico:</label>
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Contraseña:</label>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>

                <button 
                    type="submit" 
                    disabled={isLoading}
                    style={{ width: '100%', padding: '10px', backgroundColor: '#0066cc', color: 'white', border: 'none' }}
                >
                    {isLoading ? 'Verificando...' : 'Entrar'}
                </button>
            </form>
        </div>
    );
};