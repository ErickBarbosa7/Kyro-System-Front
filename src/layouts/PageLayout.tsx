import React from 'react';
import './PageLayout.css';

interface PageLayoutProps {
    title: string;
    icon: React.ReactNode;
    description?: string;
    actions?: React.ReactNode;
    children: React.ReactNode;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
    title,
    icon,
    description,
    actions,
    children
}) => {
    return (
        <div className="page-layout">
            <header className="page-layout-header">
                <div>
                    <div className="page-layout-title-row">
                        <span className="page-layout-icon">{icon}</span>
                        <h2 className="page-layout-title">{title}</h2>
                    </div>
                    {description && <p className="page-layout-desc">{description}</p>}
                </div>
                {actions && <div className="page-layout-actions">{actions}</div>}
            </header>
            <section className="page-layout-body">
                {children}
            </section>
        </div>
    );
};
