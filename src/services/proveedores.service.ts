import kyroApi from '../api/kyroApi';

export interface ProveedorData {
    nombre: string;
    domicilio?: string;
    telefonos?: string[];
    emails?: string[];
    paginaWeb?: string;
    redesSociales?: string;
    observaciones?: string;
    activo?: boolean;
}

export type UpdateProveedorData = Partial<ProveedorData>;

// ENDPOINTS DE PROVEEDORES

export const obtenerProveedores = async (estado: string = 'activos') => {
    const { data } = await kyroApi.get('/proveedores', { params: { estado } });
    return data;
};

export const reactivarProveedor = async (id: string | number) => {
    const { data } = await kyroApi.put(`/proveedores/${id}`, { activo: true });
    return data;
};

export const crearProveedor = async (datosProveedor: ProveedorData) => {
    const { data } = await kyroApi.post('/proveedores', datosProveedor);
    return data;
};

export const actualizarProveedor = async (id: string | number, datosProveedor: UpdateProveedorData) => {
    const { data } = await kyroApi.put(`/proveedores/${id}`, datosProveedor);
    return data;
};

export const eliminarProveedor = async (id: string | number) => {
    const { data } = await kyroApi.delete(`/proveedores/${id}`);
    return data;
};