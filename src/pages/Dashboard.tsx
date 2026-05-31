// src/pages/Dashboard.tsx
import { useEffect, useState } from 'react';
import './Dashboard.css'; // Importamos los estilos

export const Dashboard = () => {
    const [nombreUsuario, setNombreUsuario] = useState('');

    useEffect(() => {
        // Recuperamos los datos del usuario que guardó el auth.service al hacer login
        const usuarioGuardado = localStorage.getItem('kyro_usuario');
        if (usuarioGuardado) {
            const usuario = JSON.parse(usuarioGuardado);
            setNombreUsuario(usuario.nombre || 'Administrador');
        }
    }, []);

    return (
        <div className="dashboard-container">
            
            {/* Cabecera de Bienvenida */}
            <div className="dashboard-header">
                <h1>Bienvenido, {nombreUsuario}</h1>
                <p>Resumen general del sistema Kyro</p>
            </div>

            {/* Tarjetas de Resumen (Stats) */}
            <div className="stats-grid">
                {/* Refleja las rutas: /api/piezas y /api/colecciones */}
                <div className="stat-card">
                    <span className="stat-title">Catálogo de Piezas</span>
                    <span className="stat-value">142</span>
                    <span className="stat-desc desc-positive">Distribuidas en 8 colecciones</span>
                </div>

                {/* Refleja las rutas: /api/materiales, /api/metales y /api/proveedores */}
                <div className="stat-card">
                    <span className="stat-title">Materiales y Metales</span>
                    <span className="stat-value">85</span>
                    <span className="stat-desc">Suministrados por 4 proveedores</span>
                </div>

                {/* Refleja las rutas: /api/gastos y /api/configuracion-margenes */}
                <div className="stat-card">
                    <span className="stat-title">Gastos Operativos (Mes)</span>
                    <span className="stat-value">$12,450</span>
                    <span className="stat-desc desc-warning">Márgenes de ganancia actualizados</span>
                </div>
            </div>

            {/* Área extra para el futuro (Gráficas o Accesos directos) */}
            <div className="quick-actions">
                <h2>Actividad Reciente</h2>
                <p style={{ color: 'var(--color-text-secondary)' }}>
                    Aquí colocaremos la tabla con los últimos movimientos del inventario...
                </p>
            </div>

        </div>
    );
};