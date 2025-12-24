import type { ReactNode } from 'react';
import { useState, useRef, useEffect } from 'react';
import { Palmtree, LayoutDashboard, Ticket as TicketIcon, Menu, ChevronDown, Building2, UserCheck, Plus, ScanLine } from 'lucide-react';
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

        function handleEsc(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                setIsMenuOpen(false);
                setIsDrawerOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEsc);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEsc);
        };
    }, []);

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        if (isMenuOpen) {
            const originalStyle = window.getComputedStyle(document.body).overflow;
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = originalStyle;
            };
        }
    }, [isMenuOpen]);

    const NavLink = ({ to, icon: Icon, label, exact = false, mobile = false }: { to: string, icon: any, label: string, exact?: boolean, mobile?: boolean }) => {
        const isActive = exact ? location.pathname === to : location.pathname.startsWith(to);
        return (
            <Link
                to={to}
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                    "flex items-center gap-3 px-4 transition-colors font-medium",
                    mobile
                        ? "py-3 text-base rounded-lg w-full"
                        : "py-2 text-sm border-b-2",
                    isActive
                        ? mobile
                            ? "bg-blue-50 text-blue-700"
                            : "border-blue-600 text-blue-700 bg-blue-50/50"
                        : mobile
                            ? "text-slate-600 hover:bg-slate-50"
                            : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                )}
            >
                <Icon size={mobile ? 20 : 16} />
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
                        aria-expanded={isMenuOpen}
                    >
                        <Menu size={20} />
                    </button>

                    <nav className="hidden md:flex items-center gap-1">
                        <NavLink to="/" icon={LayoutDashboard} label="Panel de Control" exact />
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
                                        <span>Empresas</span>
                                    </Link>
                                    <Link
                                        to="/catalogos/compradores"
                                        onClick={() => setIsCatalogOpen(false)}
                                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                    >
                                        <UserCheck size={16} className="text-slate-400" />
                                        <span>Compradores</span>
                                    </Link>
                                    <div className="border-t border-slate-100 my-1"></div>
                                    <Link
                                        to="/catalogos/lector-recibos"
                                        onClick={() => setIsCatalogOpen(false)}
                                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                    >
                                        <ScanLine size={16} className="text-slate-400" />
                                        <span>Lector de Recibos</span>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </nav>
                </div>
                {/* Mobile navigation drawer/overlay */}
                {isMenuOpen && (
                    <div
                        className="fixed inset-0 z-[9998] md:hidden"
                        role="dialog"
                        aria-modal="true"
                    >
                        {/* Overlay */}
                        <div
                            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
                            onClick={() => setIsMenuOpen(false)}
                        />

                        {/* Drawer */}
                        <aside className="fixed left-0 top-0 h-screen w-[80vw] max-w-[360px] bg-white shadow-2xl flex flex-col animate-in slide-in-from-left duration-300 z-[9999]">
                            {/* Drawer Header */}
                            <div className="px-4 h-14 border-b border-slate-100 flex items-center justify-between shrink-0">
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
                                    <Plus className="rotate-45" size={24} />
                                </button>
                            </div>

                            {/* Nav Area (Scrollable) */}
                            {/* min-h-0 is essential for overflow-y-auto to work in a flex column */}
                            <nav className="flex-1 min-h-0 overflow-y-auto p-3 flex flex-col gap-1 custom-scrollbar">
                                <NavLink to="/" icon={LayoutDashboard} label="Panel de Control" exact mobile />
                                <NavLink to="/tickets" icon={TicketIcon} label="Tiquetes" mobile />
                                <NavLink to="/nuevo" icon={Plus} label="Nuevo Tiquete" mobile />

                                <div className="mt-4 pt-4 border-t border-slate-100">
                                    <span className="px-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Catálogos</span>
                                    <div className="flex flex-col gap-1">
                                        <NavLink to="/catalogos/empresas" icon={Building2} label="Empresas" mobile />
                                        <NavLink to="/catalogos/compradores" icon={UserCheck} label="Compradores" mobile />
                                        <div className="border-t border-slate-100 my-1"></div>
                                        <NavLink to="/catalogos/lector-recibos" icon={ScanLine} label="Lector de Recibos" mobile />
                                    </div>
                                </div>
                            </nav>

                            {/* Drawer Footer */}
                            <div className="p-4 border-t border-slate-100 bg-slate-50 shrink-0">
                                <div className="flex items-center gap-3 px-3 py-2">
                                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-sm font-bold border border-blue-200">
                                        AD
                                    </div>
                                    <div className="flex flex-col text-left">
                                        <span className="text-sm font-bold text-slate-700 leading-tight">Administrador</span>
                                        <span className="text-[11px] text-slate-500">Enterprise Edition</span>
                                    </div>
                                </div>
                            </div>
                        </aside>
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

