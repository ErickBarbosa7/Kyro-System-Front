import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Save, Building2, Settings } from 'lucide-react';
import { obtenerEmpresa, guardarEmpresa, type EmpresaData, defaultEmpresa } from '../../../../services/empresa.service';
import './ConfigGeneralPage.css';

const PREFERENCES_KEY = 'kyro_preferences';

interface Preferences {
    moneda: string;
    formatoFecha: string;
    formatoHora: string;
    umbralStockMinimo: number;
}

const defaultPreferences: Preferences = {
    moneda: 'MXN',
    formatoFecha: 'DD/MM/YYYY',
    formatoHora: '24h',
    umbralStockMinimo: 10,
};

const loadPreferences = (): Preferences => {
    try {
        const raw = localStorage.getItem(PREFERENCES_KEY);
        return raw ? { ...defaultPreferences, ...JSON.parse(raw) } : { ...defaultPreferences };
    } catch {
        return { ...defaultPreferences };
    }
};

const savePreferences = (data: Preferences) => {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('kyro:preferences-changed', { detail: data }));
};

export const ConfigGeneralPage = () => {
    const [empresa, setEmpresa] = useState<EmpresaData>({ ...defaultEmpresa });
    const [preferences, setPreferences] = useState<Preferences>(loadPreferences());
    const [loadingEmpresa, setLoadingEmpresa] = useState(false);

    useEffect(() => {
        cargarEmpresa();
    }, []);

    const cargarEmpresa = async () => {
        setLoadingEmpresa(true);
        try {
            const data = await obtenerEmpresa();
            setEmpresa(data);
        } catch {
            toast.error('Error al cargar datos de la empresa');
        } finally {
            setLoadingEmpresa(false);
        }
    };

    const handleEmpresaSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingEmpresa(true);
        try {
            const saved = await guardarEmpresa(empresa);
            setEmpresa(saved);
            window.dispatchEvent(new CustomEvent('kyro:empresa-changed', { detail: saved }));
            toast.success('Empresa guardada correctamente');
        } catch {
            toast.error('Error al guardar empresa');
        } finally {
            setLoadingEmpresa(false);
        }
    };

    const handlePreferencesSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        savePreferences(preferences);
        toast.success('Preferencias guardadas');
    };

    const inputStyle = { backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' };

    return (
        <section className="config-section">
            <div className="section-title">
                <h2>Configuración General</h2>
                <p>Administra la información de tu empresa y las preferencias del sistema.</p>
            </div>

            {/* ── Empresa ── */}
            <form onSubmit={handleEmpresaSubmit} className="config-card">
                <h3 className="config-card-title">
                    <Building2 size={18} style={{ marginRight: 8, verticalAlign: -2 }} />
                    Información de la Empresa
                </h3>
                <p className="config-card-desc">Estos datos se mostrarán en la barra lateral y en los documentos del sistema.</p>

                <div className="form-group">
                    <label>Nombre de la empresa</label>
                    <input
                        style={inputStyle}
                        type="text"
                        value={empresa.nombre}
                        onChange={(e) => setEmpresa(p => ({ ...p, nombre: e.target.value }))}
                        placeholder="Ej. Joyería El Sol"
                        required
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>RFC</label>
                        <input
                            style={inputStyle}
                            type="text"
                            value={empresa.rfc}
                            onChange={(e) => setEmpresa(p => ({ ...p, rfc: e.target.value }))}
                            placeholder="RFC de la empresa"
                        />
                    </div>
                    <div className="form-group">
                        <label>Teléfono</label>
                        <input
                            style={inputStyle}
                            type="text"
                            value={empresa.telefono}
                            onChange={(e) => setEmpresa(p => ({ ...p, telefono: e.target.value }))}
                            placeholder="+52 55 1234 5678"
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>Email de contacto</label>
                    <input
                        style={inputStyle}
                        type="email"
                        value={empresa.email}
                        onChange={(e) => setEmpresa(p => ({ ...p, email: e.target.value }))}
                        placeholder="contacto@empresa.com"
                    />
                </div>

                <div className="form-group">
                    <label>Dirección</label>
                    <textarea
                        style={inputStyle}
                        value={empresa.direccion}
                        onChange={(e) => setEmpresa(p => ({ ...p, direccion: e.target.value }))}
                        placeholder="Calle, número, colonia, ciudad, estado, CP"
                    />
                </div>

                <div className="form-group">
                    <label>Logo URL</label>
                    <input
                        style={inputStyle}
                        type="text"
                        value={empresa.logoUrl}
                        onChange={(e) => setEmpresa(p => ({ ...p, logoUrl: e.target.value }))}
                        placeholder="https://ejemplo.com/logo.png"
                    />
                    {empresa.logoUrl && (
                        <div style={{ marginTop: 8 }}>
                            <img
                                src={empresa.logoUrl}
                                alt="Preview logo"
                                style={{ height: 40, borderRadius: 8, border: '1px solid var(--color-border)' }}
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                        </div>
                    )}
                </div>

                <button type="submit" className="config-save-btn" disabled={loadingEmpresa}>
                    <Save size={16} />
                    {loadingEmpresa ? 'Guardando...' : 'Guardar Empresa'}
                </button>
            </form>

            {/* ── Preferencias ── */}
            <form onSubmit={handlePreferencesSubmit} className="config-card">
                <h3 className="config-card-title">
                    <Settings size={18} style={{ marginRight: 8, verticalAlign: -2 }} />
                    Preferencias del Sistema
                </h3>
                <p className="config-card-desc">Configura la moneda, formatos de fecha/hora y umbrales de inventario.</p>

                <div className="form-row">
                    <div className="form-group">
                        <label>Moneda predeterminada</label>
                        <select
                            value={preferences.moneda}
                            onChange={(e) => setPreferences(p => ({ ...p, moneda: e.target.value }))}
                        >
                            <option value="MXN">MXN ($) — Peso Mexicano</option>
                            <option value="USD">USD ($) — Dólar Americano</option>
                            <option value="EUR">EUR (€) — Euro</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Formato de fecha</label>
                        <select
                            value={preferences.formatoFecha}
                            onChange={(e) => setPreferences(p => ({ ...p, formatoFecha: e.target.value }))}
                        >
                            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        </select>
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Formato de hora</label>
                        <select
                            value={preferences.formatoHora}
                            onChange={(e) => setPreferences(p => ({ ...p, formatoHora: e.target.value }))}
                        >
                            <option value="24h">24 horas</option>
                            <option value="12h">12 horas (AM/PM)</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Umbral mínimo de stock</label>
                        <input
                            style={inputStyle}
                            type="number"
                            value={preferences.umbralStockMinimo}
                            onChange={(e) => setPreferences(p => ({ ...p, umbralStockMinimo: Number(e.target.value) }))}
                            min="1"
                            required
                        />
                    </div>
                </div>

                <button type="submit" className="config-save-btn">
                    <Save size={16} />
                    Guardar Preferencias
                </button>
            </form>
        </section>
    );
};
