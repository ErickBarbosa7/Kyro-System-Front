export interface DraftMetal {
    metalId: string;
    nombre: string;
    pesoUtilizadoGr: number;
    precioGramoSnapshot: number;
    subtotal: number;
}

export interface DraftMaterial {
    materialId: string;
    nombre: string;
    cantidadUtilizada: number;
    costoUnitarioSnapshot: number;
    subtotal: number;
}

export interface DraftAcabado {
    acabadoId: string;
    nombre: string;
    cantidad: number;
    costoUnitarioSnapshot: number;
    subtotal: number;
}

export interface DraftManoObra {
    actividad: string;
    tiempoHrs: number;
    costoPorHora: number;
    subtotal: number;
}

export interface PiezaDraft {
    clave: string;
    nombreComercial: string;
    tipoId: string;
    coleccionId: string;
    descripcion: string;
    pesoTotal: number | '';
    tiempoFabricacionHrs: number | '';
    imagenUrl: string;
    metales: DraftMetal[];
    materiales: DraftMaterial[];
    acabados: DraftAcabado[];
    manoObra: DraftManoObra[];
}

export interface PiezaSummary {
    id: string;
    clave: string;
    nombreComercial: string;
    estado: string;
    imagenUrl?: string;
    tipo?: { nombre: string };
    coleccion?: { nombre: string };
    fechaCreacion: string;
    pesoTotal?: number;
    tiempoFabricacionHrs?: number;
    descripcion?: string;
}

export interface MargenConfig {
    id?: string;
    nombre: string;
    margenTaller: number;
    margenMayorista: number;
    margenPublico: number;
    activo?: boolean;
}

export interface CosteoBreakdown {
    totalMetales: number;
    totalMateriales: number;
    totalAcabados: number;
    totalManoObra: number;
    costeDirecto: number;
    costeTotal: number;
    margen: {
        nombre: string;
        margenTaller: number;
        margenMayorista: number;
        margenPublico: number;
        precioTaller: number;
        precioMayorista: number;
        precioPublico: number;
    } | null;
    items: {
        metales: DraftMetal[];
        materiales: DraftMaterial[];
        acabados: DraftAcabado[];
        manoObra: DraftManoObra[];
    };
}

export interface PiezaFullData {
    id: string;
    clave: string;
    nombreComercial: string;
    estado: string;
    descripcion?: string;
    pesoTotal?: number;
    tiempoFabricacionHrs?: number;
    imagenUrl?: string;
    fechaCreacion: string;
    tipo: { id: string; nombre: string };
    coleccion: { id: string; nombre: string };
    costeoMetales: (DraftMetal & { id: string; metal: { nombre: string } })[];
    costeoMateriales: (DraftMaterial & { id: string; material: { nombre: string } })[];
    costeoAcabados: (DraftAcabado & { id: string; acabado: { nombre: string } })[];
    costeoManoObra: (DraftManoObra & { id: string })[];
}

export interface CatalogOption {
    id: string;
    nombre: string;
    [key: string]: any;
}
