import kyroApi from '../api/kyroApi';

export interface TipoPiezaData {
    id?: string;
    nombre: string;
    codigo: string;
    activo?: boolean;
}

export const obtenerTiposPieza = async (estado?: string) => {
    const params = estado ? `?estado=${estado}` : '';
    const { data } = await kyroApi.get(`/tipos-pieza${params}`);
    return data;
};

export const crearTipoPieza = async (datos: { nombre: string; codigo: string }) => {
    const { data } = await kyroApi.post('/tipos-pieza', datos);
    return data;
};

export const actualizarTipoPieza = async (id: string, datos: { nombre: string; codigo: string }) => {
    const { data } = await kyroApi.put(`/tipos-pieza/${id}`, datos);
    return data;
};

export const eliminarTipoPieza = async (id: string) => {
    const { data } = await kyroApi.delete(`/tipos-pieza/${id}`);
    return data;
};
