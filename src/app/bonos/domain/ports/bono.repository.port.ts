import { Observable } from 'rxjs';
import { Bono, CreateBonoDto, FlujoCaja, DuracionConvexidad, Rendimiento, PrecioMercado } from '../models/bono.model';

// Puerto de salida para operaciones de bonos
export interface BonoRepositoryPort {
  // Endpoints del emisor
  getMisBonos(): Observable<Bono[]>;
  createBono(bono: CreateBonoDto): Observable<Bono>;
  getMiBono(id: number): Observable<Bono>;
  updateBono(id: number, bono: CreateBonoDto): Observable<Bono>;
  deleteBono(id: number): Observable<void>;
  getFlujoBono(id: number): Observable<FlujoCaja[]>;

  // Endpoints del inversor  
  getCatalogoBonos(): Observable<Bono[]>;
  getBonoDetalle(id: number): Observable<Bono>;
  getBonosPorMoneda(moneda: string): Observable<Bono[]>;
  getBonosPorTasa(tasaMinima?: number, tasaMaxima?: number): Observable<Bono[]>;
  getBonosFiltrados(moneda: string, tasaMinima?: number, tasaMaxima?: number): Observable<Bono[]>;
  getFlujoBonoInversor(id: number): Observable<FlujoCaja[]>;

  // Endpoints de cálculos financieros
  calcularFlujoCaja(bonoId: number, tasaDescuento?: number): Observable<FlujoCaja[]>;
  calcularMetricas(bonoId: number, tasaMercado?: number, cambioPuntosPorcentuales?: number): Observable<DuracionConvexidad>;
  calcularPrecio(bonoId: number, tasaMercado?: number): Observable<PrecioMercado>;
  calcularTCEA(bonoId: number, costosEmision: number): Observable<Rendimiento>;
  calcularTREA(bonoId: number, precioCompra: number): Observable<Rendimiento>;
  calcularPrecioMercado(bonoId: number, tasaMercado?: number): Observable<PrecioMercado>;
} 