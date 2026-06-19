import kyroApi from '../api/kyroApi';

// Interfaz para el autocompletado en React
export interface MetalData {
    nombre: string;
    precioPorGramo: number;
    stockDisponible: number;
    stockMinimo: number;
    observaciones?: string;
    proveedorId?: string | number; 
    activo?: boolean;
}

// Interfaz para actualizar (todos los campos son opcionales)
export type UpdateMetalData = Partial<MetalData>;

// ENDPOINTS DE METALES

export const obtenerMetales = async (estado: string = 'activos') => {
    const { data } = await kyroApi.get('/metales', { params: { estado } });
    return data;
};

export const crearMetal = async (datosMetal: MetalData) => {
    const { data } = await kyroApi.post('/metales', datosMetal);
    return data;
};

export const actualizarMetal = async (id: string | number, datosMetal: UpdateMetalData) => {
    const { data } = await kyroApi.put(`/metales/${id}`, datosMetal);
    return data;
};

export const eliminarMetal = async (id: string | number) => {
    const { data } = await kyroApi.delete(`/metales/${id}`);
    return data;
};