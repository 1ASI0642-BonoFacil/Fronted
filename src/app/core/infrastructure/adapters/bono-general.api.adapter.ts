import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { BonoGeneralRepositoryPort } from '../../domain/ports/user-management.port';
import { BonoGeneralResource, CreateBonoGeneralResource } from '../../domain/models/user-management.model';

@Injectable({
  providedIn: 'root'
})
export class BonoGeneralApiAdapter implements BonoGeneralRepositoryPort {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAllBonos(): Observable<BonoGeneralResource[]> {
    return this.http.get<BonoGeneralResource[]>(`${this.apiUrl}/api/bonos`);
  }

  createBono(bono: CreateBonoGeneralResource): Observable<BonoGeneralResource> {
    return this.http.post<BonoGeneralResource>(`${this.apiUrl}/api/bonos`, bono);
  }

  getBonoById(id: string): Observable<BonoGeneralResource> {
    return this.http.get<BonoGeneralResource>(`${this.apiUrl}/api/bonos/${id}`);
  }

  updateBono(id: string, bono: CreateBonoGeneralResource): Observable<BonoGeneralResource> {
    return this.http.put<BonoGeneralResource>(`${this.apiUrl}/api/bonos/${id}`, bono);
  }

  deleteBono(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/bonos/${id}`);
  }

  buscarBonosPorNombre(nombre: string): Observable<BonoGeneralResource[]> {
    const params = new HttpParams().set('nombre', nombre);
    return this.http.get<BonoGeneralResource[]>(`${this.apiUrl}/api/bonos/buscar`, { params });
  }

  getBonosPorMoneda(moneda: string): Observable<BonoGeneralResource[]> {
    return this.http.get<BonoGeneralResource[]>(`${this.apiUrl}/api/bonos/moneda/${moneda}`);
  }
} 