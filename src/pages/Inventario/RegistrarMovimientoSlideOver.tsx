import React, { useState, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { SlideOver } from '../../components/ui/SlideOver/SlideOver';
import { ActionDropdown } from '../../components/ui/ActionDropdown/ActionDropdown';
import { FieldError } from '../../components/ui/FieldError/FieldError';
import { crearMovimiento, type CrearMovimientoData } from '../../services/stock.service';

type TipoProducto = 'MATERIAL' | 'METAL' | 'ACABADO';
type TipoMov = 'ENTRADA' | 'SALIDA' | 'AJUSTE' | 'MERMA';

interface ProductoCatalogo {
    id: string;
    nombre: string;
}

interface RegistrarMovimientoSlideOverProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    catalogoMateriales: ProductoCatalogo[];
    catalogoMetales: ProductoCatalogo[];
    catalogoAcabados: ProductoCatalogo[];
}

export const RegistrarMovimientoSlideOver: React.FC<RegistrarMovimientoSlideOverProps> = ({
    isOpen,
    onClose,
    onSuccess,
    catalogoMateriales,
    catalogoMetales,
    catalogoAcabados,
}) => {
    const [movForm, setMovForm] = useState<CrearMovimientoData>({
        tipoProducto: 'MATERIAL',
        productoId: '',
        tipoMovimiento: 'ENTRADA',
        cantidad: 0,
        motivo: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    const labelStyle = { color: 'var(--color-text)', fontWeight: 700 };
    const inputStyle = { backgroundColor: 'var(--color-background)', color: 'var(--color-text)' };

    const productosDisponibles = useMemo(() => {
        switch (movForm.tipoProducto) {
            case 'MATERIAL': return catalogoMateriales;
            case 'METAL': return catalogoMetales;
            case 'ACABADO': return catalogoAcabados;
            default: return [];
        }
    }, [movForm.tipoProducto, catalogoMateriales, catalogoMetales, catalogoAcabados]);

    const validate = (data: CrearMovimientoData): Record<string, string> => {
        const e: Record<string, string> = {};
        if (!data.productoId) e.productoId = 'Selecciona un producto';
        if (Number(data.cantidad) <= 0) e.cantidad = 'La cantidad debe ser mayor a cero';
        return e;
    };

    const resetForm = () => {
        setMovForm({ tipoProducto: 'MATERIAL', productoId: '', tipoMovimiento: 'ENTRADA', cantidad: 0, motivo: '' });
        setErrors({});
        setTouched({});
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const validationErrors = validate(movForm);
        setErrors(validationErrors);
        setTouched({ productoId: true, cantidad: true });
        if (Object.keys(validationErrors).length > 0) return;

        const loadingToast = toast.loading('Registrando movimiento...');
        try {
            await crearMovimiento(movForm);
            localStorage.setItem('kyro_last_movement', Date.now().toString());
            toast.success('Movimiento registrado', { id: loadingToast });
            resetForm();
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Error al registrar movimiento', { id: loadingToast });
        }
    };

    return (
        <SlideOver
            isOpen={isOpen}
            onClose={handleClose}
            title="Registrar Movimiento"
            width="500px"
        >
            <form onSubmit={handleSubmit} className="modal-form">
                <div className="form-group">
                    <label style={labelStyle}>Tipo de Producto *</label>
                    <ActionDropdown
                        value={movForm.tipoProducto}
                        options={[
                            { id: 'MATERIAL', nombre: 'Material' },
                            { id: 'METAL', nombre: 'Metal' },
                            { id: 'ACABADO', nombre: 'Acabado' },
                        ]}
                        onChange={(val) => {
                            setMovForm(prev => ({ ...prev, tipoProducto: val as TipoProducto, productoId: '' }));
                            setErrors(prev => ({ ...prev, productoId: '' }));
                        }}
                        placeholder="Selecciona tipo"
                    />
                </div>

                <div className={`form-group ${errors.productoId && touched.productoId ? 'form-group--error' : ''}`}>
                    <label style={labelStyle}>Producto *</label>
                    <ActionDropdown
                        value={movForm.productoId}
                        options={productosDisponibles}
                        onChange={(val) => {
                            const next = { ...movForm, productoId: val };
                            setMovForm(next);
                            if (touched.productoId) {
                                const newErrors = validate(next);
                                setErrors(prev => ({ ...prev, productoId: newErrors.productoId }));
                            }
                        }}
                        placeholder="Selecciona un producto"
                    />
                    <FieldError message={touched.productoId ? errors.productoId : undefined} />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label style={labelStyle}>Tipo de Movimiento *</label>
                        <ActionDropdown
                            value={movForm.tipoMovimiento}
                            options={[
                                { id: 'ENTRADA', nombre: 'Entrada' },
                                { id: 'SALIDA', nombre: 'Salida' },
                                { id: 'AJUSTE', nombre: 'Ajuste' },
                                { id: 'MERMA', nombre: 'Merma' },
                            ]}
                            onChange={(val) => setMovForm(prev => ({ ...prev, tipoMovimiento: val as TipoMov }))}
                            placeholder="Selecciona movimiento"
                        />
                    </div>

                    <div className={`form-group ${errors.cantidad && touched.cantidad ? 'form-group--error' : ''}`}>
                        <label style={labelStyle}>Cantidad *</label>
                        <input
                            style={inputStyle}
                            type="number"
                            name="cantidad"
                            value={movForm.cantidad}
                            onChange={(e) => {
                                const next = { ...movForm, cantidad: Number(e.target.value) };
                                setMovForm(next);
                                if (touched.cantidad) {
                                    const newErrors = validate(next);
                                    setErrors(prev => ({ ...prev, cantidad: newErrors.cantidad }));
                                }
                            }}
                            onBlur={() => {
                                setTouched(prev => ({ ...prev, cantidad: true }));
                                const newErrors = validate(movForm);
                                setErrors(prev => ({ ...prev, cantidad: newErrors.cantidad }));
                            }}
                            step="0.01"
                            min="0.01"
                            required
                        />
                        <FieldError message={touched.cantidad ? errors.cantidad : undefined} />
                    </div>
                </div>

                <div className="form-group">
                    <label style={labelStyle}>Motivo (Opcional)</label>
                    <textarea
                        style={inputStyle}
                        value={movForm.motivo}
                        onChange={(e) => setMovForm(prev => ({ ...prev, motivo: e.target.value }))}
                        placeholder="Razón del movimiento..."
                        rows={2}
                    />
                </div>

                <div className="slideover-actions">
                    <button type="button" className="btn-secondary" onClick={handleClose}>Cancelar</button>
                    <button type="submit" className="btn-primary">Registrar Movimiento</button>
                </div>
            </form>
        </SlideOver>
    );
};
