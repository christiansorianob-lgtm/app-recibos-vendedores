import { sql } from '@vercel/postgres';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';

// Validation schemas
const empresaSchema = z.object({
    nombre: z.string().min(1).max(255),
});

const updateEmpresaSchema = z.object({
    id: z.string().uuid(),
    nombre: z.string().min(1).max(255).optional(),
    activo: z.boolean().optional(),
});

export default async function handler(
    req: VercelRequest,
    res: VercelResponse
) {
    try {
        // GET - Listar todas las empresas
        if (req.method === 'GET') {
            const result = await sql`
        SELECT id, nombre, activo, created_at as "createdAt"
        FROM empresas
        ORDER BY created_at DESC
      `;

            return res.status(200).json(result.rows);
        }

        // POST - Crear nueva empresa
        if (req.method === 'POST') {
            const validation = empresaSchema.safeParse(req.body);

            if (!validation.success) {
                return res.status(400).json({
                    error: 'Datos inválidos',
                    details: validation.error.issues
                });
            }

            const { nombre } = validation.data;

            // Verificar si ya existe
            const existing = await sql`
        SELECT id FROM empresas WHERE LOWER(nombre) = LOWER(${nombre})
      `;

            if (existing.rows.length > 0) {
                return res.status(409).json({
                    error: 'Ya existe una empresa con este nombre'
                });
            }

            // Insertar nueva empresa
            const result = await sql`
        INSERT INTO empresas (nombre, activo)
        VALUES (${nombre}, true)
        RETURNING id, nombre, activo, created_at as "createdAt"
      `;

            return res.status(201).json(result.rows[0]);
        }

        // PUT - Actualizar empresa
        if (req.method === 'PUT') {
            const validation = updateEmpresaSchema.safeParse(req.body);

            if (!validation.success) {
                return res.status(400).json({
                    error: 'Datos inválidos',
                    details: validation.error.issues
                });
            }

            const { id, nombre, activo } = validation.data;

            // Construir query dinámicamente
            const updates: string[] = [];
            const values: any[] = [];
            let paramIndex = 1;

            if (nombre !== undefined) {
                updates.push(`nombre = $${paramIndex++}`);
                values.push(nombre);
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
                `UPDATE empresas 
         SET ${updates.join(', ')} 
         WHERE id = $${paramIndex}
         RETURNING id, nombre, activo, created_at as "createdAt"`,
                values
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Empresa no encontrada' });
            }

            return res.status(200).json(result.rows[0]);
        }

        // DELETE - Eliminar empresa
        if (req.method === 'DELETE') {
            const { id } = req.query;

            if (!id || typeof id !== 'string') {
                return res.status(400).json({ error: 'ID requerido' });
            }

            // Verificar si tiene tiquetes asociados
            const tiquetes = await sql`
        SELECT COUNT(*) as count FROM tiquetes WHERE empresa_id = ${id}
      `;

            if (parseInt(tiquetes.rows[0].count) > 0) {
                return res.status(409).json({
                    error: 'No se puede eliminar una empresa con tiquetes asociados'
                });
            }

            const result = await sql`
        DELETE FROM empresas WHERE id = ${id}
        RETURNING id
      `;

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Empresa no encontrada' });
            }

            return res.status(200).json({ success: true, id: result.rows[0].id });
        }

        return res.status(405).json({ error: 'Método no permitido' });

    } catch (error) {
        console.error('Error en /api/empresas:', error);
        return res.status(500).json({
            error: 'Error interno del servidor',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
