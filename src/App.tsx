import { BrowserRouter } from 'react-router-dom';
import { ToastProvider } from './providers/ToastProvider';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { AppRouter } from './router/AppRouter';
import './App.css'; 

function App() {
    return (
        <BrowserRouter>
            <ToastProvider />
            
            {/* Nuevo diseño en columnas (Vertical) */}
            <div className="kyro-app-layout">
                
                {/* 1. Navbar domina toda la parte superior */}
                <Navbar />
                
                {/* 2. El "piso" de abajo donde conviven Sidebar y Dashboard */}
                <div className="kyro-content-wrapper">
                    <Sidebar />
                    
                    <main className="kyro-main-content">
                        <AppRouter />
                    </main>
                </div>

            </div>
            
        </BrowserRouter>
    );
}

export default App;