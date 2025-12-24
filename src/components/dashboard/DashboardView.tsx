import { useState } from 'react';


import { FinancialGrid } from './FinancialGrid';
import type { TiqueteFruta } from '../../types';
import { cn } from '../../lib/utils';
import {
    Scale,
    Coins
} from 'lucide-react';



interface DashboardViewProps {
    tiquetes: TiqueteFruta[];
}

export function DashboardView({ tiquetes }: DashboardViewProps) {
    const [viewMode, setViewMode] = useState<'kilos' | 'money'>('kilos');

    const currentYear = new Date().getFullYear();

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="p-4 bg-white/50 backdrop-blur-sm border border-slate-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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

            <div>
                <FinancialGrid data={tiquetes} year={currentYear} mode={viewMode} />
            </div>
        </div>
    );
}
