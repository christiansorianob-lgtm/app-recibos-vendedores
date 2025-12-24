import type { TiqueteFruta } from '../types';

const STORAGE_KEY = 'tiquetes_db_v1';

export const storage = {
    getAll: (): TiqueteFruta[] => {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error reading from localStorage', error);
            return [];
        }
    },

    saveAll: (tiquetes: TiqueteFruta[]) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(tiquetes));
        } catch (error) {
            console.error('Error writing to localStorage', error);
        }
    },

    add: (tiquete: TiqueteFruta) => {
        const current = storage.getAll();
        const updated = [tiquete, ...current];
        storage.saveAll(updated);
        return updated;
    },

    update: (updatedTiquete: TiqueteFruta) => {
        const current = storage.getAll();
        const updated = current.map((t) =>
            t.id === updatedTiquete.id ? updatedTiquete : t
        );
        storage.saveAll(updated);
        return updated;
    },

    delete: (id: string) => {
        const current = storage.getAll();
        const updated = current.filter((t) => t.id !== id);
        storage.saveAll(updated);
        return updated;
    }
};
