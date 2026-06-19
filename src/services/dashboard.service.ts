import kyroApi from '../api/kyroApi';

export interface ResumenDashboard {
    piezas: {
        total: number;
        activas: number;
        porColeccion: { nombre: string; total: number }[];
        porTipo: { nombre: string; total: number }[];
        ultimas: {
            id: string;
            clave: string;
            nombreComercial: string;
            fechaCreacion: string;
            tipo: { nombre: string };
            coleccion: { nombre: string };
        }[];
    };
    inventario: {
        totalMateriales: number;
        materialesBajoStock: number;
        materialesAgotados: number;
        totalMetales: number;
        metalesStockCritico: number;
        valorTotalInventario: number;
    };
    finanzas: {
        gastosAcumulados: number;
        gastosPorCategoria: Record<string, number>;
        configuracionMargenes: { nombre: string; margenTaller: number; margenMayorista: number; margenPublico: number }[];
    };
    actividadReciente: {
        id: string;
        tipoProducto: string;
        tipoMovimiento: string;
        cantidad: number;
        motivo?: string;
        fecha: string;
        usuario: { nombre: string; apellido?: string };
    }[];
}

export const obtenerResumenDashboard = async (): Promise<ResumenDashboard> => {
    const { data } = await kyroApi.get('/dashboard/resumen');
    return data;
};
