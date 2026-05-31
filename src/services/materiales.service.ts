import kyroApi from '../api/kyroApi'; // Asegúrate de que apunte a tu instancia de Axios

// ==========================================
// INTERFACES (Tipado Estricto)
// ==========================================

// Interfaz completa para leer los datos (Lo que devuelve el GET)
export interface Material {
    id: string;
    proveedorId?: string | null;
    categoriaId: string;
    nombre: string;
    descripcion?: string;
    imagenUrl?: string;
    unidadCompra: string;
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
}

// Interfaz para el formulario (Lo que enviamos en el POST/PUT)
// Omitimos campos como 'id' o 'costoUnitario' porque el backend se encarga de ellos.
export interface MaterialFormData {
    nombre: string;
    categoriaId: string;
    proveedorId?: string; // Es opcional según tu controlador
    descripcion?: string;
    imagenUrl?: string;
    unidadCompra: string; // Ej. "PIEZA", "GRAMO", "LOTE"
    precioCompra: number;
    cantidadComprada: number;
    stockMinimo: number;
    stockMaximo?: number;
}

// ==========================================
// FUNCIONES DE RED (CRUD)
// ==========================================

/**
 * Obtiene la lista de materiales.
 * Nota: Si en el futuro ajustas tu backend para soportar soft-delete como en
 * Proveedores, puedes pasar el estado ('activos', 'inactivos', 'todos') por parámetro.
 */
export const obtenerMateriales = async (estado: string = 'activos'): Promise<Material[]> => {
    const { data } = await kyroApi.get('/materiales', { params: { estado } });
    return data;
};

/**
 * Obtiene un material específico por su ID.
 */
export const obtenerMaterialPorId = async (id: string): Promise<Material> => {
    const { data } = await kyroApi.get(`/materiales/${id}`);
    return data;
};

/**
 * Crea un nuevo material.
 * El backend se encarga de calcular costoUnitario y stockDisponible.
 */
export const crearMaterial = async (materialData: MaterialFormData): Promise<Material> => {
    const { data } = await kyroApi.post('/materiales', materialData);
    return data;
};

/**
 * Actualiza un material existente.
 */
export const actualizarMaterial = async (id: string, materialData: Partial<MaterialFormData>): Promise<Material> => {
    const { data } = await kyroApi.put(`/materiales/${id}`, materialData);
    return data;
};

/**
 * Elimina un material (Soft-Delete: pasa activo a false).
 */
export const eliminarMaterial = async (id: string): Promise<{ mensaje: string }> => {
    const { data } = await kyroApi.delete(`/materiales/${id}`);
    return data;
};

/**
 * Reactiva un material eliminado.
 * Nota: Tu backend actual necesitaría soportar este endpoint,
 * puedes hacerlo reutilizando el PUT de actualizar enviando { activo: true }.
 */
export const reactivarMaterial = async (id: string): Promise<Material> => {
    const { data } = await kyroApi.put(`/materiales/${id}`, { activo: true });
    return data;
};