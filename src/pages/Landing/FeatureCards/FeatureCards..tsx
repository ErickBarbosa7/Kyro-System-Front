import { PackageSearch, Calculator, Gem, BarChart3 } from 'lucide-react';
import './FeatureCards.css';

export const FeatureCards = () => {
    return (
        <section id="beneficios" className="features-section">
            <div className="features-header">
                <p className="section-eyebrow">Ventajas clave</p>
                <h2>¿Por qué elegir Kyro System?</h2>
                <p>Todo lo que necesitas para profesionalizar tu producción joyera en un solo lugar.</p>
            </div>

            <div className="features-grid">
                <div className="feature-card">
                    <div className="feature-icon-wrapper">
                        <Gem size={24} className="feature-icon" />
                    </div>
                    <h3>Gestión de Catálogos</h3>
                    <p>Administra proveedores, metales, piedras y acabados con sus precios actualizados al día.</p>
                </div>

                <div className="feature-card">
                    <div className="feature-icon-wrapper">
                        <Calculator size={24} className="feature-icon" />
                    </div>
                    <h3>Costeo Automático</h3>
                    <p>El sistema calcula el costo real de cada pieza sumando materiales, mermas de metal y mano de obra.</p>
                </div>

                <div className="feature-card">
                    <div className="feature-icon-wrapper">
                        <PackageSearch size={24} className="feature-icon" />
                    </div>
                    <h3>Control de Inventario</h3>
                    <p>Recibe alertas cuando tus metales o materiales estén por agotarse para que nunca pares de producir.</p>
                </div>

                <div className="feature-card">
                    <div className="feature-icon-wrapper">
                        <BarChart3 size={24} className="feature-icon" />
                    </div>
                    <h3>Precios y Rentabilidad</h3>
                    <p>Configura tus márgenes de ganancia para generar automáticamente precios de Taller, Mayorista y Público.</p>
                </div>
            </div>
        </section>
    );
};