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
    const { data } = await kyroApi.post('/auth/registro', datosUsuario);
    return data;
};

// PUT: Actualizar perfil de usuario
export const actualizarPerfil = async (datosActualizados: { nombre?: string; apellido?: string; email?: string; passwordNuevo?: string }) => {
    // Usamos kyroApi, que (asumiendo que tiene interceptores) ya debería inyectar el token automáticamente
    const { data } = await kyroApi.put('/auth/perfil', datosActualizados);
    
    // Si la actualización fue exitosa, refrescamos los datos guardados en el navegador
    if (data.usuario) {
        localStorage.setItem('kyro_usuario', JSON.stringify(data.usuario));
    }
    
    return data;
};

// Función extra: Cerrar sesión
export const logout = () => {
    localStorage.removeItem('kyro_token');
    localStorage.removeItem('kyro_usuario');
    window.location.href = '/login';
};