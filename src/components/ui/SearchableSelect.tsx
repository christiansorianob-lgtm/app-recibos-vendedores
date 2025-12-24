import { useState, useRef, useEffect, useMemo } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

interface SearchableSelectProps {
    options: { value: string; label: string }[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
    className?: string;
    disabled?: boolean;
    required?: boolean;
    name?: string;
}

export function SearchableSelect({
    options,
    value,
    onChange,
    placeholder = "Seleccionar...",
    label,
    className,
    disabled = false
}: SearchableSelectProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Filter options
    const filteredOptions = useMemo(() => {
        if (!search) return options;
        return options.filter(option =>
            option.label.toLowerCase().includes(search.toLowerCase())
        );
    }, [options, search]);

    const selectedLabel = options.find(o => o.value === value)?.label || value;

    const handleSelect = (val: string) => {
        onChange(val);
        setOpen(false);
        setSearch("");
    };

    return (
        <div className={cn("relative", className)} ref={containerRef}>
            {label && <label className="text-sm font-medium text-slate-700 mb-1 block">{label}</label>}

            <div
                className={cn(
                    "flex items-center justify-between w-full border border-slate-300 rounded-md bg-white px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent cursor-pointer",
                    disabled && "opacity-50 cursor-not-allowed bg-slate-100"
                )}
                onClick={() => !disabled && setOpen(!open)}
            >
                <span className={cn("block truncate", !value && "text-slate-500")}>
                    {value ? selectedLabel : placeholder}
                </span>
                <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
            </div>

            {open && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-60 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-2 border-b border-slate-100">
                        <input
                            ref={inputRef}
                            type="text"
                            className="w-full px-2 py-1 text-sm bg-slate-50 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Buscar..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                    <div className="overflow-y-auto flex-1">
                        {filteredOptions.length === 0 ? (
                            <div className="py-6 text-center text-sm text-slate-500">
                                No se encontraron resultados.
                            </div>
                        ) : (
                            <ul className="py-1">
                                {filteredOptions.map((option) => (
                                    <li
                                        key={option.value}
                                        className={cn(
                                            "relative cursor-default select-none py-2 pl-3 pr-9 hover:bg-slate-50 text-slate-900 text-sm",
                                            value === option.value && "bg-blue-50 text-blue-700"
                                        )}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleSelect(option.value);
                                        }}
                                    >
                                        <span className="block truncate">{option.label}</span>
                                        {value === option.value && (
                                            <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600">
                                                <Check className="h-4 w-4" />
                                            </span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
