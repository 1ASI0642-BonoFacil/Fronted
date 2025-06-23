import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CalculoRepositoryPort } from '../../domain/ports/calculo.repository.port';
import { CalculoInversion, CreateCalculoDto } from '../../../bonos/domain/models/bono.model';

@Injectable({
  providedIn: 'root'
})
export class CalculoApiAdapter implements CalculoRepositoryPort {
  private readonly apiUrl = `${environment.apiUrl}/api/v1/inversor/calculos`;

  constructor(private http: HttpClient) {}

  getMisCalculos(): Observable<CalculoInversion[]> {
    return this.http.get<CalculoInversion[]>(this.apiUrl);
  }

  createCalculo(calculo: CreateCalculoDto): Observable<CalculoInversion> {
    return this.http.post<CalculoInversion>(this.apiUrl, calculo);
  }

  getCalculo(id: number): Observable<CalculoInversion> {
    return this.http.get<CalculoInversion>(`${this.apiUrl}/${id}`);
  }

  deleteCalculo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
} 