import { useNavigate } from 'react-router-dom';
import type { TiqueteFruta } from '../../types';
import { formatCurrency, formatNumber } from '../../lib/utils';
import { Edit2, Search, FileDown, CheckCircle, AlertCircle, Filter, Calendar } from 'lucide-react';
import { cn } from '../../lib/utils';
import { catalogs } from '../../lib/catalogs';

interface TicketListProps {
    tiquetes: TiqueteFruta[];
    onEdit: (tiquete: TiqueteFruta) => void;
    onToggleRevisado: (id: string) => void;
    filters: {
        empresa: string;
        setEmpresa: (val: string) => void;
        comprador: string;
        setComprador: (val: string) => void;
        startDate: string;
        setStartDate: (val: string) => void;
        endDate: string;
        setEndDate: (val: string) => void;
    };
    uniqueEmpresas: string[];
    uniqueCompradores: string[];
    selectedId?: string;
    onSelect: (tiquete: TiqueteFruta) => void;
}

export function TicketList({ tiquetes, onEdit, onToggleRevisado, filters, uniqueEmpresas, uniqueCompradores, selectedId, onSelect }: TicketListProps) {
    const navigate = useNavigate();

    const getEmpresaNombre = (id: string) => catalogs.getEmpresas().find(e => e.id === id)?.nombre || id;
    const getCompradorNombre = (id: string) => catalogs.getCompradores().find(c => c.id === id)?.nombre || id;

    const handleExport = () => {
        // Simple CSV Export
        const headers = ['Fecha', 'Empresa', 'Comprador', 'Ticket #', 'Kg', 'Valor Unitario', 'Valor Total', 'Revisado', 'Observaciones'];
        const csvContent = [
            headers.join(','),
            ...tiquetes.map(t => [
                t.fecha,
                `"${getEmpresaNombre(t.empresa_id)}"`,
                `"${getCompradorNombre(t.comprador_id)}"`,
                t.numeroTiquete,
                t.kilogramos,
                t.valorUnitario,
                t.valorTotal,
                t.revisado ? 'Si' : 'No',
                `"${t.observaciones || ''}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `reporte_tiquetes_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6 h-full flex flex-col">

            {/* Header / Actions Bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Gestión de Tiquetes</h1>
                    <p className="text-blue-100/70 mt-1">Administra y verifica los recibos de fruta</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button onClick={handleExport} className="btn bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-sm w-full md:w-auto justify-center px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition-colors">
                        <FileDown size={18} />
                        <span className="hidden md:inline">Exportar</span>
                        <span className="md:hidden">Exportar CSV</span>
                    </button>
                    <button
                        onClick={() => {
                            onEdit(undefined as any);
                            navigate('/nuevo');
                        }}
                        className="btn bg-blue-600 text-white border border-transparent hover:bg-blue-700 shadow-sm w-full md:w-auto justify-center px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition-colors shadow-blue-200"
                    >
                        <span>+ Nuevo Tiquete</span>
                    </button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col lg:flex-row gap-4 justify-between items-center transition-all hover:shadow-md">

                {/* Search & Filter Group */}
                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto flex-1">
                    <div className="relative flex-1 max-w-md">
                        <Filter className="absolute left-3 top-2.5 text-slate-400 h-4 w-4" />
                        <select
                            value={filters.empresa}
                            onChange={(e) => filters.setEmpresa(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors appearance-none cursor-pointer hover:bg-slate-100"
                        >
                            <option value="">Todas las Empresas</option>
                            {uniqueEmpresas.map(id => (
                                <option key={id} value={id}>{getEmpresaNombre(id)}</option>
                            ))}
                        </select>
                    </div>

                    <div className="relative flex-1 max-w-md">
                        <Filter className="absolute left-3 top-2.5 text-slate-400 h-4 w-4" />
                        <select
                            value={filters.comprador}
                            onChange={(e) => filters.setComprador(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors appearance-none cursor-pointer hover:bg-slate-100"
                        >
                            <option value="">Todos los Compradores</option>
                            {uniqueCompradores.map(id => (
                                <option key={id} value={id}>{getCompradorNombre(id)}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 w-full sm:w-auto">
                        <Calendar size={16} className="text-slate-400" />
                        <input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => filters.setStartDate(e.target.value)}
                            className="bg-transparent text-sm border-none focus:outline-none w-28 text-slate-600"
                        />
                        <span className="text-slate-300">|</span>
                        <input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => filters.setEndDate(e.target.value)}
                            className="bg-transparent text-sm border-none focus:outline-none w-28 text-slate-600"
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 overflow-hidden flex flex-col">
                <div className="overflow-x-auto flex-1 custom-scrollbar">
                    <table className="w-full border-collapse">
                        <thead className="bg-slate-50/80 sticky top-0 z-10 backdrop-blur-sm">
                            <tr className="border-b border-slate-200">
                                <th className="py-4 px-6 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Fecha / Tiquete</th>
                                <th className="py-4 px-6 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Empresa / Comprador</th>
                                <th className="py-4 px-6 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Peso Neto</th>
                                <th className="py-4 px-6 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Valor Total</th>
                                <th className="py-4 px-6 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                                <th className="py-4 px-6 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {tiquetes.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-16">
                                        <div className="flex flex-col items-center justify-center text-slate-400">
                                            <Search size={48} className="mb-4 text-slate-200" />
                                            <p className="text-lg font-medium text-slate-600">No se encontraron registros</p>
                                            <p className="text-sm">Intenta ajustar los filtros de búsqueda</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                tiquetes.map((t) => (
                                    <tr
                                        key={t.id}
                                        onClick={() => onSelect(t)}
                                        className={cn(
                                            "group cursor-pointer transition-all duration-200 hover:bg-slate-50",
                                            selectedId === t.id ? "bg-blue-50/60 hover:bg-blue-50/80" : ""
                                        )}
                                    >
                                        <td className="py-4 px-6">
                                            <div className="flex flex-col">
                                                <span className={cn("font-medium", selectedId === t.id ? "text-blue-900" : "text-slate-900")}>#{t.numeroTiquete}</span>
                                                <span className="text-xs text-slate-500">{t.fecha}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-slate-700">{getEmpresaNombre(t.empresa_id)}</span>
                                                <span className="text-xs text-slate-500">{getCompradorNombre(t.comprador_id)}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <span className="font-mono text-sm text-slate-600 bg-slate-100 px-2 py-1 rounded inline-block">
                                                {formatNumber(t.kilogramos)} kg
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <span className="text-sm font-bold text-slate-900">{formatCurrency(t.valorTotal)}</span>
                                        </td>
                                        <td className="py-4 px-6 text-center" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                onClick={() => onToggleRevisado(t.id)}
                                                className={cn(
                                                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all duration-200",
                                                    t.revisado
                                                        ? "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100"
                                                        : "bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100"
                                                )}
                                            >
                                                {t.revisado ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                                                {t.revisado ? 'Aprobado' : 'Pendiente'}
                                            </button>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex justify-end gap-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onEdit(t);
                                                        navigate('/nuevo');
                                                    }}
                                                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                                    title="Editar"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 border-t border-slate-200 bg-slate-50 text-xs text-slate-500 flex justify-between items-center font-medium">
                    <span>Mostrando {tiquetes.length} registros</span>
                    <span className="bg-white px-3 py-1 rounded-md border border-slate-200 shadow-sm">
                        Total Valor: <span className="text-slate-900 font-bold ml-1">{formatCurrency(tiquetes.reduce((sum, t) => sum + t.valorTotal, 0))}</span>
                    </span>
                </div>
            </div>
        </div>
    );
}

