import { AlertCircle } from 'lucide-react';
import './FieldError.css';

interface FieldErrorProps {
    message?: string;
}

export const FieldError = ({ message }: FieldErrorProps) => {
    if (!message) return null;
    return (
        <span className="field-error">
            <AlertCircle size={11} />
            {message}
        </span>
    );
};
