import React from 'react';
import { Hammer } from 'lucide-react';

export const ConfigGeneralPage = () => {
    return (
        <section className="config-section" style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
            {/* Cabecera de la sección */}
            <div className="section-title" style={{ marginBottom: '32px' }}>
                <h2 style={{ color: 'var(--color-text)', margin: 0, fontSize: '1.5rem' }}>Configuración General</h2>
               
            </div>

            {/* Placeholder de Construcción (Reutilizando tus clases del Dashboard) */}
            <div className="construction-box">
                <div className="construction-icon-wrapper">
                    <Hammer size={32} className="construction-icon" />
                </div>
                <h3 style={{ color: 'var(--color-text)' }}>Sección en Construcción</h3>
                <p style={{ color: 'var(--color-text-secondary)' }}>
                    Estamos preparando esta sección. 
                </p>
            </div>
        </section>
    );
};