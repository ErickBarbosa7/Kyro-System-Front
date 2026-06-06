import { useEffect, useState } from 'react';
import { Diamond, Package, CircleDollarSign, Clock, Hammer } from 'lucide-react';
import { obtenerProveedores } from './../services/proveedores.service';
import './Dashboard.css';
import { obtenerGastos } from '../services/gastos-operativos.service';

export const Dashboard = () => {
    // === ESTADOS ===
    const [nombreUsuario, setNombreUsuario] = useState('');
    const [saludo, setSaludo] = useState('Bienvenido');
    const [totalProveedores, setTotalProveedores] = useState(0);
    const [totalGastos, setTotalGastos] = useState(0);

    // === EFECTOS ===
    useEffect(() => {
        // Recuperar Usuario
        const usuarioGuardado = localStorage.getItem('kyro_usuario');
        if (usuarioGuardado) {
            const usuario = JSON.parse(usuarioGuardado);
            setNombreUsuario(usuario.nombre || 'Administrador');
        }

        // Saludo dinámico
        const horaActual = new Date().getHours();
        if (horaActual < 12) setSaludo('Buenos días');
        else if (horaActual < 19) setSaludo('Buenas tardes');
        else setSaludo('Buenas noches');

        // Cargar dato real de proveedores para la tarjeta activa
        obtenerProveedores('activos')
            .then(provs => setTotalProveedores(provs.length))
            .catch(() => console.log('Error cargando proveedores'));
        obtenerGastos()
         .then(gastos => {
             // Sumamos todos los montos de los gastos
             const suma = gastos.reduce((total: number, gasto: any) => total + Number(gasto.monto), 0);
             setTotalGastos(suma);
         })
         .catch(() => console.log('Error cargando gastos'));
    },
    
     []);

    return (
        <div className="dashboard-container">
            
            {/* Cabecera de Bienvenida */}
            <div className="dashboard-header">
                <h1>{saludo}, {nombreUsuario}</h1>
                <p>Resumen general del sistema Kyro</p>
            </div>

            {/* Tarjetas de Resumen (Stats) */}
            <div className="stats-grid">
                
                {/* 1. Catálogo de Piezas (EN PROCESO) */}
                <div className="stat-card pending-card">
                    <div className="badge-pronto"><Clock size={12} /> Pronto</div>
                    <span className="stat-title">
                        <Diamond size={18} /> Catálogo de Piezas
                    </span>
                    <span className="stat-value blur-value">142</span>
                    <span className="stat-desc">Distribuidas en 8 colecciones</span>
                </div>

                {/* 2. Proveedores y Materiales (ACTIVO / DATO REAL) */}
                <div className="stat-card active-card">
                    <span className="stat-title">
                        <Package size={18} /> Proveedores Activos
                    </span>
                    <span className="stat-value">{totalProveedores}</span>
                    <span className="stat-desc desc-positive"></span>
                </div>

                {/* 3. Gastos Operativos (EN PROCESO) */}
                <div className="stat-card active-card">
                    <span className="stat-title">
                        <CircleDollarSign size={18} /> Gastos Operativos
                    </span>
                    <span className="stat-value">${totalGastos.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                    <span className="stat-desc desc-positive"></span>
                </div>

            </div>

            {/* Área de Actividad Reciente */}
            <div className="recent-activity-section">
                <h2>Actividad Reciente</h2>
                
                {/* Placeholder de Construcción */}
                <div className="construction-box">
                    <div className="construction-icon-wrapper">
                        <Hammer size={32} className="construction-icon" />
                    </div>
                    <h3>Sección en Construcción</h3>
                    <p>
                        Aquí colocaremos la tabla con los últimos movimientos del inventario, 
                        entradas de material y actualizaciones de precios.
                    </p>
                </div>
            </div>

        </div>
    );
};