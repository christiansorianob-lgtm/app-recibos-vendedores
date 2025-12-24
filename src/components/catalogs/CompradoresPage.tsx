import { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Edit2, Save, UserCheck } from 'lucide-react';
import { catalogs } from '../../lib/catalogs';
import type { Comprador, Empresa } from '../../types';

export function CompradoresPage() {
    const [compradores, setCompradores] = useState<Comprador[]>([]);
    const [empresas, setEmpresas] = useState<Empresa[]>([]);
    const [search, setSearch] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ nombre: '', empresaId: '' });
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        setCompradores(catalogs.getCompradores());
        setEmpresas(catalogs.getEmpresas());
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
    };

    const filteredCompradores = compradores.filter(c =>
        c.nombre.toLowerCase().includes(search.toLowerCase())
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!formData.nombre.trim()) return;

        try {
            if (editingId) {
                catalogs.updateComprador(editingId, {
                    nombre: formData.nombre,
                    empresaId: formData.empresaId || undefined
                });
                setEditingId(null);
            } else {
                catalogs.addComprador(formData.nombre, formData.empresaId || undefined);
                setIsCreating(false);
            }
            setFormData({ nombre: '', empresaId: '' });
            loadData();
        } catch (err: any) {
            setError(err.message);
        }
    };

    const startEdit = (comprador: Comprador) => {
        setEditingId(comprador.id);
        setFormData({
            nombre: comprador.nombre,
            empresaId: comprador.empresaId || ''
        });
        setIsCreating(false);
        setError(null);
    };

    const handleDelete = (id: string) => {
        if (confirm('¿Está seguro de eliminar este comprador?')) {
            catalogs.deleteComprador(id);
            loadData();
        }
    };

    const getEmpresaName = (id?: string) => {
        if (!id) return '-';
        return empresas.find(e => e.id === id)?.nombre || '(Desconocida)';
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <UserCheck className="text-blue-600" />
                        Compradores
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">Gestione el catálogo de compradores.</p>
                </div>
                <button
                    onClick={() => {
                        setIsCreating(true);
                        setEditingId(null);
                        setFormData({ nombre: '', empresaId: '' });
                    }}
                    className="btn bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm"
                >
                    <Plus size={18} />
                    Nuevo Comprador
                </button>
            </div>

            {(isCreating || editingId) && (
                <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm mb-6 animate-in fade-in slide-in-from-top-2">
                    <h3 className="font-semibold text-slate-800 mb-4">
                        {editingId ? 'Editar Comprador' : 'Nuevo Comprador'}
                    </h3>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Nombre</label>
                                <input
                                    type="text"
                                    value={formData.nombre}
                                    onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                                    className="input-field w-full px-3 py-2 border rounded-md"
                                    placeholder="Nombre del comprador"
                                    autoFocus
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Empresa Asociada (Opcional)</label>
                                <select
                                    value={formData.empresaId}
                                    onChange={(e) => setFormData(prev => ({ ...prev, empresaId: e.target.value }))}
                                    className="input-field w-full px-3 py-2 border rounded-md bg-white"
                                >
                                    <option value="">- Ninguna (Global) -</option>
                                    {empresas.map(e => (
                                        <option key={e.id} value={e.id}>{e.nombre}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {error && <p className="text-sm text-red-600">{error}</p>}

                        <div className="flex gap-2 justify-end mt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsCreating(false);
                                    setEditingId(null);
                                    setError(null);
                                }}
                                className="btn border border-slate-300 text-slate-600 hover:bg-slate-50"
                            >
                                Cancelar
                            </button>
                            <button type="submit" className="btn bg-blue-600 text-white hover:bg-blue-700 shadow-sm">
                                <Save size={18} className="mr-2" />
                                Guardar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-2.5 text-slate-400 h-4 w-4" />
                        <input
                            type="text"
                            placeholder="Buscar compradores..."
                            value={search}
                            onChange={handleSearch}
                            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3">Nombre</th>
                                <th className="px-6 py-3">Empresa Asociada</th>
                                <th className="px-6 py-3">Estado</th>
                                <th className="px-6 py-3 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredCompradores.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                                        No se encontraron compradores.
                                    </td>
                                </tr>
                            ) : (
                                filteredCompradores.map((comprador) => (
                                    <tr key={comprador.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-3 font-medium text-slate-900">{comprador.nombre}</td>
                                        <td className="px-6 py-3 text-slate-500">{getEmpresaName(comprador.empresaId)}</td>
                                        <td className="px-6 py-3">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${comprador.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {comprador.activo ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => startEdit(comprador)}
                                                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(comprador.id)}
                                                    className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
