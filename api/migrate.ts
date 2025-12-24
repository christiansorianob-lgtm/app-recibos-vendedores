import { sql } from '@vercel/postgres';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';

// Schemas de validación
const migrateDataSchema = z.object({
    empresas: z.array(z.object({
        id: z.string(),
        nombre: z.string(),
        activo: z.boolean(),
        createdAt: z.string(),
    })),
    compradores: z.array(z.object({
        id: z.string(),
        nombre: z.string(),
        empresaId: z.string().optional(),
        activo: z.boolean(),
        createdAt: z.string(),
    })),
    tiquetes: z.array(z.object({
        id: z.string(),
        fecha: z.string(),
        empresa_id: z.string(),
        comprador_id: z.string(),
        numeroTiquete: z.string(),
        kilogramos: z.number(),
        valorUnitario: z.number(),
        valorTotal: z.number(),
        revisado: z.boolean(),
        observaciones: z.string().optional(),
        fotografiaTiquete: z.string().optional(),
    })),
});

export default async function handler(
    req: VercelRequest,
    res: VercelResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    try {
        const validation = migrateDataSchema.safeParse(req.body);

        if (!validation.success) {
            return res.status(400).json({
                error: 'Datos inválidos',
                details: validation.error.issues
            });
        }

        const { empresas, compradores, tiquetes } = validation.data;

        const results = {
            empresas: { inserted: 0, skipped: 0, errors: [] as string[] },
            compradores: { inserted: 0, skipped: 0, errors: [] as string[] },
            tiquetes: { inserted: 0, skipped: 0, errors: [] as string[] },
        };

        // Migrar Empresas
        for (const empresa of empresas) {
            try {
                // Verificar si ya existe
                const existing = await sql`
          SELECT id FROM empresas WHERE id = ${empresa.id}
        `;

                if (existing.rows.length > 0) {
                    results.empresas.skipped++;
                    continue;
                }

                await sql`
          INSERT INTO empresas (id, nombre, activo, created_at)
          VALUES (
            ${empresa.id}::uuid, 
            ${empresa.nombre}, 
            ${empresa.activo}, 
            ${empresa.createdAt}::timestamp
          )
        `;
                results.empresas.inserted++;
            } catch (error) {
                results.empresas.errors.push(
                    `Error en empresa ${empresa.nombre}: ${error instanceof Error ? error.message : 'Unknown'}`
                );
            }
        }

        // Migrar Compradores
        for (const comprador of compradores) {
            try {
                // Verificar si ya existe
                const existing = await sql`
          SELECT id FROM compradores WHERE id = ${comprador.id}
        `;

                if (existing.rows.length > 0) {
                    results.compradores.skipped++;
                    continue;
                }

                await sql`
          INSERT INTO compradores (id, nombre, empresa_id, activo, created_at)
          VALUES (
            ${comprador.id}::uuid, 
            ${comprador.nombre}, 
            ${comprador.empresaId ? `${comprador.empresaId}::uuid` : null}, 
            ${comprador.activo}, 
            ${comprador.createdAt}::timestamp
          )
        `;
                results.compradores.inserted++;
            } catch (error) {
                results.compradores.errors.push(
                    `Error en comprador ${comprador.nombre}: ${error instanceof Error ? error.message : 'Unknown'}`
                );
            }
        }

        // Migrar Tiquetes
        for (const tiquete of tiquetes) {
            try {
                // Verificar si ya existe
                const existing = await sql`
          SELECT id FROM tiquetes WHERE id = ${tiquete.id}
        `;

                if (existing.rows.length > 0) {
                    results.tiquetes.skipped++;
                    continue;
                }

                await sql`
          INSERT INTO tiquetes (
            id, 
            fecha, 
            empresa_id, 
            comprador_id, 
            numero_tiquete, 
            kilogramos, 
            valor_unitario, 
            valor_total, 
            revisado, 
            observaciones, 
            fotografia_tiquete
          )
          VALUES (
            ${tiquete.id}::uuid,
            ${tiquete.fecha}::date,
            ${tiquete.empresa_id}::uuid,
            ${tiquete.comprador_id}::uuid,
            ${tiquete.numeroTiquete},
            ${tiquete.kilogramos},
            ${tiquete.valorUnitario},
            ${tiquete.valorTotal},
            ${tiquete.revisado},
            ${tiquete.observaciones || null},
            ${tiquete.fotografiaTiquete || null}
          )
        `;
                results.tiquetes.inserted++;
            } catch (error) {
                results.tiquetes.errors.push(
                    `Error en tiquete ${tiquete.numeroTiquete}: ${error instanceof Error ? error.message : 'Unknown'}`
                );
            }
        }

        return res.status(200).json({
            success: true,
            message: 'Migración completada',
            results,
        });

    } catch (error) {
        console.error('Error en migración:', error);
        return res.status(500).json({
            error: 'Error interno del servidor',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
