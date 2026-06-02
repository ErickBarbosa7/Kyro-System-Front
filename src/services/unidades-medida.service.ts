import kyroApi from '../api/kyroApi';

export interface UnidadMedida {
    id: string;
    nombre: string;
    activa: boolean;
}

export const obtenerUnidades = async (estado: string = 'activas'): Promise<UnidadMedida[]> => {
    const { data } = await kyroApi.get('/unidades', { params: { estado } });
    return data;
};

export const crearUnidad = async (unidad: { nombre: string }): Promise<UnidadMedida> => {
    const { data } = await kyroApi.post('/unidades', unidad);
    return data;
};

export const actualizarUnidad = async (id: string, unidad: { nombre: string }): Promise<UnidadMedida> => {
    const { data } = await kyroApi.put(`/unidades/${id}`, unidad);
    return data;
};

export const eliminarUnidad = async (id: string): Promise<{ mensaje: string }> => {
    const { data } = await kyroApi.delete(`/unidades/${id}`);
    return data;
};

export const reactivarUnidad = async (id: string): Promise<{ mensaje: string }> => {
    const { data } = await kyroApi.put(`/unidades/${id}/reactivar`);
    return data;
};