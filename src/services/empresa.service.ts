import kyroApi from '../api/kyroApi';

export interface EmpresaData {
    nombre: string;
    rfc: string;
    telefono: string;
    email: string;
    direccion: string;
    logoUrl: string;
}

const STORAGE_KEY = 'kyro_empresa';

export const defaultEmpresa: EmpresaData = {
    nombre: '',
    rfc: '',
    telefono: '',
    email: '',
    direccion: '',
    logoUrl: '',
};

export const obtenerEmpresa = async (): Promise<EmpresaData> => {
    try {
        const { data } = await kyroApi.get('/empresa');
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        return data;
    } catch {
        const local = localStorage.getItem(STORAGE_KEY);
        return local ? JSON.parse(local) : { ...defaultEmpresa };
    }
};

export const guardarEmpresa = async (datos: EmpresaData): Promise<EmpresaData> => {
    try {
        const { data } = await kyroApi.put('/empresa', datos);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        return data;
    } catch {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(datos));
        return datos;
    }
};

export const getEmpresaFromStorage = (): EmpresaData => {
    const local = localStorage.getItem(STORAGE_KEY);
    return local ? JSON.parse(local) : { ...defaultEmpresa };
};
