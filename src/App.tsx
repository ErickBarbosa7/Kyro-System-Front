import { BrowserRouter, useLocation } from 'react-router-dom';
import { ToastProvider } from './providers/ToastProvider';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { AppRouter } from './router/AppRouter';
import './App.css'; 

const LayoutWrapper = () => {
    const location = useLocation();
    
    const rutasSinMenu = ['/login', '/registrar', '/']; 
    const ocultarMenu = rutasSinMenu.includes(location.pathname);

    if (ocultarMenu) {
        return (
            <div className="kyro-auth-layout">
                <AppRouter />
            </div>
        );
    }

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
            <LayoutWrapper />
        </BrowserRouter>
    );
}

export default App;