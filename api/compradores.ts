import { sql } from '@vercel/postgres';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';

// Validation schemas
const compradorSchema = z.object({
    nombre: z.string().min(1).max(255),
    empresaId: z.string().uuid().optional(),
});

const updateCompradorSchema = z.object({
    id: z.string().uuid(),
    nombre: z.string().min(1).max(255).optional(),
    empresaId: z.string().uuid().nullable().optional(),
    activo: z.boolean().optional(),
});

export default async function handler(
    req: VercelRequest,
    res: VercelResponse
) {
    try {
        // GET - Listar todos los compradores
        if (req.method === 'GET') {
            const result = await sql`
        SELECT 
          c.id, 
          c.nombre, 
          c.empresa_id as "empresaId",
          c.activo, 
          c.created_at as "createdAt",
          e.nombre as "empresaNombre"
        FROM compradores c
        LEFT JOIN empresas e ON c.empresa_id = e.id
        ORDER BY c.created_at DESC
      `;

            return res.status(200).json(result.rows);
        }

        // POST - Crear nuevo comprador
        if (req.method === 'POST') {
            const validation = compradorSchema.safeParse(req.body);

            if (!validation.success) {
                return res.status(400).json({
                    error: 'Datos inválidos',
                    details: validation.error.issues
                });
            }

            const { nombre, empresaId } = validation.data;

            // Verificar que la empresa existe si se proporciona
            if (empresaId) {
                const empresa = await sql`
          SELECT id FROM empresas WHERE id = ${empresaId}
        `;

                if (empresa.rows.length === 0) {
                    return res.status(404).json({ error: 'Empresa no encontrada' });
                }
            }

            // Insertar nuevo comprador
            const result = await sql`
        INSERT INTO compradores (nombre, empresa_id, activo)
        VALUES (${nombre}, ${empresaId || null}, true)
        RETURNING id, nombre, empresa_id as "empresaId", activo, created_at as "createdAt"
      `;

            return res.status(201).json(result.rows[0]);
        }

        // PUT - Actualizar comprador
        if (req.method === 'PUT') {
            const validation = updateCompradorSchema.safeParse(req.body);

            if (!validation.success) {
                return res.status(400).json({
                    error: 'Datos inválidos',
                    details: validation.error.issues
                });
            }

            const { id, nombre, empresaId, activo } = validation.data;

            // Verificar que la empresa existe si se proporciona
            if (empresaId !== undefined && empresaId !== null) {
                const empresa = await sql`
          SELECT id FROM empresas WHERE id = ${empresaId}
        `;

                if (empresa.rows.length === 0) {
                    return res.status(404).json({ error: 'Empresa no encontrada' });
                }
            }

            // Construir query dinámicamente
            const updates: string[] = [];
            const values: any[] = [];
            let paramIndex = 1;

            if (nombre !== undefined) {
                updates.push(`nombre = $${paramIndex++}`);
                values.push(nombre);
            }

            if (empresaId !== undefined) {
                updates.push(`empresa_id = $${paramIndex++}`);
                values.push(empresaId);
            }

            if (activo !== undefined) {
                updates.push(`activo = $${paramIndex++}`);
                values.push(activo);
            }

            if (updates.length === 0) {
                return res.status(400).json({ error: 'No hay campos para actualizar' });
            }

            values.push(id);

            const result = await sql.query(
                `UPDATE compradores 
         SET ${updates.join(', ')} 
         WHERE id = $${paramIndex}
         RETURNING id, nombre, empresa_id as "empresaId", activo, created_at as "createdAt"`,
                values
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Comprador no encontrado' });
            }

            return res.status(200).json(result.rows[0]);
        }

        // DELETE - Eliminar comprador
        if (req.method === 'DELETE') {
            const { id } = req.query;

            if (!id || typeof id !== 'string') {
                return res.status(400).json({ error: 'ID requerido' });
            }

            // Verificar si tiene tiquetes asociados
            const tiquetes = await sql`
        SELECT COUNT(*) as count FROM tiquetes WHERE comprador_id = ${id}
      `;

            if (parseInt(tiquetes.rows[0].count) > 0) {
                return res.status(409).json({
                    error: 'No se puede eliminar un comprador con tiquetes asociados'
                });
            }

            const result = await sql`
        DELETE FROM compradores WHERE id = ${id}
        RETURNING id
      `;

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Comprador no encontrado' });
            }

            return res.status(200).json({ success: true, id: result.rows[0].id });
        }

        return res.status(405).json({ error: 'Método no permitido' });

    } catch (error) {
        console.error('Error en /api/compradores:', error);
        return res.status(500).json({
            error: 'Error interno del servidor',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
