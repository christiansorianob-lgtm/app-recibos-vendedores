import { X, Calendar, MapPin, User, Scale, DollarSign, FileCheck, AlertCircle, Image as ImageIcon, ExternalLink } from 'lucide-react';
import type { TiqueteFruta } from '../../types';
import { formatCurrency, formatNumber } from '../../lib/utils';
import { cn } from '../../lib/utils';
import { catalogs } from '../../lib/catalogs';

interface TicketDetailsPanelProps {
    ticket: TiqueteFruta;
    onClose: () => void;
    onEdit: () => void;
    onToggleStatus: () => void;
}

export function TicketDetailsPanel({ ticket, onClose, onEdit, onToggleStatus }: TicketDetailsPanelProps) {
    return (
        <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        #{ticket.numeroTiquete}
                    </h2>
                    <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                        <Calendar size={14} />
                        {ticket.fecha}
                    </p>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 -mr-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">

                {/* Status Section */}
                <div>
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Estado del Tiquete</div>
                    <div className="flex items-center gap-3">
                        <span className={cn(
                            "px-3 py-1 rounded-full text-sm font-semibold border flex items-center gap-2",
                            ticket.revisado
                                ? "bg-blue-50 text-blue-700 border-blue-100"
                                : "bg-amber-50 text-amber-700 border-amber-100"
                        )}>
                            {ticket.revisado ? <FileCheck size={14} /> : <AlertCircle size={14} />}
                            {ticket.revisado ? "Revisado & Aprobado" : "Pendiente de Revisión"}
                        </span>
                        <button
                            onClick={onToggleStatus}
                            className="text-xs text-blue-600 font-medium hover:underline"
                        >
                            Cambiar estado
                        </button>
                    </div>
                </div>

                {/* Main Information */}
                <div>
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Información Principal</div>

                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-slate-100 text-slate-500 rounded-lg mt-0.5">
                                <MapPin size={18} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-medium">Empresa</p>
                                <p className="text-sm font-semibold text-slate-900">{catalogs.getEmpresas().find(e => e.id === ticket.empresa_id)?.nombre || ticket.empresa_id}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-slate-100 text-slate-500 rounded-lg mt-0.5">
                                <User size={18} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-medium">Comprador</p>
                                <p className="text-sm font-semibold text-slate-900">{catalogs.getCompradores().find(c => c.id === ticket.comprador_id)?.nombre || ticket.comprador_id}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Financials card */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-4">
                    <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                        <div className="flex items-center gap-2 text-slate-600">
                            <Scale size={16} />
                            <span className="text-sm font-medium">Peso Neto</span>
                        </div>
                        <span className="text-lg font-bold text-slate-900">{formatNumber(ticket.kilogramos)} kg</span>
                    </div>

                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-slate-600">
                            <DollarSign size={16} />
                            <span className="text-sm font-medium">Valor Total</span>
                        </div>
                        <span className="text-xl font-bold text-emerald-600">{formatCurrency(ticket.valorTotal)}</span>
                    </div>

                    <div className="text-right text-xs text-slate-400">
                        Valor Unitario: {formatCurrency(ticket.valorUnitario)} / kg
                    </div>
                </div>

                {/* Evidence */}
                <div>
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Evidencia Fotográfica</div>
                    {ticket.fotografiaTiquete ? (
                        <div className="relative group rounded-xl overflow-hidden border border-slate-200 shadow-sm cursor-pointer bg-slate-100">
                            <img
                                src={ticket.fotografiaTiquete}
                                alt="Tiquete"
                                className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                <a
                                    href={ticket.fotografiaTiquete}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="opacity-0 group-hover:opacity-100 bg-white/90 text-slate-900 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all transform translate-y-2 group-hover:translate-y-0"
                                >
                                    <ExternalLink size={14} />
                                    Ver Imagen Completa
                                </a>
                            </div>
                        </div>
                    ) : (
                        <div className="h-24 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400 gap-2">
                            <ImageIcon size={20} />
                            <span className="text-sm">Sin evidencia adjunta</span>
                        </div>
                    )}
                </div>

                {/* Observations */}
                {ticket.observaciones && (
                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                        <p className="text-xs font-bold text-amber-700 uppercase mb-1">Observaciones</p>
                        <p className="text-sm text-amber-900">{ticket.observaciones}</p>
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex gap-3">
                <button
                    onClick={onEdit}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                    Editar Registro
                </button>
            </div>
        </div>
    );
}
