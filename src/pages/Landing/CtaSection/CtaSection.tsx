import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import './CtaSection.css';

export const CtaSection = () => (
    <section className="cta-section">
        <div className="cta-inner">
            <p className="cta-eyebrow">¿Listo para empezar?</p>
            <h2 className="cta-title">
                Transforma tu taller joyero<br />
                <em>hoy mismo</em>
            </h2>
            <p className="cta-subtitle">
                Crea tu cuenta gratis y empieza a controlar tus costos, inventario y
                rentabilidad desde el primer día.
            </p>
            <div className="cta-actions">
                <Link to="/registrar" className="cta-btn-main">
                    Crear cuenta gratis <ArrowRight size={17} />
                </Link>
                <Link to="/login" className="cta-btn-sec">
                    Ya tengo cuenta
                </Link>
            </div>
        </div>
    </section>
);