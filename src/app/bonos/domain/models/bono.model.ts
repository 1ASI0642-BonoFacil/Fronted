// Entidad principal - Bono
export interface Bono {
  id: number;
  nombre: string;
  descripcion: string;
  valorNominal: number;
  tasaCupon: number;
  plazoAnios: number;
  frecuenciaPagos: number;
  fechaEmision: string;
  tasaDescuento: number;
  metodoAmortizacion: MetodoAmortizacion;
  plazoGracia: PlazoGracia;
  moneda: Moneda;
  tasaInteres: TasaInteres;
  emisorId?: number;
  emisorNombre?: string;
}

// Value Objects
export interface PlazoGracia {
  tipo: TipoPlazoGracia;
  periodos: number;
}

export enum TipoPlazoGracia {
  NINGUNO = 'NINGUNO',
  TOTAL = 'TOTAL',
  PARCIAL = 'PARCIAL'
}

export interface Moneda {
  codigo: string;
  nombre: string;
  simbolo: string;
}

export interface TasaInteres {
  valor: number;
  tipo: TipoTasa;
  frecuenciaCapitalizacion?: number;
}

export enum TipoTasa {
  EFECTIVA = 'EFECTIVA',
  NOMINAL = 'NOMINAL'
}

export enum MetodoAmortizacion {
  AMERICANO = 'AMERICANO',
  ALEMAN = 'ALEMAN',
  FRANCES = 'FRANCES'
}

// Interfaces para crear/editar bonos
export interface CreateBonoDto {
  nombre: string;
  descripcion: string;
  valorNominal: number;
  tasaCupon: number;
  plazoAnios: number;
  frecuenciaPagos: number;
  moneda: string;
  fechaEmision: string;
  plazosGraciaTotal: number;
  plazosGraciaParcial: number;
  tasaDescuento: number;
  metodoAmortizacion: string;
}

// Interfaces para cálculos financieros
export interface FlujoCaja {
  periodo: number;
  fecha: string;
  cupon: number;
  amortizacion: number;
  flujoTotal: number;
  saldoInsoluto: number;
  valorPresente: number;
}

export interface DuracionConvexidad {
  duracion: number;
  duracionModificada: number;
  convexidad: number;
  cambioPrecio: number;
  tasaMercado: number;
}

export interface Rendimiento {
  tasaRendimiento: number;
  precio: number;
}

export interface PrecioMercado {
  precio: number;
  tasaMercado: number;
  valorNominal: number;
  precioPorcentaje: number;
}

// Interfaces para cálculos de inversión
export interface CalculoInversion {
  id: number;
  bonoId: number;
  bonoNombre: string;
  inversorUsername: string;
  tasaEsperada: number;
  trea: number;
  precioMaximo: number;
  fechaCalculo: string;
  informacionAdicional?: string;
}

export interface CreateCalculoDto {
  bonoId: number;
  tasaEsperada: number;
} 