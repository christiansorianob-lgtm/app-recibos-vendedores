# Guía de Configuración de Base de Datos

Esta guía te ayudará a configurar Vercel Postgres para tu aplicación de recibos de vendedores.

## Paso 1: Crear Base de Datos en Vercel

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto **app-recibos-vendedores**
3. Ve a la pestaña **Storage**
4. Haz clic en **Create Database**
5. Selecciona **Postgres**
6. Elige la región más cercana (recomendado: **US East** para mejor latencia)
7. Haz clic en **Create**

> ✅ Las variables de entorno se configurarán automáticamente en tu proyecto

## Paso 2: Ejecutar el Schema SQL

### Opción A: Desde el Dashboard de Vercel (Recomendado)

1. En la página de tu base de datos, ve a la pestaña **Query**
2. Copia todo el contenido del archivo `schema.sql`
3. Pégalo en el editor de queries
4. Haz clic en **Run Query**
5. Verifica que aparezca "Query executed successfully"

### Opción B: Usando Vercel CLI

```bash
# Instalar Vercel CLI si no lo tienes
npm install -g vercel

# Login a Vercel
vercel login

# Conectar a tu proyecto
vercel link

# Ejecutar el schema
vercel env pull .env.local
psql $POSTGRES_URL < schema.sql
```

## Paso 3: Configurar Variables de Entorno Locales

Para desarrollo local, necesitas las variables de entorno:

1. En el dashboard de Vercel, ve a **Settings** → **Environment Variables**
2. Copia las siguientes variables:
   - `POSTGRES_URL`
   - `POSTGRES_PRISMA_URL`
   - `POSTGRES_URL_NON_POOLING`
   - `POSTGRES_USER`
   - `POSTGRES_HOST`
   - `POSTGRES_PASSWORD`
   - `POSTGRES_DATABASE`

3. Crea un archivo `.env.local` en la raíz del proyecto:

```bash
# .env.local
POSTGRES_URL="************"
POSTGRES_PRISMA_URL="************"
POSTGRES_URL_NON_POOLING="************"
POSTGRES_USER="************"
POSTGRES_HOST="************"
POSTGRES_PASSWORD="************"
POSTGRES_DATABASE="************"
```

> ⚠️ **IMPORTANTE**: El archivo `.env.local` ya está en `.gitignore`, nunca lo subas a GitHub

## Paso 4: Instalar Dependencias

```bash
npm install
```

## Paso 5: Probar Conexión Local

```bash
# Iniciar servidor de desarrollo con Vercel
npx vercel dev
```

Abre http://localhost:3000 y verifica que la app cargue correctamente.

## Paso 6: Migrar Datos de LocalStorage

1. Abre tu aplicación en el navegador
2. Ve a la sección de **Administración** (se agregará un panel especial)
3. Haz clic en **Migrar Datos a Base de Datos**
4. Espera a que se complete la migración
5. Verifica que todos tus datos aparezcan correctamente

> 💾 Se creará un backup automático de tus datos antes de migrar

## Paso 7: Deploy a Producción

```bash
# Hacer commit de los cambios
git add .
git commit -m "feat: integrate Vercel Postgres database"
git push origin main
```

Vercel detectará automáticamente los cambios y desplegará la nueva versión.

## Verificación

### Verificar Tablas Creadas

En el Query Editor de Vercel, ejecuta:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

Deberías ver: `empresas`, `compradores`, `tiquetes`

### Verificar Datos Migrados

```sql
-- Contar registros
SELECT 
  (SELECT COUNT(*) FROM empresas) as empresas,
  (SELECT COUNT(*) FROM compradores) as compradores,
  (SELECT COUNT(*) FROM tiquetes) as tiquetes;
```

## Troubleshooting

### Error: "Connection timeout"
- Verifica que las variables de entorno estén correctamente configuradas
- Asegúrate de estar usando `POSTGRES_URL` (con pooling) para las API routes

### Error: "Table already exists"
- Es normal si ejecutas el schema múltiples veces
- El schema usa `IF NOT EXISTS` para evitar errores

### Los datos no aparecen después de migrar
- Verifica en el Query Editor que los datos se insertaron
- Revisa la consola del navegador para errores de API
- Verifica que las API routes estén respondiendo correctamente

## Recursos Adicionales

- [Vercel Postgres Documentation](https://vercel.com/docs/storage/vercel-postgres)
- [Neon Documentation](https://neon.tech/docs/introduction)
- [SQL Tutorial](https://www.postgresql.org/docs/current/tutorial.html)
