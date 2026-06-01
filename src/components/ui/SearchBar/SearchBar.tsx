import { Search, X } from 'lucide-react';
import './SearchBar.css';

interface SearchBarProps {
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
}

export const SearchBar = ({ placeholder = "Buscar...", value, onChange }: SearchBarProps) => {
    return (
        <div className="search-bar-container">
            <Search size={18} className="search-icon" />
            <input
                type="text"
                className="search-input"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
            {/* Botón para limpiar la búsqueda rápido si hay texto */}
            {value && (
                <button className="clear-btn" onClick={() => onChange('')}>
                    <X size={16} />
                </button>
            )}
        </div>
    );
};