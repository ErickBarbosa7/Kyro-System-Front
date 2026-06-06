import { Link } from 'react-router-dom';
import { ArrowRight, Calculator, Diamond, BarChart3, ShieldCheck } from 'lucide-react';
import './HeroSection.css';

export const HeroSection = () => {
    const handleScrollToModulos = () => {
        const el = document.getElementById('modulos');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <section className="hero-container">
            {/* ── Fondo decorativo ── */}
            <div className="hero-bg-shape" aria-hidden="true" />

            {/* ── Contenido izquierdo ── */}
            <div className="hero-content">
                <div className="hero-badge">
                    <span className="badge-dot" />
                    Sistema ERP · Industria Joyera
                </div>

                <h1 className="hero-title">
                    Control exacto de costos<br />
                    y producción en tu{' '}
                    <span className="text-highlight">Taller Joyero</span>
                </h1>

                <p className="hero-subtitle">
                    Administra inventarios de metales, registra gastos operativos y
                    calcula automáticamente el costo real de cada pieza para maximizar
                    tu rentabilidad. Sin hojas de cálculo.
                </p>

                <div className="hero-actions">
                    <Link to="/registrar" className="btn-hero-primary">
                        Empezar gratis <ArrowRight size={17} />
                    </Link>
                    <button className="btn-hero-secondary" onClick={handleScrollToModulos}>
                        Ver módulos
                    </button>
                </div>

                {/* Sellos de confianza */}
                <div className="hero-trust">
                    <div className="trust-item">
                        <Calculator size={16} className="trust-icon" />
                        <span>Costeo automático</span>
                    </div>
                    <div className="trust-sep" />
                    <div className="trust-item">
                        <Diamond size={16} className="trust-icon" />
                        <span>Control de metales</span>
                    </div>
                    <div className="trust-sep" />
                    <div className="trust-item">
                        <BarChart3 size={16} className="trust-icon" />
                        <span>Precios y márgenes</span>
                    </div>
                    <div className="trust-sep" />
                    <div className="trust-item">
                        <ShieldCheck size={16} className="trust-icon" />
                        <span>Multi-rol</span>
                    </div>
                </div>
            </div>

            {/* ── Mockup derecho ── */}
            <div className="hero-visual" aria-hidden="true">
                <div className="dashboard-mockup">
                    {/* Barra de título */}
                    <div className="mockup-header">
                        <div className="mockup-dots">
                            <span className="md md-r" />
                            <span className="md md-y" />
                            <span className="md md-g" />
                        </div>
                        <div className="mockup-titlebar">
                            <span className="mockup-app-name">Kyro System</span>
                            <span className="mockup-breadcrumb">/ Costeo de Pieza</span>
                        </div>
                    </div>

                    {/* Cuerpo del mockup */}
                    <div className="mockup-body">
                        {/* Sidebar */}
                        <div className="mockup-sidebar">
                            <div className="mockup-nav-item active">
                                <span className="mni-icon" />
                                <span className="mni-label" />
                            </div>
                            <div className="mockup-nav-item">
                                <span className="mni-icon" />
                                <span className="mni-label short" />
                            </div>
                            <div className="mockup-nav-item">
                                <span className="mni-icon" />
                                <span className="mni-label" />
                            </div>
                            <div className="mockup-nav-item">
                                <span className="mni-icon" />
                                <span className="mni-label short" />
                            </div>
                            <div className="mockup-nav-item">
                                <span className="mni-icon" />
                                <span className="mni-label" />
                            </div>
                        </div>

                        {/* Contenido principal */}
                        <div className="mockup-main">
                            {/* Pieza header */}
                            <div className="mockup-piece-header">
                                <div className="mockup-piece-thumb" />
                                <div className="mockup-piece-info">
                                    <div className="mpi-key" />
                                    <div className="mpi-name" />
                                    <div className="mpi-badge" />
                                </div>
                            </div>

                            {/* KPI cards */}
                            <div className="mockup-kpis">
                                <div className="mockup-kpi">
                                    <div className="kpi-label" />
                                    <div className="kpi-value primary" />
                                </div>
                                <div className="mockup-kpi">
                                    <div className="kpi-label" />
                                    <div className="kpi-value gold" />
                                </div>
                                <div className="mockup-kpi">
                                    <div className="kpi-label" />
                                    <div className="kpi-value" />
                                </div>
                            </div>

                            {/* Tabla de costeo */}
                            <div className="mockup-cost-table">
                                <div className="mct-header">
                                    <div className="mct-col wide" />
                                    <div className="mct-col" />
                                    <div className="mct-col" />
                                </div>
                                <div className="mct-row">
                                    <div className="mct-col wide accent" />
                                    <div className="mct-col" />
                                    <div className="mct-col" />
                                </div>
                                <div className="mct-row">
                                    <div className="mct-col wide" />
                                    <div className="mct-col" />
                                    <div className="mct-col" />
                                </div>
                                <div className="mct-row">
                                    <div className="mct-col wide" />
                                    <div className="mct-col" />
                                    <div className="mct-col" />
                                </div>
                                <div className="mct-row total">
                                    <div className="mct-col wide bold" />
                                    <div className="mct-col" />
                                    <div className="mct-col primary-fill" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tarjetas flotantes */}
                <div className="floating-card fc-left">
                    <div className="fc-icon">📦</div>
                    <div className="fc-text">
                        <div className="fc-title">Stock de Plata .925</div>
                        <div className="fc-val alert">⚠ Bajo inventario</div>
                    </div>
                </div>
                <div className="floating-card fc-right">
                    <div className="fc-icon">💰</div>
                    <div className="fc-text">
                        <div className="fc-title">Margen público</div>
                        <div className="fc-val good">+68% rentabilidad</div>
                    </div>
                </div>
            </div>
        </section>
    );
};