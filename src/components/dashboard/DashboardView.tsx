import { useState, useMemo } from 'react';


import { FinancialGrid } from './FinancialGrid';
import type { TiqueteFruta } from '../../types';
import { cn } from '../../lib/utils';
import {
    Scale,
    Coins,
    Filter
} from 'lucide-react';
import { catalogs } from '../../lib/catalogs';



interface DashboardViewProps {
    tiquetes: TiqueteFruta[];
}

export function DashboardView({ tiquetes }: DashboardViewProps) {
    const [viewMode, setViewMode] = useState<'kilos' | 'money'>('kilos');
    const [estadoFilter, setEstadoFilter] = useState<'all' | 'revisado' | 'pendiente'>('all');
    const [compradorFilter, setCompradorFilter] = useState<string>('all');

    const currentYear = new Date().getFullYear();
    const compradores = catalogs.getCompradores();

    // Filter tiquetes based on selected filters
    const filteredTiquetes = useMemo(() => {
        return tiquetes.filter(t => {
            // Estado filter
            if (estadoFilter === 'revisado' && !t.revisado) return false;
            if (estadoFilter === 'pendiente' && t.revisado) return false;

            // Comprador filter
            if (compradorFilter !== 'all' && t.comprador_id !== compradorFilter) return false;

            return true;
        });
    }, [tiquetes, estadoFilter, compradorFilter]);

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="p-4 bg-white/50 backdrop-blur-sm border border-slate-200 rounded-xl flex flex-col gap-4">
                {/* First Row: View Mode and Sync */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                        <span className="text-sm font-semibold text-slate-600">Unidad de Medida:</span>
                        <div className="flex bg-slate-100/80 rounded-lg p-1 border border-slate-200">
                            <button
                                onClick={() => setViewMode('kilos')}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all",
                                    viewMode === 'kilos'
                                        ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-200"
                                        : "text-slate-500 hover:text-slate-700"
                                )}
                            >
                                <Scale size={14} />
                                <span>Kg</span>
                            </button>
                            <button
                                onClick={() => setViewMode('money')}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all",
                                    viewMode === 'money'
                                        ? "bg-white text-emerald-600 shadow-sm ring-1 ring-slate-200"
                                        : "text-slate-500 hover:text-slate-700"
                                )}
                            >
                                <Coins size={14} />
                                <span>COP</span>
                            </button>
                        </div>
                    </div>

                    <div className="text-[10px] md:text-xs font-medium text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                        Sincronizado: {new Date().toLocaleTimeString()}
                    </div>
                </div>

                {/* Second Row: Filters */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-3 border-t border-slate-200">
                    <div className="flex items-center gap-2">
                        <Filter size={14} className="text-slate-400" />
                        <span className="text-sm font-semibold text-slate-600">Filtros:</span>
                    </div>

                    {/* Estado Filter */}
                    <div className="flex items-center gap-2">
                        <label className="text-xs text-slate-700 font-semibold">Estado:</label>
                        <select
                            value={estadoFilter}
                            onChange={(e) => setEstadoFilter(e.target.value as any)}
                            className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg bg-white hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                        >
                            <option value="all">Todos</option>
                            <option value="revisado">Revisados</option>
                            <option value="pendiente">Pendientes</option>
                        </select>
                    </div>

                    {/* Comprador Filter */}
                    <div className="flex items-center gap-2">
                        <label className="text-xs text-slate-700 font-semibold">Comprador:</label>
                        <select
                            value={compradorFilter}
                            onChange={(e) => setCompradorFilter(e.target.value)}
                            className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg bg-white hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors max-w-[200px]"
                        >
                            <option value="all">Todos</option>
                            {compradores.map(c => (
                                <option key={c.id} value={c.id}>{c.nombre}</option>
                            ))}
                        </select>
                    </div>

                    {/* Reset Filters */}
                    {(estadoFilter !== 'all' || compradorFilter !== 'all') && (
                        <button
                            onClick={() => {
                                setEstadoFilter('all');
                                setCompradorFilter('all');
                            }}
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium underline"
                        >
                            Limpiar filtros
                        </button>
                    )}
                </div>
            </div>

            <div>
                <FinancialGrid data={filteredTiquetes} year={currentYear} mode={viewMode} />
            </div>
        </div>
    );
}
