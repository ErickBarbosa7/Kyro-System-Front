import kyroApi from '../api/kyroApi';

export interface TipoPiezaData {
    id?: string;
    nombre: string;
    codigo: string;
    activo?: boolean;
}

export const obtenerTiposPieza = async () => {
    const { data } = await kyroApi.get('/tipos-pieza');
    return data;
};

export const crearTipoPieza = async (datos: { nombre: string; codigo: string }) => {
    const { data } = await kyroApi.post('/tipos-pieza', datos);
    return data;
};
