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
        <div className="h-full flex flex-col">
            {/* Toolbar */}
            <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-500">Unidad de Medida:</span>
                    <div className="flex bg-slate-100 rounded-lg p-1 border border-slate-200">
                        <button
                            onClick={() => setViewMode('kilos')}
                            className={cn(
                                "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all",
                                viewMode === 'kilos'
                                    ? "bg-white text-blue-600 shadow-sm shadow-slate-200 ring-1 ring-slate-200"
                                    : "text-slate-500 hover:text-slate-700"
                            )}
                        >
                            <Scale size={14} />
                            <span>Kilogramos (Kg)</span>
                        </button>
                        <button
                            onClick={() => setViewMode('money')}
                            className={cn(
                                "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all",
                                viewMode === 'money'
                                    ? "bg-white text-emerald-600 shadow-sm shadow-slate-200 ring-1 ring-slate-200"
                                    : "text-slate-500 hover:text-slate-700"
                            )}
                        >
                            <Coins size={14} />
                            <span>Dinero (COP)</span>
                        </button>
                    </div>
                </div>

                <div className="text-xs text-slate-400">
                    Datos sincronizados: {new Date().toLocaleTimeString()}
                </div>
            </div>

            <div className="flex-1 overflow-hidden">
                <FinancialGrid data={tiquetes} year={currentYear} mode={viewMode} />
            </div>
        </div>
    );
}
