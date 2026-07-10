const STORE = sessionStorage;

const PREFIX = 'kyro_cache_';
const TTL_DEFAULT = 5 * 60 * 1000;

export const CACHE_KEYS = {
    CATALOGO_MATERIALES: 'catalogo_materiales',
    CATALOGO_METALES: 'catalogo_metales',
    CATALOGO_ACABADOS: 'catalogo_acabados',
};

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttl: number;
}

function key(k: string) { return PREFIX + k; }

export function cacheGet<T>(k: string): T | null {
    try {
        const raw = STORE.getItem(key(k));
        if (!raw) return null;
        const entry: CacheEntry<T> = JSON.parse(raw);
        if (Date.now() - entry.timestamp > entry.ttl) {
            STORE.removeItem(key(k));
            return null;
        }
        return entry.data;
    } catch {
        STORE.removeItem(key(k));
        return null;
    }
}

export function cacheSet<T>(k: string, data: T, ttl: number = TTL_DEFAULT) {
    try {
        const entry: CacheEntry<T> = { data, timestamp: Date.now(), ttl };
        STORE.setItem(key(k), JSON.stringify(entry));
    } catch {
        /* sessionStorage lleno o bloqueado — ignorar */
    }
}

export function cacheInvalidate(k: string) {
    STORE.removeItem(key(k));
}
