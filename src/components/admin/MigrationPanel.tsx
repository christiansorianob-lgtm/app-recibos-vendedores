import { useState } from 'react';
import { Database, Download, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import {
    migrateToDatabase,
    hasLocalStorageData,
    getLocalStorageStats,
    createBackup,
    exportLocalStorageData,
    type MigrationProgress
} from '../../utils/migration';

export function MigrationPanel() {
    const [progress, setProgress] = useState<MigrationProgress>({
        status: 'idle',
        message: '',
        progress: 0,
    });

    const stats = getLocalStorageStats();
    const hasData = hasLocalStorageData();

    const handleMigrate = async () => {
        await migrateToDatabase(setProgress);
    };

    const handleBackup = () => {
        const data = exportLocalStorageData();
        createBackup(data);
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <Database className="w-8 h-8 text-blue-600" />
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            Migración a Base de Datos
                        </h2>
                        <p className="text-sm text-gray-600">
                            Migra tus datos de LocalStorage a Vercel Postgres
                        </p>
                    </div>
                </div>

                {/* Stats */}
                {hasData && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="font-semibold text-blue-900 mb-2">
                            Datos en LocalStorage
                        </h3>
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <div className="text-2xl font-bold text-blue-600">
                                    {stats.empresas}
                                </div>
                                <div className="text-sm text-gray-600">Empresas</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-blue-600">
                                    {stats.compradores}
                                </div>
                                <div className="text-sm text-gray-600">Compradores</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-blue-600">
                                    {stats.tiquetes}
                                </div>
                                <div className="text-sm text-gray-600">Tiquetes</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* No Data Message */}
                {!hasData && progress.status === 'idle' && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                        <p className="text-gray-600">
                            No hay datos en LocalStorage para migrar
                        </p>
                    </div>
                )}

                {/* Progress */}
                {progress.status !== 'idle' && (
                    <div className="space-y-3">
                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progress.progress}%` }}
                            />
                        </div>

                        {/* Status Message */}
                        <div className="flex items-center gap-2">
                            {progress.status === 'preparing' && (
                                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                            )}
                            {progress.status === 'migrating' && (
                                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                            )}
                            {progress.status === 'completed' && (
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                            )}
                            {progress.status === 'error' && (
                                <AlertCircle className="w-5 h-5 text-red-600" />
                            )}
                            <span className="text-sm text-gray-700">{progress.message}</span>
                        </div>

                        {/* Results */}
                        {progress.results && (
                            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                <h4 className="font-semibold text-gray-900">Resultados:</h4>
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                    <div>
                                        <div className="font-medium text-gray-700">Empresas</div>
                                        <div className="text-green-600">
                                            ✓ {progress.results.empresas.inserted} insertadas
                                        </div>
                                        <div className="text-gray-500">
                                            ⊘ {progress.results.empresas.skipped} omitidas
                                        </div>
                                        {progress.results.empresas.errors.length > 0 && (
                                            <div className="text-red-600">
                                                ✗ {progress.results.empresas.errors.length} errores
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-700">Compradores</div>
                                        <div className="text-green-600">
                                            ✓ {progress.results.compradores.inserted} insertados
                                        </div>
                                        <div className="text-gray-500">
                                            ⊘ {progress.results.compradores.skipped} omitidos
                                        </div>
                                        {progress.results.compradores.errors.length > 0 && (
                                            <div className="text-red-600">
                                                ✗ {progress.results.compradores.errors.length} errores
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-700">Tiquetes</div>
                                        <div className="text-green-600">
                                            ✓ {progress.results.tiquetes.inserted} insertados
                                        </div>
                                        <div className="text-gray-500">
                                            ⊘ {progress.results.tiquetes.skipped} omitidos
                                        </div>
                                        {progress.results.tiquetes.errors.length > 0 && (
                                            <div className="text-red-600">
                                                ✗ {progress.results.tiquetes.errors.length} errores
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Error Details */}
                                {progress.results && (
                                    <>
                                        {progress.results.empresas.errors.length > 0 && (
                                            <details className="text-xs text-red-600">
                                                <summary className="cursor-pointer">
                                                    Ver errores de empresas
                                                </summary>
                                                <ul className="mt-2 space-y-1">
                                                    {progress.results.empresas.errors.map((err, i) => (
                                                        <li key={i}>• {err}</li>
                                                    ))}
                                                </ul>
                                            </details>
                                        )}
                                        {progress.results.compradores.errors.length > 0 && (
                                            <details className="text-xs text-red-600">
                                                <summary className="cursor-pointer">
                                                    Ver errores de compradores
                                                </summary>
                                                <ul className="mt-2 space-y-1">
                                                    {progress.results.compradores.errors.map((err, i) => (
                                                        <li key={i}>• {err}</li>
                                                    ))}
                                                </ul>
                                            </details>
                                        )}
                                        {progress.results.tiquetes.errors.length > 0 && (
                                            <details className="text-xs text-red-600">
                                                <summary className="cursor-pointer">
                                                    Ver errores de tiquetes
                                                </summary>
                                                <ul className="mt-2 space-y-1">
                                                    {progress.results.tiquetes.errors.map((err, i) => (
                                                        <li key={i}>• {err}</li>
                                                    ))}
                                                </ul>
                                            </details>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={handleMigrate}
                        disabled={!hasData || progress.status === 'migrating' || progress.status === 'preparing'}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                        {progress.status === 'migrating' || progress.status === 'preparing' ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Migrando...
                            </>
                        ) : (
                            <>
                                <Database className="w-5 h-5" />
                                Migrar a Base de Datos
                            </>
                        )}
                    </button>

                    <button
                        onClick={handleBackup}
                        disabled={!hasData}
                        className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
                    >
                        <Download className="w-5 h-5" />
                        Descargar Backup
                    </button>
                </div>

                {/* Info */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm">
                    <div className="flex gap-2">
                        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                        <div className="text-yellow-800">
                            <p className="font-semibold mb-1">Importante:</p>
                            <ul className="space-y-1 list-disc list-inside">
                                <li>Se creará un backup automático antes de migrar</li>
                                <li>Los registros duplicados serán omitidos</li>
                                <li>Tus datos en LocalStorage no se eliminarán</li>
                                <li>Puedes ejecutar la migración múltiples veces de forma segura</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
