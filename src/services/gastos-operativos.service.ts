import kyroApi from '../api/kyroApi';

export interface GastoOperativo {
    id: string;
    concepto: string;
    monto: number;
    categoria: string;
    periodicidad: 'SEMANAL' | 'MENSUAL' | 'ANUAL' | 'UNICA';
    fecha: string;
    observaciones?: string;
    activo: boolean;
}

export type GastoFormData = Omit<GastoOperativo, 'id' | 'activo'>;

export const obtenerGastos = async (estado: string = 'activos'): Promise<GastoOperativo[]> => {
    const { data } = await kyroApi.get('/gastos-operativos', { params: { estado } });
    return data;
};

export const crearGasto = async (gastoData: GastoFormData): Promise<GastoOperativo> => {
    const { data } = await kyroApi.post('/gastos-operativos', gastoData);
    return data;
};

export const actualizarGasto = async (id: string, gastoData: Partial<GastoFormData>): Promise<GastoOperativo> => {
    const { data } = await kyroApi.put(`/gastos-operativos/${id}`, gastoData);
    return data;
};

export const eliminarGasto = async (id: string): Promise<{ mensaje: string }> => {
    const { data } = await kyroApi.delete(`/gastos-operativos/${id}`);
    return data;
};

export const reactivarGasto = async (id: string): Promise<{ mensaje: string }> => {
    const { data } = await kyroApi.put(`/gastos-operativos/${id}/reactivar`);
    return data;
};
