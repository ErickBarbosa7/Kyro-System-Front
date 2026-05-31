import { BrowserRouter, useLocation } from 'react-router-dom';
import { ToastProvider } from './providers/ToastProvider';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { AppRouter } from './router/AppRouter';
import './App.css'; 

const LayoutWrapper = () => {
    const location = useLocation();
    
    // 2. Definimos las rutas donde NO queremos ver los menús
    const rutasSinMenu = ['/login', '/registro', '/']; 
    const ocultarMenu = rutasSinMenu.includes(location.pathname);

    if (ocultarMenu) {
        return (
            <div className="kyro-auth-layout">
                <AppRouter />
            </div>
        );
    }

    // 4. Si estamos en el sistema (rutas privadas), retornamos el diseño completo con Sidebar y Navbar
    return (
        <div className="kyro-app-layout">
            <Navbar />
            <div className="kyro-content-wrapper">
                <Sidebar />
                <main className="kyro-main-content">
                    <AppRouter />
                </main>
            </div>
        </div>
    );
};

function App() {
    return (
        <BrowserRouter>
            <ToastProvider />
            {/* Llamamos a nuestro nuevo Wrapper aquí adentro */}
            <LayoutWrapper />
        </BrowserRouter>
    );
}

export default App;