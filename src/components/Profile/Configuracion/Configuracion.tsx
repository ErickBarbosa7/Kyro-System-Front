import { useState } from 'react';
import { User, Palette, Building2, ShieldCheck, Bell, ChevronRight, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import './Configuracion.css';

export const Configuracion = () => {
    const [activeTab, setActiveTab] = useState('perfil');

    const menuItems = [
        { id: 'perfil',         label: 'Mi Perfil',          icon: User },
        { id: 'apariencia',     label: 'Apariencia',          icon: Palette },
        { id: 'empresa',        label: 'Datos de Empresa',    icon: Building2 },
        { id: 'seguridad',      label: 'Seguridad',           icon: ShieldCheck },
        { id: 'notificaciones', label: 'Notificaciones',      icon: Bell },
    ];

    return (
        <div className="config-container">
            <header className="config-header">
                <h1>Configuración</h1>
                <p>Gestiona tu cuenta, preferencias de interfaz y ajustes generales.</p>
            </header>

            <div className="config-layout">

                {/* Sidebar interna */}
                <aside className="config-sidebar">
                    <nav>
                        {menuItems.map((item) => (
                            <button
                                key={item.id}
                                className={`config-nav-btn ${activeTab === item.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(item.id)}
                            >
                                <item.icon size={18} />
                                <span>{item.label}</span>
                                {activeTab === item.id && <ChevronRight size={14} className="chevron" />}
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Contenido dinámico */}
                <main className="config-content">

                    {/* ── MI PERFIL ── */}
                    {activeTab === 'perfil' && (
                        <section className="config-section">
                            <div className="section-title">
                                <h2>Mi Perfil</h2>
                                <p>Tu información personal registrada en el sistema.</p>
                            </div>

                            {/* Tarjeta de identidad */}
                            <div className="profile-identity-card">
                                <div className="profile-avatar-lg">JD</div>
                                <div>
                                    <p className="profile-identity-name">Nombre Usuario</p>
                                    <span className="profile-identity-role">Administrador</span>
                                </div>
                            </div>

                            {/* Campos */}
                            <div className="profile-fields">
                                <div className="profile-field">
                                    <span className="profile-field-icon"><User size={15} /></span>
                                    <div>
                                        <label>Nombre completo</label>
                                        <p>Nombre Usuario</p>
                                    </div>
                                </div>
                                <div className="profile-field">
                                    <span className="profile-field-icon"><Mail size={15} /></span>
                                    <div>
                                        <label>Correo electrónico</label>
                                        <p>usuario@kyro.com</p>
                                    </div>
                                </div>
                                <div className="profile-field">
                                    <span className="profile-field-icon"><Phone size={15} /></span>
                                    <div>
                                        <label>Teléfono</label>
                                        <p>Sin registrar</p>
                                    </div>
                                </div>
                                <div className="profile-field">
                                    <span className="profile-field-icon"><MapPin size={15} /></span>
                                    <div>
                                        <label>Ubicación</label>
                                        <p>Sin registrar</p>
                                    </div>
                                </div>
                                <div className="profile-field">
                                    <span className="profile-field-icon"><Calendar size={15} /></span>
                                    <div>
                                        <label>Miembro desde</label>
                                        <p>Enero 2025</p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* ── APARIENCIA ── */}
                    {activeTab === 'apariencia' && (
                        <section className="config-section">
                            <div className="section-title">
                                <h2>Interfaz y Estilo</h2>
                                <p>Personaliza cómo se ve tu ERP (Modo oscuro, colores y densidad).</p>
                            </div>
                            <div className="settings-card">
                                <div className="placeholder-text">Selector de Temas y Colores cargando...</div>
                            </div>
                        </section>
                    )}

                    {/* ── EMPRESA ── */}
                    {activeTab === 'empresa' && (
                        <section className="config-section">
                            <div className="section-title">
                                <h2>Información de Negocio</h2>
                                <p>Configura el nombre de tu empresa, logo y moneda de operación.</p>
                            </div>
                            <div className="settings-card">
                                <div className="placeholder-text">Formulario de Empresa cargando...</div>
                            </div>
                        </section>
                    )}

                    {/* ── SEGURIDAD ── */}
                    {activeTab === 'seguridad' && (
                        <section className="config-section">
                            <div className="section-title">
                                <h2>Seguridad</h2>
                                <p>Cambia tu contraseña y gestiona el acceso a tu cuenta.</p>
                            </div>
                            <div className="settings-card">
                                <div className="placeholder-text">Opciones de seguridad cargando...</div>
                            </div>
                        </section>
                    )}

                    {/* ── NOTIFICACIONES ── */}
                    {activeTab === 'notificaciones' && (
                        <section className="config-section">
                            <div className="section-title">
                                <h2>Notificaciones</h2>
                                <p>Elige qué alertas y avisos quieres recibir.</p>
                            </div>
                            <div className="settings-card">
                                <div className="placeholder-text">Preferencias de notificaciones cargando...</div>
                            </div>
                        </section>
                    )}

                </main>
            </div>
        </div>
    );
};