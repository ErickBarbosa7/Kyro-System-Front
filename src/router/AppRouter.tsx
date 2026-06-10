import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from '../pages/auth/Login';
import { Dashboard } from '../pages/Dashboard';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Metales } from '../pages/Metales/Metales';
import { Acabados } from '../pages/Acabados/Acabados';
import { Colecciones } from '../pages/Colecciones/Colecciones';
import { Proveedores } from '../pages/Proveedores/Proveedores';
import { Materiales } from '../pages/Materiales/Materiales';
import { Piezas } from '../pages/Piezas/Piezas';
import { Costeo } from '../pages/Costeo/Costeo';
import { Stock } from '../pages/Stock/Stock';
import { GastosOperativos } from '../pages/GastosOperativos/GastosOperativos';
import { ConfiguracionMargenes } from '../pages/ConfiguracionMargenes/ConfiguracionMargenes';
import { Registrar } from '../pages/auth/Registrar';
import { LandingPage } from '../pages/Landing/LandingPage/LandingPage';
import { SettingsLayout } from '../components/Configuracion/Layout/SettingsLayout';
import { ProfilePage } from '../components/Configuracion/pages/ProfilePage';
import { AparienciaPage } from '../components/Configuracion/pages/AparienciaPage/AparienciaPage';

export const AppRouter = () => {
    return (
        <Routes>
            {/* RUTAS PÚBLICAS */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/registrar" element={<Registrar />} />

            {/* RUTAS PRIVADAS */}
            <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />

                {/* Catálogos */}
                <Route path="/proveedores" element={<Proveedores />} />
                <Route path="/materiales" element={<Materiales />} />
                <Route path="/metales" element={<Metales />} />
                <Route path="/acabados" element={<Acabados />} />

                {/* Producción */}
                <Route path="/colecciones" element={<Colecciones />} />
                <Route path="/piezas" element={<Piezas />} />
                <Route path="/costeo" element={<Costeo />} />

                {/* Inventario */}
                <Route path="/stock" element={<Stock />} />

                {/* Finanzas */}
                <Route path="/gastos" element={<GastosOperativos />} />
                <Route path="/margenes" element={<ConfiguracionMargenes />} />

                {/* Cuenta */}
                <Route element={<SettingsLayout />}>
                    <Route path="/perfil" element={<ProfilePage />} />
                    <Route path="/configuracion" element={<ProfilePage />} /> {/* O una vista general */}
                    <Route path="/configuracion/apariencia" element={<AparienciaPage />} />
                </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};