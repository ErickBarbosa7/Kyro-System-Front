import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';

function App() {
    return (
        // BrowserRouter es el contenedor que habilita la navegación en toda la app
        <BrowserRouter>
            <Routes>
                {/* Ruta 1: La pantalla de Login */}
                <Route path="/login" element={<Login />} />

                {/* Ruta 2: El Panel Principal */}
                <Route path="/dashboard" element={<Dashboard />} />

                {/* Ruta Comodín: Si alguien entra a la raíz '/', lo mandamos al login */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;