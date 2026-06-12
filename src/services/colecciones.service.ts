import kyroApi from '../api/kyroApi';

export interface ColeccionData {
    id?: string;
    nombre: string;
    codigo: string;
    descripcion?: string;
    activa?: boolean; 
}

export type UpdateColeccionData = Partial<ColeccionData>;

// ENDPOINTS DE COLECCIONES

export const obtenerColecciones = async (estado: 'activos' | 'inactivos' | 'todos' = 'activos') => {
    const { data } = await kyroApi.get(`/colecciones?estado=${estado}`);
    return data;
};

export const obtenerColeccionPorId = async (id: string | number) => {
    const { data } = await kyroApi.get(`/colecciones/${id}`);
    return data;
};

export const crearColeccion = async (datosColeccion: ColeccionData) => {
    const { data } = await kyroApi.post('/colecciones', datosColeccion);
    return data;
};

export const actualizarColeccion = async (id: string | number, datosColeccion: UpdateColeccionData) => {
    const { data } = await kyroApi.put(`/colecciones/${id}`, datosColeccion);
    return data;
};

export const eliminarColeccion = async (id: string | number) => {
    const { data } = await kyroApi.delete(`/colecciones/${id}`);
    return data;
};

export const reactivarColeccion = async (id: string | number) => {
    const { data } = await kyroApi.put(`/colecciones/${id}/reactivar`);
    return data;
};