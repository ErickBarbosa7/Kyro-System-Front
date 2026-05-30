import axios from 'axios';

// 1. Creamos la instancia base apuntando a tu backend
const kyroApi = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

// 2. Interceptor de Peticiones (Request)
kyroApi.interceptors.request.use(
    (config) => {
        // Buscamos el token donde lo hayas guardado al hacer Login
        const token = localStorage.getItem('kyro_token');
        
        if (token) {
            // Si hay token, se lo pegamos al header de la petición
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default kyroApi;