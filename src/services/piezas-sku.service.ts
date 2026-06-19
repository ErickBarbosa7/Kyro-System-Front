import kyroApi from '../api/kyroApi';

export interface PiezaSkuData {
    id: string;
    piezaId: string;
    sku: string;
    descripcionVariante?: string;
    activo: boolean;
}

export const obtenerSkusPorPieza = async (piezaId: string): Promise<PiezaSkuData[]> => {
    const { data } = await kyroApi.get(`/piezas-sku/${piezaId}`);
    return data;
};

export const crearSku = async (piezaId: string, datos: { sku: string; descripcionVariante?: string }) => {
    const { data } = await kyroApi.post(`/piezas-sku/${piezaId}`, datos);
    return data;
};

export const actualizarSku = async (id: string, datos: { sku?: string; descripcionVariante?: string; activo?: boolean }) => {
    const { data } = await kyroApi.put(`/piezas-sku/${id}`, datos);
    return data;
};

export const eliminarSku = async (id: string) => {
    const { data } = await kyroApi.delete(`/piezas-sku/${id}`);
    return data;
};
