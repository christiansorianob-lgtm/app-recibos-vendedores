import { useState, useRef } from 'react';
import { Upload, Scan, CheckCircle, AlertCircle, Loader2, X } from 'lucide-react';
import { useOCR, type ExtractedReceiptData } from '../../hooks/useOCR';
import { catalogs } from '../../lib/catalogs';
import { useTickets } from '../../hooks/useTickets';
import { cn } from '../../lib/utils';

export function ReceiptScannerPage() {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [extractedData, setExtractedData] = useState<ExtractedReceiptData | null>(null);
    const [formData, setFormData] = useState({
        fecha: '',
        empresaId: '',
        compradorId: '',
        numeroTiquete: '',
        kilogramos: '',
        valorUnitario: '',
        observaciones: '',
    });
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { processImage, isProcessing, progress } = useOCR();
    const { addTiquete } = useTickets();
    const empresas = catalogs.getEmpresas();
    const compradores = catalogs.getCompradores();

    const handleFileSelect = (file: File) => {
        if (!file.type.startsWith('image/')) {
            alert('Por favor selecciona una imagen válida');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('La imagen no debe superar 5MB');
            return;
        }

        setImageFile(file);
        setExtractedData(null);
        setSaveSuccess(false);

        const reader = new FileReader();
        reader.onload = (e) => {
            setImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) handleFileSelect(file);
    };

    const handleScan = async () => {
        if (!imageFile) return;

        try {
            const data = await processImage(imageFile);
            setExtractedData(data);

            // Pre-llenar formulario con datos extraídos
            setFormData({
                fecha: data.fecha || '',
                empresaId: '',
                compradorId: '',
                numeroTiquete: data.numeroTiquete || '',
                kilogramos: data.kilogramos?.toString() || '',
                valorUnitario: data.valorUnitario?.toString() || '',
                observaciones: `Escaneado automáticamente (${Math.round(data.confidence)}% confianza)`,
            });
        } catch (error) {
            alert((error as Error).message);
        }
    };

    const handleSave = async () => {
        if (!formData.fecha || !formData.empresaId || !formData.compradorId ||
            !formData.numeroTiquete || !formData.kilogramos || !formData.valorUnitario) {
            alert('Por favor completa todos los campos requeridos');
            return;
        }

        setIsSaving(true);
        try {
            await addTiquete({
                fecha: formData.fecha,
                empresa_id: formData.empresaId,
                comprador_id: formData.compradorId,
                numeroTiquete: formData.numeroTiquete,
                kilogramos: parseFloat(formData.kilogramos),
                valorUnitario: parseFloat(formData.valorUnitario),
                observaciones: formData.observaciones,
                fotografiaTiquete: imagePreview || undefined,
            });

            setSaveSuccess(true);
            setTimeout(() => {
                // Reset form
                setImageFile(null);
                setImagePreview(null);
                setExtractedData(null);
                setFormData({
                    fecha: '',
                    empresaId: '',
                    compradorId: '',
                    numeroTiquete: '',
                    kilogramos: '',
                    valorUnitario: '',
                    observaciones: '',
                });
                setSaveSuccess(false);
            }, 2000);
        } catch (error) {
            alert((error as Error).message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = () => {
        setImageFile(null);
        setImagePreview(null);
        setExtractedData(null);
        setSaveSuccess(false);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white">Lector de Recibos (OCR)</h1>
                <p className="text-blue-100/70 mt-1">Escanea recibos automáticamente usando reconocimiento de texto</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column: Image Upload & Preview */}
                <div className="space-y-4">
                    {/* Upload Area */}
                    {!imagePreview ? (
                        <div
                            onDrop={handleDrop}
                            onDragOver={(e) => e.preventDefault()}
                            className="bg-white rounded-xl border-2 border-dashed border-slate-300 p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className="flex flex-col items-center gap-4">
                                <div className="p-4 bg-blue-50 rounded-full">
                                    <Upload size={32} className="text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-lg font-semibold text-slate-700">Arrastra una imagen aquí</p>
                                    <p className="text-sm text-slate-500 mt-1">o haz clic para seleccionar</p>
                                </div>
                                <div className="flex gap-2 text-xs text-slate-400">
                                    <span>JPG, PNG, WEBP</span>
                                    <span>•</span>
                                    <span>Máx 5MB</span>
                                </div>
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                            />
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl p-4 space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="font-semibold text-slate-700">Imagen del Recibo</h3>
                                <button
                                    onClick={handleReset}
                                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                    title="Cambiar imagen"
                                >
                                    <X size={18} className="text-slate-500" />
                                </button>
                            </div>
                            <img
                                src={imagePreview}
                                alt="Preview"
                                className="w-full rounded-lg border border-slate-200"
                            />
                            {!extractedData && (
                                <button
                                    onClick={handleScan}
                                    disabled={isProcessing}
                                    className={cn(
                                        "w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors",
                                        isProcessing
                                            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                            : "bg-blue-600 text-white hover:bg-blue-700"
                                    )}
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            Escaneando... {progress}%
                                        </>
                                    ) : (
                                        <>
                                            <Scan size={18} />
                                            Escanear Recibo
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Right Column: Extracted Data Form */}
                {extractedData && (
                    <div className="bg-white rounded-xl p-6 space-y-6">
                        <div className="flex items-center gap-2 pb-4 border-b border-slate-200">
                            <CheckCircle size={20} className="text-green-600" />
                            <h3 className="font-semibold text-slate-700">Datos Extraídos</h3>
                            <span className="ml-auto text-xs text-slate-500">
                                Confianza: {Math.round(extractedData.confidence)}%
                            </span>
                        </div>

                        <div className="space-y-4">
                            {/* Fecha */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Fecha {formData.fecha ? '✓' : '⚠️'}
                                </label>
                                <input
                                    type="date"
                                    value={formData.fecha}
                                    onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Empresa */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Empresa <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.empresaId}
                                    onChange={(e) => setFormData({ ...formData, empresaId: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Seleccionar...</option>
                                    {empresas.map(e => (
                                        <option key={e.id} value={e.id}>{e.nombre}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Comprador */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Comprador <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.compradorId}
                                    onChange={(e) => setFormData({ ...formData, compradorId: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Seleccionar...</option>
                                    {compradores.map(c => (
                                        <option key={c.id} value={c.id}>{c.nombre}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Número de Tiquete */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Número de Tiquete {formData.numeroTiquete ? '✓' : '⚠️'}
                                </label>
                                <input
                                    type="text"
                                    value={formData.numeroTiquete}
                                    onChange={(e) => setFormData({ ...formData, numeroTiquete: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Kilogramos */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Kilogramos {formData.kilogramos ? '✓' : '⚠️'}
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.kilogramos}
                                    onChange={(e) => setFormData({ ...formData, kilogramos: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Valor Unitario */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Valor Unitario {formData.valorUnitario ? '✓' : '⚠️'}
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.valorUnitario}
                                    onChange={(e) => setFormData({ ...formData, valorUnitario: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Observaciones */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Observaciones
                                </label>
                                <textarea
                                    value={formData.observaciones}
                                    onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Save Button */}
                            <button
                                onClick={handleSave}
                                disabled={isSaving || saveSuccess}
                                className={cn(
                                    "w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors",
                                    saveSuccess
                                        ? "bg-green-600 text-white"
                                        : isSaving
                                            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                            : "bg-blue-600 text-white hover:bg-blue-700"
                                )}
                            >
                                {saveSuccess ? (
                                    <>
                                        <CheckCircle size={18} />
                                        ¡Guardado Exitosamente!
                                    </>
                                ) : isSaving ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        💾 Guardar Tiquete
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Help Text */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-3">
                    <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-900">
                        <p className="font-semibold mb-1">Consejos para mejores resultados:</p>
                        <ul className="list-disc list-inside space-y-1 text-blue-800">
                            <li>Asegúrate de que la imagen esté bien iluminada y enfocada</li>
                            <li>El texto debe ser legible y no estar borroso</li>
                            <li>Revisa siempre los datos extraídos antes de guardar</li>
                            <li>Los campos con ✓ fueron detectados automáticamente</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
