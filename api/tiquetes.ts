import { sql } from '@vercel/postgres';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';

// Validation schemas
const tiqueteSchema = z.object({
    fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    empresaId: z.string().uuid(),
    compradorId: z.string().uuid(),
    numeroTiquete: z.string().min(1).max(50),
    kilogramos: z.number().positive(),
    valorUnitario: z.number().positive(),
    observaciones: z.string().optional(),
    fotografiaTiquete: z.string().optional(),
});

const updateTiqueteSchema = z.object({
    id: z.string().uuid(),
    fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    empresaId: z.string().uuid().optional(),
    compradorId: z.string().uuid().optional(),
    numeroTiquete: z.string().min(1).max(50).optional(),
    kilogramos: z.number().positive().optional(),
    valorUnitario: z.number().positive().optional(),
    revisado: z.boolean().optional(),
    observaciones: z.string().optional(),
    fotografiaTiquete: z.string().optional(),
});

export default async function handler(
    req: VercelRequest,
    res: VercelResponse
) {
    try {
        // GET - Listar tiquetes o obtener uno específico
        if (req.method === 'GET') {
            const { id } = req.query;

            // Obtener un tiquete específico
            if (id && typeof id === 'string') {
                const result = await sql`
          SELECT 
            t.id,
            t.fecha,
            t.empresa_id as "empresaId",
            t.comprador_id as "compradorId",
            t.numero_tiquete as "numeroTiquete",
            t.kilogramos,
            t.valor_unitario as "valorUnitario",
            t.valor_total as "valorTotal",
            t.revisado,
            t.observaciones,
            t.fotografia_tiquete as "fotografiaTiquete",
            t.created_at as "createdAt",
            e.nombre as "empresaNombre",
            c.nombre as "compradorNombre"
          FROM tiquetes t
          LEFT JOIN empresas e ON t.empresa_id = e.id
          LEFT JOIN compradores c ON t.comprador_id = c.id
          WHERE t.id = ${id}
        `;

                if (result.rows.length === 0) {
                    return res.status(404).json({ error: 'Tiquete no encontrado' });
                }

                return res.status(200).json(result.rows[0]);
            }

            // Listar todos los tiquetes
            const result = await sql`
        SELECT 
          t.id,
          t.fecha,
          t.empresa_id as "empresaId",
          t.comprador_id as "compradorId",
          t.numero_tiquete as "numeroTiquete",
          t.kilogramos,
          t.valor_unitario as "valorUnitario",
          t.valor_total as "valorTotal",
          t.revisado,
          t.observaciones,
          t.fotografia_tiquete as "fotografiaTiquete",
          t.created_at as "createdAt",
          e.nombre as "empresaNombre",
          c.nombre as "compradorNombre"
        FROM tiquetes t
        LEFT JOIN empresas e ON t.empresa_id = e.id
        LEFT JOIN compradores c ON t.comprador_id = c.id
        ORDER BY t.fecha DESC, t.created_at DESC
      `;

            return res.status(200).json(result.rows);
        }

        // POST - Crear nuevo tiquete
        if (req.method === 'POST') {
            const validation = tiqueteSchema.safeParse(req.body);

            if (!validation.success) {
                return res.status(400).json({
                    error: 'Datos inválidos',
                    details: validation.error.issues
                });
            }

            const {
                fecha,
                empresaId,
                compradorId,
                numeroTiquete,
                kilogramos,
                valorUnitario,
                observaciones,
                fotografiaTiquete
            } = validation.data;

            // Calcular valor total
            const valorTotal = kilogramos * valorUnitario;

            // Verificar que empresa y comprador existen
            const empresa = await sql`SELECT id FROM empresas WHERE id = ${empresaId}`;
            if (empresa.rows.length === 0) {
                return res.status(404).json({ error: 'Empresa no encontrada' });
            }

            const comprador = await sql`SELECT id FROM compradores WHERE id = ${compradorId}`;
            if (comprador.rows.length === 0) {
                return res.status(404).json({ error: 'Comprador no encontrado' });
            }

            // Insertar nuevo tiquete
            const result = await sql`
        INSERT INTO tiquetes (
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
          ${fecha}, 
          ${empresaId}, 
          ${compradorId}, 
          ${numeroTiquete}, 
          ${kilogramos}, 
          ${valorUnitario}, 
          ${valorTotal},
          false,
          ${observaciones || null},
          ${fotografiaTiquete || null}
        )
        RETURNING 
          id,
          fecha,
          empresa_id as "empresaId",
          comprador_id as "compradorId",
          numero_tiquete as "numeroTiquete",
          kilogramos,
          valor_unitario as "valorUnitario",
          valor_total as "valorTotal",
          revisado,
          observaciones,
          fotografia_tiquete as "fotografiaTiquete",
          created_at as "createdAt"
      `;

            return res.status(201).json(result.rows[0]);
        }

        // PUT - Actualizar tiquete
        if (req.method === 'PUT') {
            const validation = updateTiqueteSchema.safeParse(req.body);

            if (!validation.success) {
                return res.status(400).json({
                    error: 'Datos inválidos',
                    details: validation.error.issues
                });
            }

            const { id, ...updates } = validation.data;

            // Obtener tiquete actual para calcular valor total si es necesario
            const current = await sql`SELECT * FROM tiquetes WHERE id = ${id}`;
            if (current.rows.length === 0) {
                return res.status(404).json({ error: 'Tiquete no encontrado' });
            }

            const currentData = current.rows[0];

            // Calcular nuevo valor total si cambian kilogramos o valor unitario
            const newKilogramos = updates.kilogramos ?? currentData.kilogramos;
            const newValorUnitario = updates.valorUnitario ?? currentData.valor_unitario;
            const valorTotal = newKilogramos * newValorUnitario;

            // Verificar empresa y comprador si se actualizan
            if (updates.empresaId) {
                const empresa = await sql`SELECT id FROM empresas WHERE id = ${updates.empresaId}`;
                if (empresa.rows.length === 0) {
                    return res.status(404).json({ error: 'Empresa no encontrada' });
                }
            }

            if (updates.compradorId) {
                const comprador = await sql`SELECT id FROM compradores WHERE id = ${updates.compradorId}`;
                if (comprador.rows.length === 0) {
                    return res.status(404).json({ error: 'Comprador no encontrado' });
                }
            }

            // Construir query dinámicamente
            const updateFields: string[] = [];
            const values: any[] = [];
            let paramIndex = 1;

            if (updates.fecha !== undefined) {
                updateFields.push(`fecha = $${paramIndex++}`);
                values.push(updates.fecha);
            }

            if (updates.empresaId !== undefined) {
                updateFields.push(`empresa_id = $${paramIndex++}`);
                values.push(updates.empresaId);
            }

            if (updates.compradorId !== undefined) {
                updateFields.push(`comprador_id = $${paramIndex++}`);
                values.push(updates.compradorId);
            }

            if (updates.numeroTiquete !== undefined) {
                updateFields.push(`numero_tiquete = $${paramIndex++}`);
                values.push(updates.numeroTiquete);
            }

            if (updates.kilogramos !== undefined) {
                updateFields.push(`kilogramos = $${paramIndex++}`);
                values.push(updates.kilogramos);
            }

            if (updates.valorUnitario !== undefined) {
                updateFields.push(`valor_unitario = $${paramIndex++}`);
                values.push(updates.valorUnitario);
            }

            // Siempre actualizar valor_total si cambian kilogramos o valor unitario
            if (updates.kilogramos !== undefined || updates.valorUnitario !== undefined) {
                updateFields.push(`valor_total = $${paramIndex++}`);
                values.push(valorTotal);
            }

            if (updates.revisado !== undefined) {
                updateFields.push(`revisado = $${paramIndex++}`);
                values.push(updates.revisado);
            }

            if (updates.observaciones !== undefined) {
                updateFields.push(`observaciones = $${paramIndex++}`);
                values.push(updates.observaciones);
            }

            if (updates.fotografiaTiquete !== undefined) {
                updateFields.push(`fotografia_tiquete = $${paramIndex++}`);
                values.push(updates.fotografiaTiquete);
            }

            if (updateFields.length === 0) {
                return res.status(400).json({ error: 'No hay campos para actualizar' });
            }

            values.push(id);

            const result = await sql.query(
                `UPDATE tiquetes 
         SET ${updateFields.join(', ')} 
         WHERE id = $${paramIndex}
         RETURNING 
           id,
           fecha,
           empresa_id as "empresaId",
           comprador_id as "compradorId",
           numero_tiquete as "numeroTiquete",
           kilogramos,
           valor_unitario as "valorUnitario",
           valor_total as "valorTotal",
           revisado,
           observaciones,
           fotografia_tiquete as "fotografiaTiquete",
           created_at as "createdAt"`,
                values
            );

            return res.status(200).json(result.rows[0]);
        }

        // DELETE - Eliminar tiquete
        if (req.method === 'DELETE') {
            const { id } = req.query;

            if (!id || typeof id !== 'string') {
                return res.status(400).json({ error: 'ID requerido' });
            }

            const result = await sql`
        DELETE FROM tiquetes WHERE id = ${id}
        RETURNING id
      `;

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Tiquete no encontrado' });
            }

            return res.status(200).json({ success: true, id: result.rows[0].id });
        }

        return res.status(405).json({ error: 'Método no permitido' });

    } catch (error) {
        console.error('Error en /api/tiquetes:', error);
        return res.status(500).json({
            error: 'Error interno del servidor',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
