import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Save, Pencil, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { actualizarPerfil } from '../../../services/auth.service';
import './ProfilePage.css';

export const ProfilePage = () => {
    // 1. Estados de los valores reales (Lo que está guardado)
    const [nombreVal, setNombreVal] = useState('');
    const [apellidoVal, setApellidoVal] = useState('');
    const [emailVal, setEmailVal] = useState('');
    const [rolVal, setRolVal] = useState('Usuario');

    // 2. Estados temporales (Lo que el usuario escribe en el input antes de guardar)
    const [tempNombre, setTempNombre] = useState('');
    const [tempApellido, setTempApellido] = useState('');
    const [passwordAnterior, setPasswordAnterior] = useState('');
    const [passwordNuevo, setPasswordNuevo] = useState('');

    // 3. Estados para controlar SI SE MUESTRA EL INPUT O EL TEXTO
    const [isEditingNombre, setIsEditingNombre] = useState(false);
    const [isEditingApellido, setIsEditingApellido] = useState(false);
    const [isEditingPassword, setIsEditingPassword] = useState(false);

    const [loading, setLoading] = useState(false);

    // Cargar datos al iniciar
    useEffect(() => {
        const usuarioGuardado = localStorage.getItem('kyro_usuario');
        if (usuarioGuardado) {
            const user = JSON.parse(usuarioGuardado);
            setNombreVal(user.nombre || '');
            setApellidoVal(user.apellido || '');
            setEmailVal(user.email || '');
            setRolVal(user.rol || 'Usuario');
            
            setTempNombre(user.nombre || '');
            setTempApellido(user.apellido || '');
        }
    }, []);

    const getInitials = (n: string, a: string) => {
        const p1 = n ? n.charAt(0).toUpperCase() : '';
        const p2 = a ? a.charAt(0).toUpperCase() : '';
        return p1 + p2 || 'KY';
    };

    // Funciones para cancelar la edición y volver al texto original
    const handleCancelNombre = () => { setTempNombre(nombreVal); setIsEditingNombre(false); };
    const handleCancelApellido = () => { setTempApellido(apellidoVal); setIsEditingApellido(false); };
    const handleCancelPassword = () => { setPasswordAnterior(''); setPasswordNuevo(''); setIsEditingPassword(false); };

    // Función general para guardar en el backend
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const bodyData: any = {};
            
            if (isEditingNombre) bodyData.nombre = tempNombre;
            if (isEditingApellido) bodyData.apellido = tempApellido;
            
            if (isEditingPassword) {
                if (passwordNuevo.trim() !== '') {
                    if (passwordAnterior.trim() === '') {
                        throw new Error('Debes ingresar tu contraseña actual para cambiarla');
                    }
                    bodyData.passwordAnterior = passwordAnterior;
                    bodyData.passwordNuevo = passwordNuevo;
                }
            }

            await actualizarPerfil(bodyData);

            // Si todo sale bien, actualizamos los valores reales y cerramos los inputs
            setNombreVal(tempNombre);
            setApellidoVal(tempApellido);
            setIsEditingNombre(false);
            setIsEditingApellido(false);
            
            setPasswordAnterior('');
            setPasswordNuevo(''); 
            setIsEditingPassword(false);

            toast.success('¡Perfil actualizado con éxito!');
            window.dispatchEvent(new Event('storage'));

        } catch (error: any) {
            const mensajeError = error.response?.data?.error || error.message || 'Error al actualizar el perfil';
            toast.error(mensajeError);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="config-section">
            <div className="section-title">
                <h2>Información Personal</h2>
                <p>Actualiza tus datos básicos, correo electrónico y credenciales de acceso.</p>
            </div>

            <div className="profile-identity-card">
                <div className="profile-avatar-lg">
                    {getInitials(nombreVal, apellidoVal)}
                </div>
                <div>
                    <h3 className="profile-identity-name">{`${nombreVal} ${apellidoVal}`}</h3>
                    <span className="profile-identity-role">{rolVal}</span>
                </div>
            </div>

            <div className="profile-fields">
                
                {/* CAMPO: NOMBRE */}
                <div className={`profile-field ${isEditingNombre ? 'is-editing' : ''}`}>
                    <div className="profile-field-icon"><User size={16} /></div>
                    <div className="profile-field-content">
                        <label>Nombre</label>
                        {isEditingNombre ? (
                            <input type="text" value={tempNombre} onChange={(e) => setTempNombre(e.target.value)} autoFocus required />
                        ) : (
                            <p className="field-value-text">{nombreVal}</p>
                        )}
                    </div>
                    {isEditingNombre ? (
                        <div className="field-edit-actions"><button type="button" onClick={handleCancelNombre} className="btn-cancel"><X size={14} /></button></div>
                    ) : (
                        <button type="button" onClick={() => setIsEditingNombre(true)} className="btn-edit-pencil"><Pencil size={14} /></button>
                    )}
                </div>

                {/* CAMPO: APELLIDOS */}
                <div className={`profile-field ${isEditingApellido ? 'is-editing' : ''}`}>
                    <div className="profile-field-icon"><User size={16} /></div>
                    <div className="profile-field-content">
                        <label>Apellidos</label>
                        {isEditingApellido ? (
                            <input type="text" value={tempApellido} onChange={(e) => setTempApellido(e.target.value)} autoFocus />
                        ) : (
                            <p className="field-value-text">{apellidoVal || 'No asignado'}</p>
                        )}
                    </div>
                    {isEditingApellido ? (
                        <div className="field-edit-actions"><button type="button" onClick={handleCancelApellido} className="btn-cancel"><X size={14} /></button></div>
                    ) : (
                        <button type="button" onClick={() => setIsEditingApellido(true)} className="btn-edit-pencil"><Pencil size={14} /></button>
                    )}
                </div>

                {/* CAMPO: CORREO (SOLO LECTURA) */}
                <div className="profile-field field-readonly">
                    <div className="profile-field-icon"><Mail size={16} /></div>
                    <div className="profile-field-content">
                        <label>Correo Electrónico </label>
                        <input type="email" value={emailVal} readOnly />
                    </div>
                </div>

                {/* CAMPO: CONTRASEÑA */}
                <div className={`profile-field ${isEditingPassword ? 'is-editing' : ''}`}>
                    <div className="profile-field-icon"><Lock size={16} /></div>
                    <div className="profile-field-content">
                        <label>Contraseña Actual</label>
                        {isEditingPassword ? (
                            <input type="password" placeholder="Ingresa la actual" value={passwordAnterior} onChange={(e) => setPasswordAnterior(e.target.value)} autoFocus />
                        ) : (
                            <p className="field-value-text field-placeholder-text">********</p>
                        )}
                    </div>
                    {!isEditingPassword && (
                        <button type="button" onClick={() => setIsEditingPassword(true)} className="btn-edit-pencil"><Pencil size={14} /></button>
                    )}
                </div>

                {/* CAMPO: NUEVA CONTRASEÑA (Se revela al editar la anterior) */}
                {isEditingPassword && (
                    <div className="profile-field is-editing">
                        <div className="profile-field-icon"><Lock size={16} /></div>
                        <div className="profile-field-content">
                            <label>Nueva Contraseña</label>
                            <input type="password" placeholder="Déjalo en blanco para no cambiarla" value={passwordNuevo} onChange={(e) => setPasswordNuevo(e.target.value)} />
                        </div>
                        <div className="field-edit-actions">
                            <button type="button" onClick={handleCancelPassword} className="btn-cancel"><X size={14} /></button>
                        </div>
                    </div>
                )}

            </div>

            <div className="profile-action-container">
                <button type="submit" className="profile-save-btn" disabled={loading}>
                    <Save size={16} />
                    <span>{loading ? 'Guardando...' : 'Guardar Cambios'}</span>
                </button>
            </div>
        </form>
    );
};