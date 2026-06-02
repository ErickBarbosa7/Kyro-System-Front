import kyroApi from '../api/kyroApi';

// Interfaz completa para leer los datos (Lo que devuelve el GET)
export interface Material {
    id: string;
    proveedorId?: string | null;
    categoriaId: string;
    nombre: string;
    descripcion?: string;
    imagenUrl?: string;
    
    // Aquí recibimos el ID de la unidad y su nombre para mostrarlo en la tabla
    unidadMedidaId: string;
    unidadMedida?: { nombre: string }; 
    
    precioCompra: number;
    cantidadComprada: number;
    costoUnitario: number;       // Calculado por el backend
    stockDisponible: number;     // Asignado inicialmente por el backend
    stockMinimo: number;
    stockMaximo?: number;
    fechaCompra: string;
    activo: boolean;
    
    // Datos anidados que trae Prisma gracias al 'include'
    proveedor?: {
        nombre: string;
        telefonos?: string[]; // Por si tu backend trae los teléfonos actualizados
    };
    categoria?: {
        nombre: string;
    };
}

// Interfaz para el formulario (Lo que enviamos en el POST/PUT desde Materiales.tsx)
export interface MaterialFormData {
    nombre: string;
    categoriaId: string;
    proveedorId?: string; // Es opcional según tu controlador
    descripcion?: string;
    imagenUrl?: string;
    
    // AHORA ENVIAMOS EL ID DE LA UNIDAD DE MEDIDA EN LUGAR DEL TEXTO PLANO
    unidadMedidaId: string; 
    
    precioCompra: number;
    cantidadComprada: number;
    stockMinimo: number;
    stockMaximo?: number;
}


// Metodo para obtener todos los materiales, con opción de filtrar por estado (activos/inactivos)
export const obtenerMateriales = async (estado: string = 'activos'): Promise<Material[]> => {
    const { data } = await kyroApi.get('/materiales', { params: { estado } });
    return data;
};

// Obtiene un material específico por su ID.
export const obtenerMaterialPorId = async (id: string): Promise<Material> => {
    const { data } = await kyroApi.get(`/materiales/${id}`);
    return data;
};

// Crea un nuevo material.
export const crearMaterial = async (materialData: MaterialFormData): Promise<Material> => {
    const { data } = await kyroApi.post('/materiales', materialData);
    return data;
};

// Actualiza un material existente.
export const actualizarMaterial = async (id: string, materialData: Partial<MaterialFormData>): Promise<Material> => {
    const { data } = await kyroApi.put(`/materiales/${id}`, materialData);
    return data;
};

// Elimina un material (Soft-Delete: pasa activo a false).
export const eliminarMaterial = async (id: string): Promise<{ mensaje: string }> => {
    const { data } = await kyroApi.delete(`/materiales/${id}`);
    return data;
};

// Reactiva un material eliminado.
export const reactivarMaterial = async (id: string): Promise<Material> => {
    const { data } = await kyroApi.put(`/materiales/${id}`, { activo: true });
    return data;
};