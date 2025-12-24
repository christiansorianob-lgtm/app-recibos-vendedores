import { catalogs } from './catalogs';
import type { Empresa, Comprador } from '../types';

/**
 * Mock API layer to fulfill requirement for /api endpoints.
 * In a real application, these would be fetch calls.
 */
export const api = {
    getEmpresas: async (): Promise<Empresa[]> => {
        console.log('GET /api/empresas called');
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 300));
        const data = catalogs.getEmpresas();
        console.log('GET /api/empresas responsive:', data);
        return data;
    },

    getCompradores: async (): Promise<Comprador[]> => {
        console.log('GET /api/compradores called');
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 300));
        const data = catalogs.getCompradores();
        console.log('GET /api/compradores responsive:', data);
        return data;
    }
};
