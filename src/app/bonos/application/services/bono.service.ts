import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BonoRepositoryPort } from '../../domain/ports/bono.repository.port';
import { Bono, CreateBonoDto, FlujoCaja, DuracionConvexidad, Rendimiento, PrecioMercado } from '../../domain/models/bono.model';

// Token de inyección para el repositorio de bonos
export const BONO_REPOSITORY_TOKEN = 'BonoRepositoryPort';

@Injectable({
  providedIn: 'root'
})
export class BonoService {
  constructor(
    @Inject(BONO_REPOSITORY_TOKEN) private bonoRepository: BonoRepositoryPort
  ) {}

  // ==================== SERVICIOS PARA EL EMISOR ====================

  getMisBonos(): Observable<Bono[]> {
    return this.bonoRepository.getMisBonos();
  }

  createBono(bono: CreateBonoDto): Observable<Bono> {
    return this.bonoRepository.createBono(bono);
  }

  getMiBono(id: number): Observable<Bono> {
    return this.bonoRepository.getMiBono(id);
  }

  updateBono(id: number, bono: CreateBonoDto): Observable<Bono> {
    return this.bonoRepository.updateBono(id, bono);
  }

  deleteBono(id: number): Observable<void> {
    return this.bonoRepository.deleteBono(id);
  }

  getFlujoBono(id: number): Observable<FlujoCaja[]> {
    return this.bonoRepository.getFlujoBono(id);
  }

  // ==================== SERVICIOS PARA EL INVERSOR ====================

  getCatalogoBonos(): Observable<Bono[]> {
    return this.bonoRepository.getCatalogoBonos();
  }

  getBonoDetalle(id: number): Observable<Bono> {
    return this.bonoRepository.getBonoDetalle(id);
  }

  getBonosPorMoneda(moneda: string): Observable<Bono[]> {
    return this.bonoRepository.getBonosPorMoneda(moneda);
  }

  getBonosPorTasa(tasaMinima?: number, tasaMaxima?: number): Observable<Bono[]> {
    return this.bonoRepository.getBonosPorTasa(tasaMinima, tasaMaxima);
  }

  getBonosFiltrados(moneda: string, tasaMinima?: number, tasaMaxima?: number): Observable<Bono[]> {
    return this.bonoRepository.getBonosFiltrados(moneda, tasaMinima, tasaMaxima);
  }

  getFlujoBonoInversor(id: number): Observable<FlujoCaja[]> {
    return this.bonoRepository.getFlujoBonoInversor(id);
  }

  // ==================== SERVICIOS DE CÁLCULOS FINANCIEROS ====================

  calcularFlujoCaja(bonoId: number, tasaDescuento?: number): Observable<FlujoCaja[]> {
    return this.bonoRepository.calcularFlujoCaja(bonoId, tasaDescuento);
  }

  calcularMetricas(bonoId: number, tasaMercado?: number, cambioPuntosPorcentuales?: number): Observable<DuracionConvexidad> {
    return this.bonoRepository.calcularMetricas(bonoId, tasaMercado, cambioPuntosPorcentuales);
  }

  calcularPrecio(bonoId: number, tasaMercado?: number): Observable<PrecioMercado> {
    return this.bonoRepository.calcularPrecio(bonoId, tasaMercado);
  }

  calcularTCEA(bonoId: number, costosEmision: number): Observable<Rendimiento> {
    return this.bonoRepository.calcularTCEA(bonoId, costosEmision);
  }

  calcularTREA(bonoId: number, precioCompra: number): Observable<Rendimiento> {
    return this.bonoRepository.calcularTREA(bonoId, precioCompra);
  }

  calcularPrecioMercado(bonoId: number, tasaMercado?: number): Observable<PrecioMercado> {
    return this.bonoRepository.calcularPrecioMercado(bonoId, tasaMercado);
  }
} 