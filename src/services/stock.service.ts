import kyroApi from '../api/kyroApi';

export interface MovimientoData {
    id: string;
    tipoProducto: 'MATERIAL' | 'METAL' | 'ACABADO';
    productoId: string;
    tipoMovimiento: 'ENTRADA' | 'SALIDA' | 'AJUSTE' | 'MERMA';
    cantidad: number;
    motivo?: string;
    usuarioId: string;
    usuario?: { nombre: string; apellido?: string };
    fecha: string;
}

export interface CrearMovimientoData {
    tipoProducto: 'MATERIAL' | 'METAL' | 'ACABADO';
    productoId: string;
    tipoMovimiento: 'ENTRADA' | 'SALIDA' | 'AJUSTE' | 'MERMA';
    cantidad: number;
    motivo?: string;
}

export const obtenerMovimientos = async (params?: {
    tipoProducto?: string;
    tipoMovimiento?: string;
    fechaDesde?: string;
    fechaHasta?: string;
}) => {
    const { data } = await kyroApi.get('/stock', { params });
    return data;
};

export const obtenerMovimientoPorId = async (id: string) => {
    const { data } = await kyroApi.get(`/stock/${id}`);
    return data;
};

export const crearMovimiento = async (datos: CrearMovimientoData) => {
    const { data } = await kyroApi.post('/stock', datos);
    return data;
};

export const eliminarMovimiento = async (id: string) => {
    const { data } = await kyroApi.delete(`/stock/${id}`);
    return data;
};
