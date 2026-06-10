import { Navigate, Outlet, useLocation } from 'react-router-dom';

const getTokenPayload = (token: string): { exp?: number } | null => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(atob(base64));
    } catch {
        return null;
    }
};

const isTokenValid = (): boolean => {
    const token = localStorage.getItem('kyro_token');
    if (!token) return false;

    const payload = getTokenPayload(token);
    if (!payload?.exp) return false;

    const isExpired = Date.now() >= payload.exp * 1000;
    if (isExpired) {
        localStorage.removeItem('kyro_token');
        localStorage.removeItem('kyro_usuario');
    }
    return !isExpired;
};

interface ProtectedRouteProps {
    rolesPermitidos?: string[];
}

export const ProtectedRoute = ({ rolesPermitidos }: ProtectedRouteProps = {}) => {
    const location = useLocation();

    // 1. Validar JWT
    if (!isTokenValid()) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 2. Validar rol si se especifica
    if (rolesPermitidos) {
        const usuarioGuardado = localStorage.getItem('kyro_usuario');
        const usuario = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
        if (!usuario || !rolesPermitidos.includes(usuario.rol?.nombre)) {
            return <Navigate to="/acceso-denegado" replace />;
        }
    }

    return <Outlet />;
};