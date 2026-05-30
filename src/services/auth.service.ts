import kyroApi from '../api/kyroApi';

// POST: Iniciar sesión
export const login = async (credenciales: { email: string; password?: string }) => {
    const { data } = await kyroApi.post('/auth/login', credenciales);
    
    if (data.token) {
        localStorage.setItem('kyro_token', data.token);
        localStorage.setItem('kyro_usuario', JSON.stringify(data.usuario));
    }
    
    return data;
};

// POST: Registrar un nuevo usuario
export const registrarUsuario = async (datosUsuario: any) => {
    const { data } = await kyroApi.post('/auth/register', datosUsuario);
    return data;
};

// Función extra: Cerrar sesión
export const logout = () => {
    localStorage.removeItem('kyro_token');
    localStorage.removeItem('kyro_usuario');
    window.location.href = '/login';
};