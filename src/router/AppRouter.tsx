import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from '../pages/Login';
import { Dashboard } from '../pages/Dashboard';

export const AppRouter = () => {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Ruta comodín */}
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
};