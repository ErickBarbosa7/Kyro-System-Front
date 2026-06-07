import { User, Mail, Phone, MapPin, Calendar, ShieldCheck } from 'lucide-react';
import './Profile.css';

export const Profile = () => {
    return (
        <div className="config-container">
            <header className="config-header">
                <h1>Mi Perfil</h1>
                <p>Consulta y gestiona tu información personal y de cuenta.</p>
            </header>

            <div className="profile-layout">

                {/* Tarjeta de identidad */}
                <aside className="profile-card">
                    <div className="profile-card-avatar">JD</div>
                    <h2 className="profile-card-name">Nombre Usuario</h2>
                    <span className="profile-card-role">Administrador</span>
                    <div className="profile-card-divider" />
                    <p className="profile-card-email">usuario@kyro.com</p>
                </aside>

                {/* Contenido */}
                <main className="config-content">

                    <section className="config-section">
                        <div className="section-title">
                            <h2>Información Personal</h2>
                            <p>Tus datos básicos registrados en el sistema.</p>
                        </div>
                        <div className="profile-fields">
                            <div className="profile-field">
                                <span className="profile-field-icon"><User size={16} /></span>
                                <div>
                                    <label>Nombre completo</label>
                                    <p>Nombre Usuario</p>
                                </div>
                            </div>
                            <div className="profile-field">
                                <span className="profile-field-icon"><Mail size={16} /></span>
                                <div>
                                    <label>Correo electrónico</label>
                                    <p>usuario@kyro.com</p>
                                </div>
                            </div>
                            <div className="profile-field">
                                <span className="profile-field-icon"><Phone size={16} /></span>
                                <div>
                                    <label>Teléfono</label>
                                    <p>Sin registrar</p>
                                </div>
                            </div>
                            <div className="profile-field">
                                <span className="profile-field-icon"><MapPin size={16} /></span>
                                <div>
                                    <label>Ubicación</label>
                                    <p>Sin registrar</p>
                                </div>
                            </div>
                            <div className="profile-field">
                                <span className="profile-field-icon"><Calendar size={16} /></span>
                                <div>
                                    <label>Miembro desde</label>
                                    <p>Enero 2025</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="config-section" style={{ marginTop: '2.5rem' }}>
                        <div className="section-title">
                            <h2>Rol y Permisos</h2>
                            <p>Tu nivel de acceso dentro del sistema Kyro.</p>
                        </div>
                        <div className="settings-card">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <ShieldCheck size={18} style={{ color: 'var(--color-text-secondary)' }} />
                                <span className="placeholder-text">Información de rol cargando...</span>
                            </div>
                        </div>
                    </section>

                </main>
            </div>
        </div>
    );
};