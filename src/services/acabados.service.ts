import kyroApi from '../api/kyroApi';

// Interfaz para el catálogo de Acabados
export interface AcabadoData {
    nombre: string;
    descripcion?: string;
    costoAdicional: number; // Costo extra que suma el acabado
    proveedorId?: string | number | null; 
    activo?: boolean;
}

export type UpdateAcabadoData = Partial<AcabadoData>;

// ENDPOINTS DE ACABADOS

export const obtenerAcabados = async () => {
    const { data } = await kyroApi.get('/acabados');
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