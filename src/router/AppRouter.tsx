import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from '../pages/Login';
import { Dashboard } from '../pages/Dashboard';
import { DashboardLayout } from '../layouts/DashboardLayout'; // Importamos el Layout

export const AppRouter = () => {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />

            <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />                
            </Route>
            
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
};