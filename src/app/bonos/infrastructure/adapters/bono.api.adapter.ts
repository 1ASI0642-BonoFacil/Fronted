import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { BonoRepositoryPort } from '../../domain/ports/bono.repository.port';
import { Bono, CreateBonoDto, FlujoCaja, DuracionConvexidad, Rendimiento, PrecioMercado } from '../../domain/models/bono.model';

@Injectable({
  providedIn: 'root'
})
export class BonoApiAdapter implements BonoRepositoryPort {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ==================== ENDPOINTS DEL EMISOR ====================
  
  getMisBonos(): Observable<Bono[]> {
    return this.http.get<Bono[]>(`${this.apiUrl}/api/v1/emisor/bonos`);
  }

  createBono(bono: CreateBonoDto): Observable<Bono> {
    return this.http.post<Bono>(`${this.apiUrl}/api/v1/emisor/bonos`, bono);
  }

  getMiBono(id: number): Observable<Bono> {
    return this.http.get<Bono>(`${this.apiUrl}/api/v1/emisor/bonos/${id}`);
  }

  updateBono(id: number, bono: CreateBonoDto): Observable<Bono> {
    return this.http.put<Bono>(`${this.apiUrl}/api/v1/emisor/bonos/${id}`, bono);
  }

  deleteBono(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/v1/emisor/bonos/${id}`);
  }

  getFlujoBono(id: number): Observable<FlujoCaja[]> {
    return this.http.get<FlujoCaja[]>(`${this.apiUrl}/api/v1/emisor/bonos/${id}/flujo`);
  }

  // ==================== ENDPOINTS DEL INVERSOR ====================

  getCatalogoBonos(): Observable<Bono[]> {
    return this.http.get<Bono[]>(`${this.apiUrl}/api/v1/inversor/bonos/catalogo`);
  }

  getBonoDetalle(id: number): Observable<Bono> {
    return this.http.get<Bono>(`${this.apiUrl}/api/v1/inversor/bonos/catalogo/${id}`);
  }

  getBonosPorMoneda(moneda: string): Observable<Bono[]> {
    return this.http.get<Bono[]>(`${this.apiUrl}/api/v1/inversor/bonos/catalogo/moneda/${moneda}`);
  }

  getBonosPorTasa(tasaMinima?: number, tasaMaxima?: number): Observable<Bono[]> {
    let params = new HttpParams();
    if (tasaMinima !== undefined) {
      params = params.set('tasaMinima', tasaMinima.toString());
    }
    if (tasaMaxima !== undefined) {
      params = params.set('tasaMaxima', tasaMaxima.toString());
    }
    return this.http.get<Bono[]>(`${this.apiUrl}/api/v1/inversor/bonos/catalogo/tasa`, { params });
  }

  getFlujoBonoInversor(id: number): Observable<FlujoCaja[]> {
    return this.http.get<FlujoCaja[]>(`${this.apiUrl}/api/v1/inversor/bonos/${id}/flujo`);
  }

  // ==================== ENDPOINTS DE CÁLCULOS FINANCIEROS ====================

  calcularFlujoCaja(bonoId: number, tasaDescuento?: number): Observable<FlujoCaja[]> {
    let params = new HttpParams();
    if (tasaDescuento !== undefined) {
      params = params.set('tasaDescuento', tasaDescuento.toString());
    }
    return this.http.get<FlujoCaja[]>(`${this.apiUrl}/api/bonos/${bonoId}/calculos/flujo-caja`, { params });
  }

  calcularMetricas(bonoId: number, tasaMercado?: number, cambioPuntosPorcentuales?: number): Observable<DuracionConvexidad> {
    let params = new HttpParams();
    if (tasaMercado !== undefined) {
      params = params.set('tasaMercado', tasaMercado.toString());
    }
    if (cambioPuntosPorcentuales !== undefined) {
      params = params.set('cambioPuntosPorcentuales', cambioPuntosPorcentuales.toString());
    }
    return this.http.get<DuracionConvexidad>(`${this.apiUrl}/api/bonos/${bonoId}/calculos/metricas`, { params });
  }

  calcularPrecio(bonoId: number, tasaMercado?: number): Observable<PrecioMercado> {
    let params = new HttpParams();
    if (tasaMercado !== undefined) {
      params = params.set('tasaMercado', tasaMercado.toString());
    }
    return this.http.get<PrecioMercado>(`${this.apiUrl}/api/bonos/${bonoId}/calculos/precio`, { params });
  }

  calcularTCEA(bonoId: number, costosEmision: number): Observable<Rendimiento> {
    const params = new HttpParams().set('costosEmision', costosEmision.toString());
    return this.http.get<Rendimiento>(`${this.apiUrl}/api/bonos/${bonoId}/calculos/tcea`, { params });
  }

  calcularTREA(bonoId: number, precioCompra: number): Observable<Rendimiento> {
    const params = new HttpParams().set('precioCompra', precioCompra.toString());
    return this.http.get<Rendimiento>(`${this.apiUrl}/api/bonos/${bonoId}/calculos/trea`, { params });
  }

  calcularPrecioMercado(bonoId: number, tasaMercado?: number): Observable<PrecioMercado> {
    let params = new HttpParams();
    if (tasaMercado !== undefined) {
      params = params.set('tasaMercado', tasaMercado.toString());
    }
    return this.http.get<PrecioMercado>(`${this.apiUrl}/api/bonos/${bonoId}/calculos/precio-mercado`, { params });
  }
} 