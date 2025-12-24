import type { TiqueteFruta, Empresa, Comprador } from '../types';

const API_BASE = '/api';

// Helper para manejar respuestas de la API
async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(error.error || `HTTP ${response.status}`);
    }
    return response.json();
}

// ==================== EMPRESAS ====================

export const empresasApi = {
    getAll: async (): Promise<Empresa[]> => {
        const response = await fetch(`${API_BASE}/empresas`);
        return handleResponse<Empresa[]>(response);
    },

    create: async (nombre: string): Promise<Empresa> => {
        const response = await fetch(`${API_BASE}/empresas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre }),
        });
        return handleResponse<Empresa>(response);
    },

    update: async (id: string, updates: Partial<Empresa>): Promise<Empresa> => {
        const response = await fetch(`${API_BASE}/empresas`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, ...updates }),
        });
        return handleResponse<Empresa>(response);
    },

    delete: async (id: string): Promise<{ success: boolean; id: string }> => {
        const response = await fetch(`${API_BASE}/empresas?id=${id}`, {
            method: 'DELETE',
        });
        return handleResponse<{ success: boolean; id: string }>(response);
    },
};

// ==================== COMPRADORES ====================

export const compradoresApi = {
    getAll: async (): Promise<Comprador[]> => {
        const response = await fetch(`${API_BASE}/compradores`);
        return handleResponse<Comprador[]>(response);
    },

    create: async (nombre: string, empresaId?: string): Promise<Comprador> => {
        const response = await fetch(`${API_BASE}/compradores`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, empresaId }),
        });
        return handleResponse<Comprador>(response);
    },

    update: async (id: string, updates: Partial<Comprador>): Promise<Comprador> => {
        const response = await fetch(`${API_BASE}/compradores`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, ...updates }),
        });
        return handleResponse<Comprador>(response);
    },

    delete: async (id: string): Promise<{ success: boolean; id: string }> => {
        const response = await fetch(`${API_BASE}/compradores?id=${id}`, {
            method: 'DELETE',
        });
        return handleResponse<{ success: boolean; id: string }>(response);
    },
};

// ==================== TIQUETES ====================

export const tiquetesApi = {
    getAll: async (): Promise<TiqueteFruta[]> => {
        const response = await fetch(`${API_BASE}/tiquetes`);
        return handleResponse<TiqueteFruta[]>(response);
    },

    getById: async (id: string): Promise<TiqueteFruta> => {
        const response = await fetch(`${API_BASE}/tiquetes?id=${id}`);
        return handleResponse<TiqueteFruta>(response);
    },

    create: async (tiquete: Omit<TiqueteFruta, 'id' | 'valorTotal' | 'revisado'>): Promise<TiqueteFruta> => {
        const response = await fetch(`${API_BASE}/tiquetes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                fecha: tiquete.fecha,
                empresaId: tiquete.empresa_id,
                compradorId: tiquete.comprador_id,
                numeroTiquete: tiquete.numeroTiquete,
                kilogramos: tiquete.kilogramos,
                valorUnitario: tiquete.valorUnitario,
                observaciones: tiquete.observaciones,
                fotografiaTiquete: tiquete.fotografiaTiquete,
            }),
        });
        return handleResponse<TiqueteFruta>(response);
    },

    update: async (id: string, updates: Partial<TiqueteFruta>): Promise<TiqueteFruta> => {
        const response = await fetch(`${API_BASE}/tiquetes`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id,
                fecha: updates.fecha,
                empresaId: updates.empresa_id,
                compradorId: updates.comprador_id,
                numeroTiquete: updates.numeroTiquete,
                kilogramos: updates.kilogramos,
                valorUnitario: updates.valorUnitario,
                revisado: updates.revisado,
                observaciones: updates.observaciones,
                fotografiaTiquete: updates.fotografiaTiquete,
            }),
        });
        return handleResponse<TiqueteFruta>(response);
    },

    delete: async (id: string): Promise<{ success: boolean; id: string }> => {
        const response = await fetch(`${API_BASE}/tiquetes?id=${id}`, {
            method: 'DELETE',
        });
        return handleResponse<{ success: boolean; id: string }>(response);
    },
};

// ==================== MIGRACIÓN ====================

export interface MigrationData {
    empresas: Empresa[];
    compradores: Comprador[];
    tiquetes: TiqueteFruta[];
}

export interface MigrationResult {
    success: boolean;
    message: string;
    results: {
        empresas: { inserted: number; skipped: number; errors: string[] };
        compradores: { inserted: number; skipped: number; errors: string[] };
        tiquetes: { inserted: number; skipped: number; errors: string[] };
    };
}

export const migrationApi = {
    migrate: async (data: MigrationData): Promise<MigrationResult> => {
        const response = await fetch(`${API_BASE}/migrate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return handleResponse<MigrationResult>(response);
    },
};
