import kyroApi from '../api/kyroApi';

export interface AcabadoData {
    nombre: string;
    descripcion?: string;
    tipoCobro: 'FIJO' | 'POR_PIEZA' | 'POR_GRAMO' | 'POR_LOTE';
    costoBase: number;
    proveedorId?: string | number | null;
    activo?: boolean;
}

export type UpdateAcabadoData = Partial<AcabadoData>;

export const obtenerAcabados = async (estado: string = 'activos') => {
    const { data } = await kyroApi.get('/acabados', { params: { estado } });
    return data;
};

export const crearAcabado = async (datosAcabado: AcabadoData) => {
    const { data } = await kyroApi.post('/acabados', datosAcabado);
    return data;
};

export const actualizarAcabado = async (id: string | number, datosAcabado: UpdateAcabadoData) => {
    const { data } = await kyroApi.put(`/acabados/${id}`, datosAcabado);
    return data;
};

export const eliminarAcabado = async (id: string | number) => {
    const { data } = await kyroApi.delete(`/acabados/${id}`);
    return data;
};

export const reactivarAcabado = async (id: string | number) => {
    const { data } = await kyroApi.put(`/acabados/${id}/reactivar`);
    return data;
};