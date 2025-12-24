# 🚀 Pasos para Ejecutar el Schema en Vercel

## Paso 1: Abrir el Query Editor

1. En la página de tu base de datos en Vercel (la que tienes abierta)
2. Haz clic en la pestaña **"Query"** (arriba, junto a "Usage", "Settings", etc.)

## Paso 2: Copiar el Schema SQL

Abre el archivo `schema.sql` que está en la raíz de tu proyecto y copia TODO su contenido.

**Ubicación**: `c:\Users\Usuario\Desktop\PROYECTOS WEB\APP RECIBOS VENDEDORES\schema.sql`

## Paso 3: Pegar y Ejecutar

1. Pega el contenido completo en el Query Editor de Vercel
2. Haz clic en el botón **"Run Query"** o presiona `Ctrl + Enter`
3. Deberías ver un mensaje de éxito

## Paso 4: Verificar las Tablas

Ejecuta esta query para verificar que las tablas se crearon:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

Deberías ver:
- `compradores`
- `empresas`
- `tiquetes`

---

## ⚠️ Si hay algún error

Si ves un error como "table already exists", está bien - significa que ya se ejecutó antes.

## ✅ Siguiente Paso

Una vez que confirmes que las tablas están creadas, avísame y continuaré con la configuración de las variables de entorno locales.
