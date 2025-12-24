-- Schema para App Recibos Vendedores
-- Base de datos: Vercel Postgres (Neon)

-- Tabla de Empresas / Fincas
CREATE TABLE IF NOT EXISTS empresas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255) NOT NULL UNIQUE,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Compradores
CREATE TABLE IF NOT EXISTS compradores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255) NOT NULL,
  empresa_id UUID REFERENCES empresas(id) ON DELETE SET NULL,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Tiquetes de Fruta
CREATE TABLE IF NOT EXISTS tiquetes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha DATE NOT NULL,
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  comprador_id UUID NOT NULL REFERENCES compradores(id) ON DELETE CASCADE,
  numero_tiquete VARCHAR(50) NOT NULL,
  kilogramos DECIMAL(10,2) NOT NULL,
  valor_unitario DECIMAL(10,2) NOT NULL,
  valor_total DECIMAL(10,2) NOT NULL,
  revisado BOOLEAN DEFAULT false,
  observaciones TEXT,
  fotografia_tiquete TEXT, -- Base64 string
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar performance de queries
CREATE INDEX IF NOT EXISTS idx_tiquetes_fecha ON tiquetes(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_tiquetes_empresa ON tiquetes(empresa_id);
CREATE INDEX IF NOT EXISTS idx_tiquetes_comprador ON tiquetes(comprador_id);
CREATE INDEX IF NOT EXISTS idx_compradores_empresa ON compradores(empresa_id);
CREATE INDEX IF NOT EXISTS idx_empresas_activo ON empresas(activo);
CREATE INDEX IF NOT EXISTS idx_compradores_activo ON compradores(activo);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at en tiquetes
CREATE TRIGGER update_tiquetes_updated_at BEFORE UPDATE ON tiquetes
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
