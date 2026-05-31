import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';
import './DashboardLayout.css'; 

export const DashboardLayout = () => {
    return (
        <div className="layout-container">
            
            {/* 1. Nuestra nueva pieza del menú */}
            <Sidebar />

            <div className="main-content">
                
                {/* 2. Nuestra nueva pieza superior */}
                <Navbar />

                {/* 3. El espacio dinámico para las pantallas */}
                <main className="content-area">
                    <Outlet /> 
                </main>

            </div>
        </div>
    );
};