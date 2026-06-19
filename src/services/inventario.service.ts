import kyroApi from '../api/kyroApi';

export interface ItemInventario {
    id: string;
    nombre: string;
    tipo: 'MATERIAL' | 'METAL';
    stockDisponible: number;
    stockMinimo: number;
    stockMaximo?: number;
    costoUnitario?: number;
    precioPorGramo?: number;
    unidadMedida?: { nombre: string };
    valorInventario: number;
    estado: 'DISPONIBLE' | 'BAJO' | 'CRITICO' | 'AGOTADO';
}

export const obtenerResumenInventario = async (tipo?: string): Promise<ItemInventario[]> => {
    const { data } = await kyroApi.get('/inventario', { params: { tipo } });
    return data;
};
