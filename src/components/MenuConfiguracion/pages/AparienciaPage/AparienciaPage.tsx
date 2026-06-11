import { useState, useEffect } from 'react';
import { Palette, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import './AparienciaPage.css';

const THEMES = [
    { id: 'terracota', nombre: 'Terracota Original', color: '#A64D3F', bg: '#F6F2EB', descripcion: 'El tono arenoso, cálido y clásico de Kyro' },
    { id: 'oscuro', nombre: 'Modo Oscuro', color: '#E07A5F', bg: '#121212', descripcion: 'Interfaz oscura para reducir la fatiga visual' },
    { id: 'perla', nombre: 'Perla', color: '#5F6368', bg: '#FCFCFD', descripcion: 'Minimalista, limpio y diseñado para largas jornadas de trabajo'},
    { id: 'medianoche',nombre: 'Olivo Premium', color: '#575E55', bg: '#FFFBF5', descripcion: 'Natural, equilibrado y enfocado en productividad'},
];

export const AparienciaPage = () => {
    // Si no hay tema guardado, asumimos 'terracota'
    const [activeTheme, setActiveTheme] = useState('terracota');

    useEffect(() => {
        const savedTheme = localStorage.getItem('kyro_theme_id');
        if (savedTheme) {
            setActiveTheme(savedTheme);
        } else {
            // Si el html no tiene atributo, forzamos el terracota al cargar
            document.documentElement.removeAttribute('data-theme');
        }
    }, []);

    const handleThemeChange = (themeId: string) => {
        setActiveTheme(themeId);
        
        if (themeId === 'terracota') {
             // El terracota es el :root base, así que quitamos el atributo
             document.documentElement.removeAttribute('data-theme');
        } else {
             document.documentElement.setAttribute('data-theme', themeId);
        }
        
        localStorage.setItem('kyro_theme_id', themeId);
        toast.success('Tema actualizado correctamente');
    };

    return (
        <section className="config-section">
            <div className="section-title">
                <h2>Apariencia</h2>
                <p>Personaliza los colores y la interfaz de tu espacio de trabajo.</p>
            </div>

            <div className="appearance-container">
                <div className="appearance-header">
                    <Palette size={20} className="appearance-icon" />
                    <h3>Tema de la Aplicación</h3>
                </div>
                <p className="appearance-desc">
                    Elige el estilo visual de tu entorno. El tema se aplicará automáticamente en todos tus dispositivos.
                </p>

                <div className="modern-theme-grid">
                    {THEMES.map((theme) => {
                        const isActive = activeTheme === theme.id;
                        return (
                            <button 
                                key={theme.id}
                                type="button"
                                className={`modern-theme-card ${isActive ? 'active' : ''}`}
                                onClick={() => handleThemeChange(theme.id)}
                            >
                                {/* Vista previa visual (Mini UI) */}
                                <div className="theme-visual-preview" style={{ backgroundColor: theme.bg }}>
                                    <div className="preview-navbar">
                                        <div className="preview-dot" style={{ backgroundColor: theme.color }}></div>
                                        <div className="preview-line"></div>
                                    </div>
                                    <div className="preview-body">
                                        <div className="preview-sidebar"></div>
                                        <div className="preview-content">
                                            <div className="preview-card"></div>
                                            <div className="preview-card"></div>
                                        </div>
                                    </div>
                                    {/* Indicador de seleccionado */}
                                    <div className={`check-indicator ${isActive ? 'visible' : ''}`} style={{ backgroundColor: theme.color }}>
                                        <Check size={14} color="white" strokeWidth={3} />
                                    </div>
                                </div>
                                
                                {/* Información del Tema */}
                                <div className="theme-info-modern">
                                    <div className="theme-name-row">
                                        <div className="theme-color-dot" style={{ backgroundColor: theme.color }}></div>
                                        <h4>{theme.nombre}</h4>
                                    </div>
                                    <span>{theme.descripcion}</span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};