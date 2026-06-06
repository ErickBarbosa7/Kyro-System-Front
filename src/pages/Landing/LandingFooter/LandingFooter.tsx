import { Gem } from 'lucide-react';
import './LandingFooter.css';

export const LandingFooter = () => (
    <footer className="landing-footer">
        <div className="footer-inner">
            <div className="footer-brand">
                <Gem size={20} color="var(--color-primary)" />
                <span>Kyro System</span>
            </div>
            <p className="footer-copy">
                © 2026 KyroSystem · ERP especializado para la industria joyera
            </p>
        </div>
    </footer>
);