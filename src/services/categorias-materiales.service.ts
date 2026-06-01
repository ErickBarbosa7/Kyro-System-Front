import kyroApi from '../api/kyroApi';

export interface CategoriaMaterial {
    id: string;
    nombre: string;
    descripcion?: string;
    activa: boolean;
}

export const obtenerCategorias = async (estado: string = 'activas'): Promise<CategoriaMaterial[]> => {
    const { data } = await kyroApi.get('/categorias-material', { params: { estado } });
    return data;
};

export const crearCategoria = async (categoriaData: Partial<CategoriaMaterial>): Promise<CategoriaMaterial> => {
    const { data } = await kyroApi.post('/categorias-material', categoriaData);
    return data;
};

export const actualizarCategoria = async (id: string, categoriaData: Partial<CategoriaMaterial>): Promise<CategoriaMaterial> => {
    const { data } = await kyroApi.put(`/categorias-material/${id}`, categoriaData);
    return data;
};

export const eliminarCategoria = async (id: string): Promise<{ mensaje: string }> => {
    const { data } = await kyroApi.delete(`/categorias-material/${id}`);
    return data;
};

export const reactivarCategoria = async (id: string): Promise<{ mensaje: string }> => {
    const { data } = await kyroApi.put(`/categorias-material/${id}/reactivar`);
    return data;
};