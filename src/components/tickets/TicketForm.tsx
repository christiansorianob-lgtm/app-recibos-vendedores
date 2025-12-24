import { useState, useEffect, useRef, useMemo } from 'react';
import type { TiqueteFruta, TiqueteInput, Empresa, Comprador } from '../../types';
import { Save, AlertCircle, Calendar, Truck, User, Scale, FileText, Camera, Image as ImageIcon, X, ExternalLink } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';

interface TicketFormProps {
    initialData?: TiqueteFruta;
    onSubmit: (data: TiqueteInput) => void;
    onCancel?: () => void;
}

const Section = ({ title, icon: Icon, children }: { title: string, icon: any, children: React.ReactNode }) => (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden mb-6 shadow-sm">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center gap-2">
            <div className="bg-blue-100 p-1.5 rounded text-blue-700">
                <Icon size={18} />
            </div>
            <h3 className="font-semibold text-slate-800">{title}</h3>
        </div>
        <div className="p-6">
            {children}
        </div>
    </div>
);

export function TicketForm({ initialData, onSubmit, onCancel }: TicketFormProps) {
    const [formData, setFormData] = useState<TiqueteInput>({
        fecha: new Date().toISOString().split('T')[0],
        empresa_id: '',
        comprador_id: '',
        numeroTiquete: '',
        kilogramos: 0,
        valorUnitario: 0,
        observaciones: '',
        fotografiaTiquete: ''
    });

    const [error, setError] = useState<string | null>(null);
    const [allEmpresas, setAllEmpresas] = useState<Empresa[]>([]);
    const [allCompradores, setAllCompradores] = useState<Comprador[]>([]);
    const [loading, setLoading] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load catalogs on mount via API
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [empresasRes, compradoresRes] = await Promise.all([
                    api.getEmpresas(),
                    api.getCompradores()
                ]);

                console.log('API Response - Empresas:', empresasRes);
                console.log('API Response - Compradores:', compradoresRes);

                setAllEmpresas(empresasRes);
                setAllCompradores(compradoresRes);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Error al cargar catálogos desde el servidor');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (initialData && initialData.id) {
            console.log('Preloading edit data:', initialData);
            const { id, valorTotal, revisado, ...rest } = initialData;
            setFormData(rest);
        }
    }, [initialData]);

    // Filtered buyers based on selected company
    const filteredCompradores = useMemo(() => {
        if (!formData.empresa_id) {
            // If no company selected, show global buyers (no empresaId)
            return allCompradores.filter(c => !c.empresaId);
        }
        return allCompradores.filter(c => !c.empresaId || c.empresaId === formData.empresa_id);
    }, [formData.empresa_id, allCompradores]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        console.log(`Field changed: ${name} = ${value}`);

        setFormData(prev => {
            const newData = {
                ...prev,
                [name]: type === 'number' ? (value === '' ? 0 : parseFloat(value)) : value
            };

            // Reset buyer if company changes
            if (name === 'empresa_id') {
                newData.comprador_id = '';
            }

            console.log('Updated Form State:', newData);
            return newData;
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                setError("La imagen no puede superar los 5MB");
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, fotografiaTiquete: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setFormData(prev => ({ ...prev, fotografiaTiquete: '' }));
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (formData.kilogramos <= 0) return setError("Los kilogramos deben ser mayores a 0");
        if (formData.valorUnitario <= 0) return setError("El valor unitario debe ser mayor a 0");
        if (!formData.empresa_id) return setError("Debe seleccionar una Empresa");
        if (!formData.comprador_id) return setError("Debe seleccionar un Comprador");
        if (!formData.numeroTiquete) return setError("Todos los campos obligatorios deben completarse");

        try {
            console.log('Submitting data (storing IDs):', formData);
            onSubmit(formData);
            if (!initialData) {
                setFormData({
                    fecha: new Date().toISOString().split('T')[0],
                    empresa_id: '',
                    comprador_id: '',
                    numeroTiquete: '',
                    kilogramos: 0,
                    valorUnitario: 0,
                    observaciones: '',
                    fotografiaTiquete: ''
                });
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        } catch (err: any) {
            setError(err.message);
        }
    };

    const calculatedTotal = formData.kilogramos * formData.valorUnitario;

    return (
        <div className="max-w-5xl mx-auto pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white">
                        {initialData ? 'Editar Tiquete' : 'Nuevo Registro de Fruta'}
                    </h2>
                    <p className="text-blue-100/70 text-sm mt-1">Complete la información del tiquete de báscula.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                {error && (
                    <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-lg flex items-center gap-2 text-sm mb-6 animate-in fade-in slide-in-from-top-2">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* Left Column - Main Info */}
                    <div className="xl:col-span-2 space-y-6">
                        <Section title="Información General" icon={FileText}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Número de Tiquete</label>
                                    <input
                                        type="text"
                                        name="numeroTiquete"
                                        value={formData.numeroTiquete}
                                        onChange={handleChange}
                                        className="input-field bg-slate-50 font-mono focus:bg-white transition-colors"
                                        placeholder="T-00000"
                                        required
                                        disabled={!!initialData?.id}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Fecha de Registro</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-2.5 text-slate-400 h-4 w-4" />
                                        <input
                                            type="date"
                                            name="fecha"
                                            value={formData.fecha}
                                            onChange={handleChange}
                                            className="input-field pl-9"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </Section>

                        <Section title="Datos del Proveedor" icon={User}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-end">
                                        <label className="text-sm font-medium text-slate-700">Empresa</label>
                                        <Link to="/catalogos/empresas" className="text-[10px] text-blue-600 hover:text-blue-800 flex items-center gap-0.5 font-semibold transition-colors uppercase tracking-tight">
                                            Administrar <ExternalLink size={10} />
                                        </Link>
                                    </div>
                                    <div className="relative group">
                                        <Truck className="absolute left-3 top-2.5 text-slate-400 h-4 w-4 z-10 pointer-events-none" />
                                        <select
                                            name="empresa_id"
                                            value={formData.empresa_id}
                                            onChange={handleChange}
                                            className="input-field pl-9 pr-10 appearance-none bg-white relative z-0 focus:ring-2 focus:ring-blue-500"
                                            required
                                            disabled={loading}
                                        >
                                            <option value="">Seleccione empresa...</option>
                                            {allEmpresas.map(e => (
                                                <option key={e.id} value={e.id}>{e.nombre}</option>
                                            ))}
                                            {allEmpresas.length === 0 && !loading && (
                                                <option disabled>No hay empresas registradas</option>
                                            )}
                                        </select>
                                        <div className="absolute right-3 top-2.5 text-slate-400 pointer-events-none">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-end">
                                        <label className="text-sm font-medium text-slate-700">Comprador</label>
                                        <Link to="/catalogos/compradores" className="text-[10px] text-blue-600 hover:text-blue-800 flex items-center gap-0.5 font-semibold transition-colors uppercase tracking-tight">
                                            Administrar <ExternalLink size={10} />
                                        </Link>
                                    </div>
                                    <div className="relative group">
                                        <User className="absolute left-3 top-2.5 text-slate-400 h-4 w-4 z-10 pointer-events-none" />
                                        <select
                                            name="comprador_id"
                                            value={formData.comprador_id}
                                            onChange={handleChange}
                                            className="input-field pl-9 pr-10 appearance-none bg-white relative z-0 focus:ring-2 focus:ring-blue-500"
                                            required
                                            disabled={loading || !formData.empresa_id}
                                        >
                                            <option value="">Seleccione comprador...</option>
                                            {filteredCompradores.map(c => (
                                                <option key={c.id} value={c.id}>{c.nombre}</option>
                                            ))}
                                            {filteredCompradores.length === 0 && !loading && (
                                                <option disabled>
                                                    {formData.empresa_id ? "No hay compradores registrados" : "Seleccione empresa primero"}
                                                </option>
                                            )}
                                        </select>
                                        <div className="absolute right-3 top-2.5 text-slate-400 pointer-events-none">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Section>

                        <Section title="Evidencia del Tiquete" icon={Camera}>
                            <div className="space-y-4">
                                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors relative">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        accept="image/*"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <div className="bg-blue-50 p-3 rounded-full mb-3">
                                        <ImageIcon className="text-blue-500 h-6 w-6" />
                                    </div>
                                    <p className="text-sm font-medium text-slate-700">
                                        {formData.fotografiaTiquete ? 'Cambiar fotografía' : 'Subir fotografía del tiquete'}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">PNG, JPG hasta 5MB</p>
                                </div>

                                {formData.fotografiaTiquete && (
                                    <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-900 aspect-video flex items-center justify-center">
                                        <img
                                            src={formData.fotografiaTiquete}
                                            alt="Vista previa"
                                            className="max-w-full max-h-full object-contain"
                                        />
                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-sm"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </Section>

                        <Section title="Observaciones" icon={FileText}>
                            <textarea
                                name="observaciones"
                                value={formData.observaciones}
                                onChange={handleChange}
                                className="input-field min-h-[120px]"
                                placeholder="Ingrese notas adicionales, condiciones de la fruta, etc..."
                            />
                        </Section>
                    </div>

                    {/* Right Column - Calculations */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg border border-slate-200 shadow-xl p-6 xl:sticky xl:top-24">
                            <h3 className="font-semibold text-slate-800 mb-6 flex items-center gap-2">
                                <Scale size={18} className="text-blue-600" />
                                Detalle de Valor
                            </h3>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 flex justify-between">
                                        Peso Neto
                                        <span className="text-slate-400 text-xs font-normal">Kilogramos</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="kilogramos"
                                        value={formData.kilogramos || ''}
                                        onChange={handleChange}
                                        className="input-field text-right text-lg font-bold"
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 flex justify-between">
                                        Valor Unitario
                                        <span className="text-slate-400 text-xs font-normal">COP / Kg</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="valorUnitario"
                                        value={formData.valorUnitario || ''}
                                        onChange={handleChange}
                                        className="input-field text-right text-lg font-bold"
                                        min="0"
                                        step="1"
                                        placeholder="0"
                                        required
                                    />
                                </div>

                                <div className="pt-6 border-t border-slate-100 mt-6">
                                    <div className="text-sm text-slate-500 mb-1 text-right">Total Estimado</div>
                                    <div className="text-3xl font-black text-blue-600 text-right bg-blue-50/50 p-4 rounded-lg border border-blue-100/50">
                                        {formatCurrency(calculatedTotal)}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 pt-4">
                                    <button type="submit" className="btn w-full py-3 justify-center bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all text-base font-bold">
                                        <Save size={18} />
                                        Guardar Tiquete
                                    </button>
                                    {onCancel && (
                                        <button type="button" onClick={onCancel} className="btn w-full justify-center bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800">
                                            Cancelar
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
