import './FilterSelect.css'; 

interface Option {
    value: string;
    label: string;
}

interface FilterSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: Option[];
}

export const FilterSelect = ({ value, onChange, options }: FilterSelectProps) => {
    return (
        <select 
            className="kyro-filter-select"
            value={value} 
            onChange={(e) => onChange(e.target.value)}
        >
            {options.map(opt => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
    );
};