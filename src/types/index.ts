export interface TiqueteFruta {
  id: string;
  fecha: string; // ISO Date string
  empresa_id: string;
  comprador_id: string;
  numeroTiquete: string;
  kilogramos: number;
  valorUnitario: number;
  valorTotal: number;
  revisado: boolean;
  observaciones?: string;
  fotografiaTiquete?: string; // Base64 string of the image
}

export type TiqueteInput = Omit<TiqueteFruta, 'id' | 'valorTotal' | 'revisado'>;

export interface Stats {
  totalKilogramos: number;
  totalValor: number;
  tiquetesCount: number;
}

export interface Empresa {
  id: string;
  nombre: string;
  activo: boolean;
  createdAt: string;
}

export interface Comprador {
  id: string;
  nombre: string;
  empresaId?: string;
  activo: boolean;
  createdAt: string;
}
