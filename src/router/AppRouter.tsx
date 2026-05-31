import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from '../pages/auth/Login';
import { Dashboard } from '../pages/Dashboard';

import { DashboardLayout } from '../layouts/DashboardLayout'; 

import { Registrar } from '../pages/auth/Registrar';
export const AppRouter = () => {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />

            <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />                
            </Route>
            

           <Route path="/registrar" element={<Registrar />} />


            
            {/* Ruta comodín */}

            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
};