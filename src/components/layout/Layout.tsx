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
        <div className="flex flex-col h-screen bg-enterprise-gradient font-sans text-slate-900 overflow-hidden">

            {/* Enterprise Header */}
            <header className="h-14 bg-white/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-4 lg:px-6 shrink-0 z-50 shadow-lg">

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
                        className="md:hidden flex items-center p-2"
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
                {/* Mobile navigation drawer */}
                {isMenuOpen && (
                    <div className="fixed inset-0 z-40 bg-black bg-opacity-30" onClick={() => setIsMenuOpen(false)}>
                        <div className="absolute left-0 top-0 h-full w-64 bg-white shadow-lg p-4 flex flex-col gap-2" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center gap-2 mb-4 px-2">
                                <Palmtree className="text-blue-600 h-5 w-5" />
                                <span className="font-bold text-lg text-slate-800">Menú</span>
                            </div>
                            <NavLink to="/" icon={LayoutDashboard} label="Planning Grid" exact />
                            <NavLink to="/tickets" icon={TicketIcon} label="Tiquetes" />
                            <NavLink to="/nuevo" icon={Plus} label="Nuevo Tiquete" />

                            <div className="mt-4 pt-4 border-t border-slate-100">
                                <span className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Catálogos</span>
                                <div className="mt-2 space-y-1">
                                    <NavLink to="/catalogos/empresas" icon={Building2} label="Empresas" />
                                    <NavLink to="/catalogos/compradores" icon={UserCheck} label="Compradores" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Center: Global Context Filters (The 'Grid' Controls) */}
                <div className="hidden md:flex items-center gap-3 bg-slate-50 p-1 rounded-lg border border-slate-200">
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
                    {/* Placeholder for user profile or simple actions if needed later */}
                    {/* Right panel toggle for mobile */}
                    {rightPanel && (
                        <button
                            className="md:hidden flex items-center p-2 text-blue-600"
                            onClick={() => setIsDrawerOpen(true)}
                            aria-label="Open side panel"
                        >
                            <LayoutDashboard size={20} />
                        </button>
                    )}
                    <div className="h-8 w-8 bg-slate-100 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 text-xs font-bold">
                        AD
                    </div>
                </div>
            </header>


            {/* Main Workspace */}
            <div className="flex-1 flex overflow-hidden">
                <main className="flex-1 overflow-y-auto relative p-4 md:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>

                {/* Right Panel */}
                {rightPanel && (
                    <>
                        {/* Side panel for md+ */}
                        <aside className="hidden md:block w-[350px] border-l border-white/10 bg-white/90 backdrop-blur-md shadow-2xl z-40 overflow-y-auto animate-in slide-in-from-right-10 duration-300">
                            {rightPanel}
                        </aside>
                        {/* Overlay drawer for small screens */}
                        {isDrawerOpen && (
                            <div className="fixed inset-0 z-50 flex">
                                <div className="flex-1 bg-black bg-opacity-30" onClick={() => setIsDrawerOpen(false)} />
                                <aside className="w-[350px] border-l border-slate-200 bg-white shadow-xl overflow-y-auto animate-in slide-in-from-right-10 duration-300">
                                    {rightPanel}
                                </aside>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

