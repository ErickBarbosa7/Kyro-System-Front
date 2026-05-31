import { Outlet } from 'react-router-dom';

import './DashboardLayout.css'; 

export const DashboardLayout = () => {
    return (
        <div className="layout-container">
            
            {/* 1. Nuestra nueva pieza del menú */}
      

            <div className="main-content">
                
                {/* 2. Nuestra nueva pieza superior */}
             

                {/* 3. El espacio dinámico para las pantallas */}
                <main className="content-area">
                    <Outlet /> 
                </main>

            </div>
        </div>
    );
};