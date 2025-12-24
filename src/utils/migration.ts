import { catalogs } from '../lib/catalogs';
import { storage } from '../lib/storage';
import { migrationApi, type MigrationData } from '../services/api';

/**
 * Utilidad para migrar datos de LocalStorage a la base de datos
 */

export interface MigrationProgress {
    status: 'idle' | 'preparing' | 'migrating' | 'completed' | 'error';
    message: string;
    progress: number;
    results?: {
        empresas: { inserted: number; skipped: number; errors: string[] };
        compradores: { inserted: number; skipped: number; errors: string[] };
        tiquetes: { inserted: number; skipped: number; errors: string[] };
    };
}

/**
 * Exporta los datos actuales de LocalStorage
 */
export function exportLocalStorageData(): MigrationData {
    const empresas = catalogs.getEmpresas();
    const compradores = catalogs.getCompradores();
    const tiquetes = storage.getAll();

    return {
        empresas,
        compradores,
        tiquetes,
    };
}

/**
 * Crea un backup de los datos en formato JSON descargable
 */
export function createBackup(data: MigrationData): void {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Ejecuta la migración de datos a la base de datos
 */
export async function migrateToDatabase(
    onProgress?: (progress: MigrationProgress) => void
): Promise<MigrationProgress> {
    try {
        // Paso 1: Preparar datos
        onProgress?.({
            status: 'preparing',
            message: 'Exportando datos de LocalStorage...',
            progress: 10,
        });

        const data = exportLocalStorageData();

        // Validar que hay datos para migrar
        const totalRecords = data.empresas.length + data.compradores.length + data.tiquetes.length;

        if (totalRecords === 0) {
            return {
                status: 'completed',
                message: 'No hay datos para migrar',
                progress: 100,
                results: {
                    empresas: { inserted: 0, skipped: 0, errors: [] },
                    compradores: { inserted: 0, skipped: 0, errors: [] },
                    tiquetes: { inserted: 0, skipped: 0, errors: [] },
                },
            };
        }

        // Paso 2: Crear backup automático
        onProgress?.({
            status: 'preparing',
            message: 'Creando backup de seguridad...',
            progress: 20,
        });

        createBackup(data);

        // Paso 3: Enviar datos a la API
        onProgress?.({
            status: 'migrating',
            message: `Migrando ${totalRecords} registros a la base de datos...`,
            progress: 40,
        });

        const result = await migrationApi.migrate(data);

        // Paso 4: Completado
        const totalInserted =
            result.results.empresas.inserted +
            result.results.compradores.inserted +
            result.results.tiquetes.inserted;

        const totalSkipped =
            result.results.empresas.skipped +
            result.results.compradores.skipped +
            result.results.tiquetes.skipped;

        const hasErrors =
            result.results.empresas.errors.length > 0 ||
            result.results.compradores.errors.length > 0 ||
            result.results.tiquetes.errors.length > 0;

        const finalProgress: MigrationProgress = {
            status: hasErrors ? 'error' : 'completed',
            message: hasErrors
                ? `Migración completada con errores. Insertados: ${totalInserted}, Omitidos: ${totalSkipped}`
                : `Migración exitosa. Insertados: ${totalInserted}, Omitidos: ${totalSkipped}`,
            progress: 100,
            results: result.results,
        };

        onProgress?.(finalProgress);
        return finalProgress;

    } catch (error) {
        const errorProgress: MigrationProgress = {
            status: 'error',
            message: `Error durante la migración: ${error instanceof Error ? error.message : 'Error desconocido'}`,
            progress: 0,
        };

        onProgress?.(errorProgress);
        return errorProgress;
    }
}

/**
 * Verifica si hay datos en LocalStorage que aún no se han migrado
 */
export function hasLocalStorageData(): boolean {
    const empresas = catalogs.getEmpresas();
    const compradores = catalogs.getCompradores();
    const tiquetes = storage.getAll();

    return empresas.length > 0 || compradores.length > 0 || tiquetes.length > 0;
}

/**
 * Obtiene estadísticas de los datos en LocalStorage
 */
export function getLocalStorageStats() {
    const empresas = catalogs.getEmpresas();
    const compradores = catalogs.getCompradores();
    const tiquetes = storage.getAll();

    return {
        empresas: empresas.length,
        compradores: compradores.length,
        tiquetes: tiquetes.length,
        total: empresas.length + compradores.length + tiquetes.length,
    };
}
