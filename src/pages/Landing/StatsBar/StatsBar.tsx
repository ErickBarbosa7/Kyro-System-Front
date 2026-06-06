import { Blocks, Gem, Tags, FileX } from 'lucide-react';
import './StatsBar.css';

const stats = [
    { icon: Blocks, value: '10+',   label: 'Módulos integrados' },
    { icon: Gem,    value: '100%',  label: 'Enfocado en joyería' },
    { icon: Tags,   value: '5',     label: 'Esquemas de precio' },
    { icon: FileX,  value: '0',     label: 'Hojas de cálculo' },
];

export const StatsBar = () => (
    <div className="stats-bar-container">
        <div className="stats-bar">
            {stats.map((s, i) => (
                <div className="stat-item" key={i}>
                    {/* Caja del ícono */}
                    <div className="stat-icon-wrapper">
                        <s.icon size={24} className="stat-icon" />
                    </div>
                    
                    {/* Textos */}
                    <div className="stat-content">
                        <span className="stat-value">{s.value}</span>
                        <span className="stat-label">{s.label}</span>
                    </div>
                </div>
            ))}
        </div>
    </div>
);