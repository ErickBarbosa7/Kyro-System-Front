import kyroApi from '../api/kyroApi';

export interface PiezaData {
    tipoId: string;
    coleccionId: string;
    clave: string;
    nombreComercial: string;
    estado?: 'ACTIVO' | 'BORRADOR' | 'DESCONTINUADO';
    descripcion?: string;
    pesoTotal?: number;
    tiempoFabricacionHrs?: number;
    imagenUrl?: string;
}

export type UpdatePiezaData = Partial<PiezaData>;

export const obtenerPiezas = async (estado: string = 'activos') => {
    const { data } = await kyroApi.get('/piezas', { params: { estado } });
    return data;
};

export const obtenerPiezaPorId = async (id: string) => {
    const { data } = await kyroApi.get(`/piezas/${id}`);
    return data;
};

export const crearPieza = async (datosPieza: PiezaData) => {
    const { data } = await kyroApi.post('/piezas', datosPieza);
    return data;
};

export const actualizarPieza = async (id: string, datosPieza: UpdatePiezaData) => {
    const { data } = await kyroApi.put(`/piezas/${id}`, datosPieza);
    return data;
};

export const eliminarPieza = async (id: string) => {
    const { data } = await kyroApi.delete(`/piezas/${id}`);
    return data;
};

export const reactivarPieza = async (id: string) => {
    const { data } = await kyroApi.put(`/piezas/${id}/reactivar`);
    return data;
};

export interface PiezaCompletaData {
    tipoId: string;
    coleccionId: string;
    clave: string;
    nombreComercial: string;
    estado?: string;
    descripcion?: string;
    pesoTotal?: number;
    tiempoFabricacionHrs?: number;
    imagenUrl?: string;
    metales: { metalId: string; pesoUtilizadoGr: number }[];
    materiales: { materialId: string; cantidadUtilizada: number }[];
    acabados: { acabadoId: string; cantidad: number }[];
    manoObra: { actividad: string; tiempoHrs: number; costoPorHora: number }[];
}

export const crearPiezaCompleta = async (datos: PiezaCompletaData) => {
    const { data } = await kyroApi.post('/piezas', datos);
    return data;
};

export const actualizarPiezaCompleta = async (id: string, datos: PiezaCompletaData) => {
    const { data } = await kyroApi.put(`/piezas/${id}/completa`, datos);
    return data;
};
