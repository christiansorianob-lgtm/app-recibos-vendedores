import { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Edit2, Save, X, Building2 } from 'lucide-react';
import { catalogs } from '../../lib/catalogs';
import type { Empresa } from '../../types';

export function EmpresasPage() {
    const [empresas, setEmpresas] = useState<Empresa[]>([]);
    const [search, setSearch] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ nombre: '' });
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadEmpresas();
    }, []);

    const loadEmpresas = () => {
        setEmpresas(catalogs.getEmpresas());
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
    };

    const filteredEmpresas = empresas.filter(e =>
        e.nombre.toLowerCase().includes(search.toLowerCase())
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!formData.nombre.trim()) return;

        try {
            if (editingId) {
                catalogs.updateEmpresa(editingId, { nombre: formData.nombre });
                setEditingId(null);
            } else {
                catalogs.addEmpresa(formData.nombre);
                setIsCreating(false);
            }
            setFormData({ nombre: '' });
            loadEmpresas();
        } catch (err: any) {
            setError(err.message);
        }
    };

    const startEdit = (empresa: Empresa) => {
        setEditingId(empresa.id);
        setFormData({ nombre: empresa.nombre });
        setIsCreating(false);
        setError(null);
    };

    const handleDelete = (id: string) => {
        if (confirm('¿Está seguro de eliminar esta empresa?')) {
            catalogs.deleteEmpresa(id);
            loadEmpresas();
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Building2 className="text-blue-600" />
                        Empresas
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">Gestione el catálogo de empresas y fincas.</p>
                </div>
                <button
                    onClick={() => {
                        setIsCreating(true);
                        setEditingId(null);
                        setFormData({ nombre: '' });
                    }}
                    className="btn bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm"
                >
                    <Plus size={18} />
                    Nueva Empresa
                </button>
            </div>

            {(isCreating || editingId) && (
                <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm mb-6 animate-in fade-in slide-in-from-top-2">
                    <h3 className="font-semibold text-slate-800 mb-4">
                        {editingId ? 'Editar Empresa' : 'Nueva Empresa'}
                    </h3>
                    <form onSubmit={handleSubmit} className="flex gap-4 items-start">
                        <div className="flex-1 space-y-2">
                            <input
                                type="text"
                                value={formData.nombre}
                                onChange={(e) => setFormData({ nombre: e.target.value })}
                                className="input-field w-full px-3 py-2 border rounded-md"
                                placeholder="Nombre de la empresa"
                                autoFocus
                            />
                            {error && <p className="text-sm text-red-600">{error}</p>}
                        </div>
                        <div className="flex gap-2">
                            <button type="submit" className="p-2 bg-green-600 text-white rounded hover:bg-green-700">
                                <Save size={20} />
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsCreating(false);
                                    setEditingId(null);
                                    setError(null);
                                }}
                                className="p-2 bg-slate-200 text-slate-600 rounded hover:bg-slate-300"
                            >
                                <X size={20} />
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
                            placeholder="Buscar empresas..."
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
                                <th className="px-6 py-3">Estado</th>
                                <th className="px-6 py-3 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredEmpresas.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                                        No se encontraron empresas.
                                    </td>
                                </tr>
                            ) : (
                                filteredEmpresas.map((empresa) => (
                                    <tr key={empresa.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-3 font-medium text-slate-900">{empresa.nombre}</td>
                                        <td className="px-6 py-3">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${empresa.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {empresa.activo ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => startEdit(empresa)}
                                                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(empresa.id)}
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
