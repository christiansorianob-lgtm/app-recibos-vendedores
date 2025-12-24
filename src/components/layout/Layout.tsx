import type { ReactNode } from 'react';
import { useState, useRef, useEffect } from 'react';
import { Palmtree, LayoutDashboard, Ticket as TicketIcon, Menu, ChevronDown, Building2, UserCheck, Plus } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
    children: ReactNode;
    rightPanel?: ReactNode;
}

export function Layout({ children, rightPanel }: LayoutProps) {
    const [year, setYear] = useState('2025');
    const [period, setPeriod] = useState('Anual');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isCatalogOpen, setIsCatalogOpen] = useState(false);
    const location = useLocation();
    const catalogRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (catalogRef.current && !catalogRef.current.contains(event.target as Node)) {
                setIsCatalogOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const NavLink = ({ to, icon: Icon, label, exact = false }: { to: string, icon: any, label: string, exact?: boolean }) => {
        const isActive = exact ? location.pathname === to : location.pathname.startsWith(to);
        return (
            <Link
                to={to}
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                    "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2",
                    isActive
                        ? "border-blue-600 text-blue-700 bg-blue-50/50"
                        : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                )}
            >
                <Icon size={16} />
                <span>{label}</span>
            </Link>
        );
    };

    return (
        <div className="min-h-screen flex flex-col bg-enterprise-gradient font-sans text-slate-900">

            {/* Enterprise Header */}
            <header className="sticky top-0 h-14 bg-white/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-4 lg:px-6 shrink-0 z-50 shadow-lg">

                {/* Left: Branding & Main Nav */}
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2">
                        <div className="bg-blue-600 p-1.5 rounded-md">
                            <Palmtree className="text-white h-4 w-4" />
                        </div>
                        <span className="font-bold text-lg tracking-tight text-slate-800">Control Palma</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 uppercase tracking-wide">Enterprise</span>
                    </div>
                    {/* Mobile menu button */}
                    <button
                        className="md:hidden flex items-center p-2 text-slate-600 hover:text-blue-600 transition-colors"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Toggle navigation menu"
                    >
                        <Menu size={20} />
                    </button>

                    <nav className="hidden md:flex items-center gap-1">
                        <NavLink to="/" icon={LayoutDashboard} label="Planning Grid" exact />
                        <NavLink to="/tickets" icon={TicketIcon} label="Tiquetes" />

                        {/* Catálogos Dropdown */}
                        <div className="relative" ref={catalogRef}>
                            <button
                                onClick={() => setIsCatalogOpen(!isCatalogOpen)}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2",
                                    location.pathname.startsWith('/catalogos')
                                        ? "border-blue-600 text-blue-700 bg-blue-50/50"
                                        : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                                )}
                            >
                                <Building2 size={16} />
                                <span>Catálogos</span>
                                <ChevronDown size={14} className={cn("transition-transform duration-200", isCatalogOpen && "rotate-180")} />
                            </button>

                            {isCatalogOpen && (
                                <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-[60] animate-in fade-in slide-in-from-top-1">
                                    <Link
                                        to="/catalogos/empresas"
                                        onClick={() => setIsCatalogOpen(false)}
                                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                    >
                                        <Building2 size={16} className="text-slate-400" />
                                        <span>Empresas / Fincas</span>
                                    </Link>
                                    <Link
                                        to="/catalogos/compradores"
                                        onClick={() => setIsCatalogOpen(false)}
                                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                    >
                                        <UserCheck size={16} className="text-slate-400" />
                                        <span>Compradores</span>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </nav>
                </div>
                {/* Mobile navigation drawer/overlay */}
                {isMenuOpen && (
                    <div className="fixed inset-0 z-[100] md:hidden">
                        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
                        <div className="absolute left-0 top-0 h-full w-72 bg-white shadow-2xl flex flex-col animate-in slide-in-from-left-10 duration-300">
                            {/* Menu Header with Brand */}
                            <div className="p-6 h-14 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="bg-blue-600 p-1.5 rounded-md">
                                        <Palmtree className="text-white h-4 w-4" />
                                    </div>
                                    <span className="font-bold text-lg text-slate-800">Control Palma</span>
                                </div>
                                <button
                                    onClick={() => setIsMenuOpen(false)}
                                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                                >
                                    <Plus className="rotate-45" size={22} />
                                </button>
                            </div>

                            {/* Menu Links */}
                            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-0.5">
                                <NavLink to="/" icon={LayoutDashboard} label="Planning Grid" exact />
                                <NavLink to="/tickets" icon={TicketIcon} label="Tiquetes" />
                                <NavLink to="/nuevo" icon={Plus} label="Nuevo Tiquete" />

                                <div className="mt-6 pt-6 border-t border-slate-100">
                                    <span className="px-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-4">Catálogos</span>
                                    <div className="flex flex-col gap-0.5">
                                        <NavLink to="/catalogos/empresas" icon={Building2} label="Empresas / Fincas" />
                                        <NavLink to="/catalogos/compradores" icon={UserCheck} label="Compradores" />
                                    </div>
                                </div>
                            </div>

                            {/* Profile Section Footer */}
                            <div className="p-4 border-t border-slate-100 bg-slate-50">
                                <div className="flex items-center gap-3 px-3 py-1.5">
                                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-xs font-bold">
                                        AD
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-slate-700">Administrador</span>
                                        <span className="text-[10px] text-slate-500">Enterprise Edition</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Center: Global Context Filters - Hidden on small screens */}
                <div className="hidden lg:flex items-center gap-3 bg-slate-50 p-1 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-2 px-3 py-1 border-r border-slate-200">
                        <span className="text-xs font-semibold text-slate-400 uppercase">País</span>
                        <span className="text-sm font-medium text-slate-700">Colombia</span>
                    </div>

                    <div className="flex items-center gap-2 px-2">
                        <span className="text-xs text-slate-500">Año:</span>
                        <select
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            className="bg-transparent text-sm font-semibold text-slate-700 focus:outline-none cursor-pointer hover:text-blue-600"
                        >
                            <option value="2025">2025</option>
                            <option value="2024">2024</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2 px-2">
                        <span className="text-xs text-slate-500">Periodo:</span>
                        <select
                            value={period}
                            onChange={(e) => setPeriod(e.target.value)}
                            className="bg-transparent text-sm font-semibold text-slate-700 focus:outline-none cursor-pointer hover:text-blue-600"
                        >
                            <option value="Anual">Anual</option>
                            <option value="Q1">Q1</option>
                            <option value="Q2">Q2</option>
                        </select>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-3">
                    {rightPanel && (
                        <button
                            className="md:hidden flex items-center p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            onClick={() => setIsDrawerOpen(true)}
                            aria-label="Open side panel"
                        >
                            <LayoutDashboard size={20} />
                        </button>
                    )}
                    <div className="h-8 w-8 bg-blue-100 rounded-full border border-blue-200 flex items-center justify-center text-blue-700 text-xs font-bold">
                        AD
                    </div>
                </div>
            </header>


            {/* Main Workspace */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                <main className="flex-1 overflow-y-auto relative p-4 md:p-6 lg:p-8 custom-scrollbar">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>

                {/* Right Panel */}
                {rightPanel && (
                    <>
                        {/* Side panel for md+ */}
                        <aside className="hidden md:block w-96 border-l border-slate-200 bg-white shadow-xl z-40 overflow-y-auto animate-in slide-in-from-right-10 duration-300">
                            {rightPanel}
                        </aside>
                        {/* Overlay drawer for small screens */}
                        {isDrawerOpen && (
                            <div className="fixed inset-0 z-[70] flex md:hidden">
                                <div className="flex-1 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)} />
                                <aside className="w-[350px] max-w-[90vw] bg-white shadow-2xl overflow-y-auto animate-in slide-in-from-right-10 duration-300">
                                    <div className="h-14 border-b border-slate-100 flex items-center justify-between px-6 bg-slate-50">
                                        <span className="font-bold text-slate-700">Detalles</span>
                                        <button onClick={() => setIsDrawerOpen(false)} className="p-2 text-slate-400 hover:text-slate-600">
                                            <Plus className="rotate-45" size={24} />
                                        </button>
                                    </div>
                                    <div className="flex-1">
                                        {rightPanel}
                                    </div>
                                </aside>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

