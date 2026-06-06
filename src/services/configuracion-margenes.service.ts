import kyroApi from '../api/kyroApi';

export interface ConfiguracionMargen {
    id: string;
    nombre: string;
    margenTaller: number;
    margenMayorista: number;
    margenPublico: number;
    descuentoMaximo?: number; 
    activo: boolean;
}

// 2. Definimos lo que enviamos al crear/editar (excluimos id y activo)
export type MargenFormData = Omit<ConfiguracionMargen, 'id' | 'activo'>;

// 3. Funciones de conexión a tu backend
export const obtenerConfiguraciones = async (): Promise<ConfiguracionMargen[]> => {
    const { data } = await kyroApi.get('/configuracion-margenes');
    return data;
};

export const crearConfiguracion = async (configData: MargenFormData): Promise<ConfiguracionMargen> => {
    const { data } = await kyroApi.post('/configuracion-margenes', configData);
    return data;
};

export const actualizarConfiguracion = async (id: string, configData: Partial<MargenFormData>): Promise<ConfiguracionMargen> => {
    const { data } = await kyroApi.put(`/configuracion-margenes/${id}`, configData);
    return data;
};

export const eliminarConfiguracion = async (id: string): Promise<{ mensaje: string }> => {
    const { data } = await kyroApi.delete(`/configuracion-margenes/${id}`);
    return data;
};