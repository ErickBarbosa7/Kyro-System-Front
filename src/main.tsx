import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/variables.css';
import App from './App.tsx'
import "./styles/variables.css";

const temaGuardado = localStorage.getItem('kyro_theme_id');
if (temaGuardado) {
    document.documentElement.setAttribute('data-theme', temaGuardado);
}

createRoot(document.getElementById('root')!).render(
  
  <StrictMode>
    <App />
  </StrictMode>,
)
