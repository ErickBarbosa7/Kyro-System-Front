// src/App.tsx
import { BrowserRouter } from 'react-router-dom';
import { AppRouter } from './router/AppRouter';
import { ToastProvider } from './providers/ToastProvider';

function App() {
    return (
        <BrowserRouter>
            {}
            <ToastProvider />
            {/* Llamamos a todas tus rutas */}
            <AppRouter />
            
        </BrowserRouter>
    );
}

export default App;