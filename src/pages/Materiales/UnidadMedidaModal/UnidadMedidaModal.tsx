import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Modal } from '../../../components/ui/Modal/Modal';
import { crearUnidad, actualizarUnidad } from '../../../services/unidades-medida.service';

import './UnidadMedidaModal.css';
interface UnidadMedidaModalProps {
    isOpen: boolean;
    onClose: () => void;
    // Esta función le avisará a Materiales.tsx que ya guardó y le pasará el ID nuevo
    onSuccess: (nuevoId?: string) => void; 
    unidadAEditar?: { id: string; nombre: string } | null;
}

export const UnidadMedidaModal: React.FC<UnidadMedidaModalProps> = ({
    isOpen, 
    onClose, 
    onSuccess, 
    unidadAEditar
}) => {
    const [nombre, setNombre] = useState('');

    // Si abrimos el modal para editar, llenamos el input. Si es nuevo, lo limpiamos.
    useEffect(() => {
        if (unidadAEditar) {
            setNombre(unidadAEditar.nombre);
        } else {
            setNombre('');
        }
    }, [unidadAEditar, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nombre.trim()) return toast.error('El nombre es obligatorio');

        const loadingToast = toast.loading('Guardando...');
        try {
            if (unidadAEditar) {
                await actualizarUnidad(unidadAEditar.id, { nombre: nombre.toUpperCase() });
                toast.success('Unidad actualizada', { id: loadingToast });
                onSuccess(); // Solo refrescamos la lista
            } else {
                const nuevaUnidad = await crearUnidad({ nombre: nombre.toUpperCase() });
                toast.success('Unidad creada', { id: loadingToast });
                onSuccess(nuevaUnidad.id); // Pasamos el ID para autoseleccionarlo en el formulario
            }
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Error al guardar la unidad', { id: loadingToast });
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={unidadAEditar ? 'Editar Unidad de Medida' : 'Nueva Unidad de Medida'}
            maxWidth="400px"
            zIndex={1002} // Para asegurarnos de que quede por encima del modal de materiales
        >
            <form onSubmit={handleSubmit} className="modal-form">
                <div className="form-group">
                    <label>Nombre de la Unidad *</label>
                    <input
                        type="text"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        placeholder="Ej. PIEZA CH, GRAMO, TIRA"
                        autoFocus
                        required
                    />
                </div>
                <div className="modal-footer">
                    <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
                    <button type="submit" className="btn-primary">Guardar</button>
                </div>
            </form>
        </Modal>
    );
};