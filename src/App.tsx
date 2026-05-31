// src/App.tsx
import { BrowserRouter } from 'react-router-dom';
import { AppRouter } from './router/AppRouter';

function App() {
    return (
        <BrowserRouter>
            {}
            
            {/* Llamamos a todas tus rutas */}
            <AppRouter />
            
        </BrowserRouter>
    );
}

export default App;