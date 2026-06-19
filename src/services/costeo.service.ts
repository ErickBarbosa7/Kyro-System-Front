import kyroApi from '../api/kyroApi';

export interface CosteoMetalData {
    metalId: string;
    pesoUtilizadoGr: number;
}

export interface CosteoMaterialData {
    materialId: string;
    cantidadUtilizada: number;
}

export interface CosteoAcabadoData {
    acabadoId: string;
    cantidad: number;
}

export interface CosteoManoObraData {
    actividad: string;
    tiempoHrs: number;
    costoPorHora: number;
}

export interface CosteoGastoData {
    gastoId: string;
    importeAplicado: number;
}

export const obtenerCosteoPieza = async (piezaId: string) => {
    const { data } = await kyroApi.get(`/costeo/${piezaId}`);
    return data;
};

export const calcularTotales = async (piezaId: string) => {
    const { data } = await kyroApi.get(`/costeo/${piezaId}/totales`);
    return data;
};

export const agregarMetal = async (piezaId: string, datos: CosteoMetalData) => {
    const { data } = await kyroApi.post(`/costeo/${piezaId}/metales`, datos);
    return data;
};

export const agregarMaterial = async (piezaId: string, datos: CosteoMaterialData) => {
    const { data } = await kyroApi.post(`/costeo/${piezaId}/materiales`, datos);
    return data;
};

export const agregarAcabado = async (piezaId: string, datos: CosteoAcabadoData) => {
    const { data } = await kyroApi.post(`/costeo/${piezaId}/acabados`, datos);
    return data;
};

export const agregarManoObra = async (piezaId: string, datos: CosteoManoObraData) => {
    const { data } = await kyroApi.post(`/costeo/${piezaId}/mano-obra`, datos);
    return data;
};

export const agregarGasto = async (piezaId: string, datos: CosteoGastoData) => {
    const { data } = await kyroApi.post(`/costeo/${piezaId}/gastos`, datos);
    return data;
};

export const actualizarMetal = async (id: string, datos: Partial<CosteoMetalData>) => {
    const { data } = await kyroApi.put(`/costeo/metales/${id}`, datos);
    return data;
};

export const actualizarMaterial = async (id: string, datos: Partial<CosteoMaterialData>) => {
    const { data } = await kyroApi.put(`/costeo/materiales/${id}`, datos);
    return data;
};

export const actualizarAcabado = async (id: string, datos: Partial<CosteoAcabadoData>) => {
    const { data } = await kyroApi.put(`/costeo/acabados/${id}`, datos);
    return data;
};

export const actualizarManoObra = async (id: string, datos: Partial<CosteoManoObraData>) => {
    const { data } = await kyroApi.put(`/costeo/mano-obra/${id}`, datos);
    return data;
};

export const actualizarGasto = async (id: string, datos: Partial<CosteoGastoData>) => {
    const { data } = await kyroApi.put(`/costeo/gastos/${id}`, datos);
    return data;
};

export const eliminarMetal = async (id: string) => {
    const { data } = await kyroApi.delete(`/costeo/metales/${id}`);
    return data;
};

export const eliminarMaterial = async (id: string) => {
    const { data } = await kyroApi.delete(`/costeo/materiales/${id}`);
    return data;
};

export const eliminarAcabado = async (id: string) => {
    const { data } = await kyroApi.delete(`/costeo/acabados/${id}`);
    return data;
};

export const eliminarManoObra = async (id: string) => {
    const { data } = await kyroApi.delete(`/costeo/mano-obra/${id}`);
    return data;
};

export const eliminarGasto = async (id: string) => {
    const { data } = await kyroApi.delete(`/costeo/gastos/${id}`);
    return data;
};
