// src/providers/ToastProvider.tsx
import { Toaster } from 'react-hot-toast';

export const ToastProvider = () => {
    return (
        <Toaster 
            position="top-right"
            toastOptions={{
                style: {
                    fontFamily: 'var(--font-main)',
                    background: 'var(--color-surface)',
                    color: 'var(--color-text)',
                    border: '1px solid var(--color-border)',
                    boxShadow: 'var(--shadow-sm)',
                    borderRadius: 'var(--radius)',
                },
                success: {
                    iconTheme: {
                        primary: 'var(--color-success)',
                        secondary: '#FFFFFF',
                    },
                },
                error: {
                    iconTheme: {
                        primary: 'var(--color-danger)',
                        secondary: '#FFFFFF',
                    },
                },
            }}
        />
    );
};