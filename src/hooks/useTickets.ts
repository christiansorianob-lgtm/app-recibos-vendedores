import { useState, useEffect, useMemo } from 'react';
import type { TiqueteFruta, TiqueteInput, Stats } from '../types';
import { storage } from '../lib/storage';
import { v4 as uuidv4 } from 'uuid';

export function useTickets() {
    const [tiquetes, setTiquetes] = useState<TiqueteFruta[]>([]);
    const [filterEmpresa, setFilterEmpresa] = useState('');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');

    // Load initial data
    useEffect(() => {
        setTiquetes(storage.getAll());
    }, []);

    const addTiquete = (input: TiqueteInput) => {
        const valorTotal = input.kilogramos * input.valorUnitario;

        // Validation
        if (tiquetes.some(t => t.numeroTiquete === input.numeroTiquete)) {
            throw new Error(`El número de tiquete ${input.numeroTiquete} ya existe.`);
        }

        const newTiquete: TiqueteFruta = {
            ...input,
            id: uuidv4(),
            valorTotal, // Calculated here
            revisado: false,
        };

        const updated = storage.add(newTiquete);
        setTiquetes(updated);
    };

    const updateTiquete = (id: string, input: Partial<TiqueteFruta>) => {
        const current = tiquetes.find(t => t.id === id);
        if (!current) return;

        // Recalculate if needed
        let valorTotal = current.valorTotal;
        const kilos = input.kilogramos ?? current.kilogramos;
        const unitPrice = input.valorUnitario ?? current.valorUnitario;

        if (input.kilogramos || input.valorUnitario) {
            valorTotal = kilos * unitPrice;
        }

        const updatedTiquete = { ...current, ...input, valorTotal };
        const updated = storage.update(updatedTiquete);
        setTiquetes(updated);
    };

    const toggleRevisado = (id: string) => {
        const tiquete = tiquetes.find(t => t.id === id);
        if (tiquete) {
            updateTiquete(id, { revisado: !tiquete.revisado });
        }
    };

    // Derived state: Stats
    const stats: Stats = useMemo(() => {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        const monthlyTickets = tiquetes.filter(t => {
            const d = new Date(t.fecha);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });

        return {
            tiquetesCount: monthlyTickets.length,
            totalKilogramos: monthlyTickets.reduce((acc, t) => acc + t.kilogramos, 0),
            totalValor: monthlyTickets.reduce((acc, t) => acc + t.valorTotal, 0),
        };
    }, [tiquetes]);

    // Derived state: Filtered List
    const filteredTiquetes = useMemo(() => {
        return tiquetes.filter(t => {
            if (filterEmpresa && t.empresa_id !== filterEmpresa) return false;
            if (filterStartDate && t.fecha < filterStartDate) return false;
            if (filterEndDate && t.fecha > filterEndDate) return false;
            return true;
        }).sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
    }, [tiquetes, filterEmpresa, filterStartDate, filterEndDate]);

    const uniqueEmpresas = useMemo(() => {
        return Array.from(new Set(tiquetes.map(t => t.empresa_id)));
    }, [tiquetes]);

    return {
        tiquetes,
        filteredTiquetes,
        stats,
        addTiquete,
        updateTiquete,
        toggleRevisado,
        filters: {
            empresa: filterEmpresa,
            setEmpresa: setFilterEmpresa,
            startDate: filterStartDate,
            setStartDate: setFilterStartDate,
            endDate: filterEndDate,
            setEndDate: setFilterEndDate,
        },
        uniqueEmpresas
    };
}
