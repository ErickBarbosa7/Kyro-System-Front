import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Modal } from '../../../components/ui/Modal/Modal';
import { crearCategoria, actualizarCategoria } from '../../../services/categorias-materiales.service';
import './CategoriaModal.css';

interface CategoriaModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (nuevoId?: string) => void; 
    categoriaAEditar?: { id: string; nombre: string; descripcion?: string } | null;
}

export const CategoriaModal: React.FC<CategoriaModalProps> = ({
    isOpen, 
    onClose, 
    onSuccess, 
    categoriaAEditar
}) => {
    const [formData, setFormData] = useState({ nombre: '', descripcion: '' });

    // Cuando el modal se abre o cambia la prop de edición, reseteamos el formulario
    useEffect(() => {
        if (categoriaAEditar) {
            setFormData({
                nombre: categoriaAEditar.nombre,
                descripcion: categoriaAEditar.descripcion || ''
            });
        } else {
            setFormData({ nombre: '', descripcion: '' });
        }
    }, [categoriaAEditar, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.nombre.trim()) return toast.error('El nombre es obligatorio');

        const loadingToast = toast.loading('Guardando...');
        try {
            if (categoriaAEditar) {
                await actualizarCategoria(categoriaAEditar.id, formData);
                toast.success('Categoría actualizada', { id: loadingToast });
                onSuccess(); 
            } else {
                const nuevaCategoria = await crearCategoria(formData);
                toast.success('Categoría creada', { id: loadingToast });
                onSuccess(nuevaCategoria.id); 
            }
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Error al guardar', { id: loadingToast });
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={categoriaAEditar ? 'Editar Categoría' : 'Nueva Categoría'}
            maxWidth="400px"
            zIndex={999}
        >
            <form onSubmit={handleSubmit} className="modal-form">
                <div className="form-group">
                    <label>Nombre de la Categoría *</label>
                    <input
                        type="text"
                        value={formData.nombre}
                        onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                        placeholder="Ej. Piedras"
                        autoFocus
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Descripción (Opcional)</label>
                    <textarea
                        value={formData.descripcion}
                        onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                        placeholder="Breve detalle..."
                        rows={2}
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