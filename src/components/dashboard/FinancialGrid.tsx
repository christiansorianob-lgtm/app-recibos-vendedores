import { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, Calculator } from 'lucide-react';
import type { TiqueteFruta } from '../../types';
import { cn, formatNumber, formatCurrency } from '../../lib/utils';
import { catalogs } from '../../lib/catalogs';

// Helper to get month name
const MONTHS = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
];

interface FinancialGridProps {
    data: TiqueteFruta[];
    year: number;
    mode: 'kilos' | 'money';
}

type GridRow = {
    id: string;
    label: string;
    type: 'company' | 'buyer';
    data: number[]; // 12 months + total
    children?: GridRow[];
};

export function FinancialGrid({ data, year, mode }: FinancialGridProps) {
    const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

    const toggleRow = (id: string) => {
        setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
    };

    // Transform data into grid structure
    const gridData = useMemo(() => {
        const empresas = catalogs.getEmpresas();
        const compradores = catalogs.getCompradores();

        // 1. Group by Company -> Buyer
        const companies: Record<string, Record<string, TiqueteFruta[]>> = {};

        data.forEach(t => {
            const date = new Date(t.fecha);
            if (date.getFullYear() !== year) return;

            const eid = t.empresa_id;
            const cid = t.comprador_id;

            if (!companies[eid]) companies[eid] = {};
            if (!companies[eid][cid]) companies[eid][cid] = [];

            companies[eid][cid].push(t);
        });

        const rows: GridRow[] = [];
        const grandTotals = new Array(13).fill(0); // 12 months + total

        Object.entries(companies).forEach(([empresaId, buyersByCid], compIdx) => {
            const companyName = empresas.find(e => e.id === empresaId)?.nombre || empresaId;
            const gridCompId = `comp-${empresaId}-${compIdx}`;
            const companyTotals = new Array(13).fill(0);
            const buyerRows: GridRow[] = [];

            Object.entries(buyersByCid).forEach(([compradorId, tickets], buyerIdx) => {
                const buyerName = compradores.find(c => c.id === compradorId)?.nombre || compradorId;
                const gridBuyerId = `${gridCompId}-buyer-${compradorId}-${buyerIdx}`;
                const rowValues = new Array(13).fill(0);

                tickets.forEach(t => {
                    const month = new Date(t.fecha).getMonth(); // 0-11
                    const value = mode === 'kilos' ? t.kilogramos : t.valorTotal;

                    rowValues[month] += value;
                    rowValues[12] += value; // Total column
                });

                // Add to company totals
                rowValues.forEach((val, idx) => companyTotals[idx] += val);

                // Metric Rows for Buyer
                buyerRows.push({
                    id: gridBuyerId,
                    label: buyerName,
                    type: 'buyer',
                    data: rowValues
                });
            });

            // Add to Grand Totals
            companyTotals.forEach((val, idx) => grandTotals[idx] += val);

            // Company Header Row
            rows.push({
                id: gridCompId,
                label: companyName,
                type: 'company',
                data: companyTotals,
                children: buyerRows
            });
        });

        return { rows, grandTotals };
    }, [data, year, mode]);

    const visibleRows: GridRow[] = [];
    gridData.rows.forEach(compRow => {
        visibleRows.push(compRow);
        const isExpanded = expandedRows[compRow.id] ?? true; // Default expanded
        if (isExpanded && compRow.children) {
            compRow.children.forEach(child => visibleRows.push(child));
        }
    });

    const formatFn = mode === 'kilos' ? formatNumber : formatCurrency;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col animate-in fade-in duration-500">

            {/* Horizontal Scroll Container */}
            <div className="flex-1 overflow-x-auto overflow-y-visible custom-scrollbar scrolling-touch">
                <div className="min-w-[1000px] md:min-w-full">
                    {/* Grid Header */}
                    <div className="flex bg-slate-100 border-b border-slate-200 sticky top-0 z-30 font-semibold text-slate-600">
                        <div className="w-[180px] md:w-[250px] p-2 pl-4 flex items-center bg-slate-100 sticky left-0 z-40 border-r border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                            Empresa / Comprador ({mode === 'kilos' ? 'Kg' : '$'})
                        </div>
                        {MONTHS.map((m, i) => (
                            <div key={i} className="w-24 md:w-28 p-2 text-right border-r border-slate-200 last:border-r-0 text-[10px] md:text-xs">
                                {m}
                            </div>
                        ))}
                        <div className="w-28 md:w-32 p-2 text-right bg-slate-50 font-bold text-slate-800 border-l border-slate-200">
                            Total
                        </div>
                    </div>

                    {/* Grid Body */}
                    <div className="divide-y divide-slate-100">
                        {visibleRows.map((row) => (
                            <div
                                key={row.id}
                                className={cn(
                                    "flex transition-colors hover:bg-blue-50/30",
                                    row.type === 'company' ? "bg-slate-50 font-semibold text-slate-800" : "bg-white text-slate-600"
                                )}
                            >
                                {/* First Column */}
                                <div className={cn(
                                    "w-[180px] md:w-[250px] p-2 flex items-center sticky left-0 z-20 border-r border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]",
                                    row.type === 'company' ? "bg-slate-50 pl-4" : "bg-white pl-8"
                                )}>
                                    {row.type === 'company' && (
                                        <button
                                            onClick={() => toggleRow(row.id)}
                                            className="mr-2 p-0.5 hover:bg-slate-200 rounded transition-colors"
                                        >
                                            {(expandedRows[row.id] ?? true) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                        </button>
                                    )}
                                    <span className="truncate text-xs md:text-sm">{row.label}</span>
                                </div>

                                {/* Month Columns */}
                                {row.data.slice(0, 12).map((val, i) => (
                                    <div key={i} className="w-24 md:w-28 p-2 text-right border-r border-slate-50 text-[10px] md:text-xs font-mono">
                                        {val === 0 ? <span className="text-slate-200">-</span> : formatFn(val)}
                                    </div>
                                ))}

                                {/* Total Column */}
                                <div className={cn(
                                    "w-28 md:w-32 p-2 text-right border-l border-slate-200 font-mono text-[10px] md:text-xs",
                                    row.type === 'company' ? "font-bold text-slate-900 bg-slate-100/50" : "font-semibold text-slate-700 bg-slate-50/30"
                                )}>
                                    {formatFn(row.data[12])}
                                </div>
                            </div>
                        ))}

                        {/* Grand Total Row */}
                        <div className="flex bg-slate-800 text-white font-bold border-t border-slate-700 sticky bottom-0 z-30 shadow-[0_-2px_5px_rgba(0,0,0,0.1)]">
                            <div className="w-[180px] md:w-[250px] p-3 pl-4 flex items-center bg-slate-800 sticky left-0 z-40 border-r border-slate-700">
                                <Calculator size={16} className="mr-2 text-emerald-400" />
                                <span className="text-xs md:text-sm">TOTAL GENERAL</span>
                            </div>
                            {gridData.grandTotals.slice(0, 12).map((val, i) => (
                                <div key={i} className="w-24 md:w-28 p-3 text-right border-r border-slate-700 text-[10px] md:text-xs font-mono">
                                    {val === 0 ? '-' : formatFn(val)}
                                </div>
                            ))}
                            <div className="w-28 md:w-32 p-3 text-right bg-slate-900 border-l border-slate-700 font-mono text-[10px] md:text-xs text-emerald-400">
                                {formatFn(gridData.grandTotals[12])}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Empty State */}
            {visibleRows.length === 0 && (
                <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-3">
                    <div className="p-4 bg-slate-50 rounded-full">
                        <Calculator size={32} />
                    </div>
                    <p>No hay datos para el año seleccionado</p>
                </div>
            )}
        </div>
    );
}
