import { v4 as uuidv4 } from 'uuid';
import type { Empresa, Comprador } from '../types';

const EMPRESAS_KEY = 'empresas_db_v1';
const COMPRADORES_KEY = 'compradores_db_v1';

export const catalogs = {
    // Empresas
    getEmpresas: (): Empresa[] => {
        try {
            const data = localStorage.getItem(EMPRESAS_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error reading empresas', error);
            return [];
        }
    },

    saveEmpresas: (list: Empresa[]) => {
        try {
            localStorage.setItem(EMPRESAS_KEY, JSON.stringify(list));
        } catch (error) {
            console.error('Error saving empresas', error);
        }
    },

    addEmpresa: (nombre: string): Empresa => {
        const list = catalogs.getEmpresas();
        if (list.some(e => e.nombre.toLowerCase() === nombre.toLowerCase())) {
            throw new Error('Ya existe una empresa con este nombre');
        }
        const newItem: Empresa = {
            id: uuidv4(),
            nombre,
            activo: true,
            createdAt: new Date().toISOString()
        };
        catalogs.saveEmpresas([newItem, ...list]);
        return newItem;
    },

    updateEmpresa: (id: string, updates: Partial<Empresa>) => {
        const list = catalogs.getEmpresas();
        const updated = list.map(item => item.id === id ? { ...item, ...updates } : item);
        catalogs.saveEmpresas(updated);
        return updated;
    },

    deleteEmpresa: (id: string) => {
        const list = catalogs.getEmpresas();
        const updated = list.filter(item => item.id !== id);
        catalogs.saveEmpresas(updated);
        return updated; // Return list for UI update
    },

    // Compradores
    getCompradores: (): Comprador[] => {
        try {
            const data = localStorage.getItem(COMPRADORES_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error reading compradores', error);
            return [];
        }
    },

    saveCompradores: (list: Comprador[]) => {
        try {
            localStorage.setItem(COMPRADORES_KEY, JSON.stringify(list));
        } catch (error) {
            console.error('Error saving compradores', error);
        }
    },

    addComprador: (nombre: string, empresaId?: string): Comprador => {
        const list = catalogs.getCompradores();
        const newItem: Comprador = {
            id: uuidv4(),
            nombre,
            empresaId,
            activo: true,
            createdAt: new Date().toISOString()
        };
        catalogs.saveCompradores([newItem, ...list]);
        return newItem;
    },

    updateComprador: (id: string, updates: Partial<Comprador>) => {
        const list = catalogs.getCompradores();
        const updated = list.map(item => item.id === id ? { ...item, ...updates } : item);
        catalogs.saveCompradores(updated);
        return updated;
    },

    deleteComprador: (id: string) => {
        const list = catalogs.getCompradores();
        const updated = list.filter(item => item.id !== id);
        catalogs.saveCompradores(updated);
        return updated;
    }
};
