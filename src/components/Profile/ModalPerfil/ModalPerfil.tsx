import { useState } from 'react';
import { X, Save, Lock, User, Mail } from 'lucide-react';
import './ModalPerfil.css';

// Las props que recibe el modal
interface ModalPerfilProps {
    isOpen: boolean;
    onClose: () => void;
    usuarioActual: {
        nombre: string;
        apellido?: string | null;
        email: string;
    };
    onActualizado: (nuevoUsuario: any) => void; // Función para avisarle a la Sidebar que actualice las letras
}

export const ModalPerfil = ({ isOpen, onClose, usuarioActual, onActualizado }: ModalPerfilProps) => {
    // Estados del formulario
    const [nombre, setNombre] = useState(usuarioActual.nombre);
    const [apellido, setApellido] = useState(usuarioActual.apellido || '');
    const [email, setEmail] = useState(usuarioActual.email);
    const [passwordNuevo, setPasswordNuevo] = useState('');
    
    // Estados de la petición
    const [loading, setLoading] = useState(false);
    const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMensaje({ texto: '', tipo: '' });

        try {
            // Obtener el token de donde lo guardes en el login (ej. localStorage)
            const token = localStorage.getItem('token'); 

            // Construir el cuerpo (solo enviamos el password si el usuario escribió uno)
            const bodyData: any = { nombre, apellido, email };
            if (passwordNuevo.trim() !== '') {
                bodyData.passwordNuevo = passwordNuevo;
            }

            const response = await fetch('http://localhost:4000/api/auth/perfil', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // 👈 Aquí pasamos el Gafete
                },
                body: JSON.stringify(bodyData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al actualizar el perfil');
            }

            setMensaje({ texto: '¡Perfil actualizado con éxito!', tipo: 'exito' });
            
            // Le pasamos los datos frescos al componente padre (Sidebar)
            onActualizado(data.usuario);
            
            // Cerramos el modal después de 1.5 segundos
            setTimeout(() => {
                onClose();
                setMensaje({ texto: '', tipo: '' });
                setPasswordNuevo(''); // Limpiamos el campo de password
            }, 1500);

        } catch (error: any) {
            setMensaje({ texto: error.message, tipo: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Configuración de Perfil</h2>
                    <button onClick={onClose} className="btn-close"><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="modal-body">
                    {mensaje.texto && (
                        <div className={`alerta alerta-${mensaje.tipo}`}>
                            {mensaje.texto}
                        </div>
                    )}

                    <div className="form-group">
                        <label><User size={16} /> Nombre</label>
                        <input 
                            type="text" 
                            value={nombre} 
                            onChange={(e) => setNombre(e.target.value)} 
                            required 
                        />
                    </div>

                    <div className="form-group">
                        <label><User size={16} /> Apellidos (Opcional)</label>
                        <input 
                            type="text" 
                            value={apellido} 
                            onChange={(e) => setApellido(e.target.value)} 
                        />
                    </div>

                    <div className="form-group">
                        <label><Mail size={16} /> Correo Electrónico</label>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                        />
                    </div>

                    <div className="form-divider"></div>

                    <div className="form-group">
                        <label><Lock size={16} /> Nueva Contraseña (Opcional)</label>
                        <input 
                            type="password" 
                            placeholder="Déjalo en blanco si no quieres cambiarla"
                            value={passwordNuevo} 
                            onChange={(e) => setPasswordNuevo(e.target.value)} 
                        />
                    </div>

                    <div className="modal-footer">
                        <button type="button" onClick={onClose} className="btn-cancel">Cancelar</button>
                        <button type="submit" disabled={loading} className="btn-save">
                            {loading ? 'Guardando...' : <><Save size={16} /> Guardar Cambios</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};