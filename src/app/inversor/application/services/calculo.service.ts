import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CalculoRepositoryPort } from '../../domain/ports/calculo.repository.port';
import { CalculoInversion, CreateCalculoDto } from '../../../bonos/domain/models/bono.model';

// Token de inyección para el repositorio de cálculos
export const CALCULO_REPOSITORY_TOKEN = 'CalculoRepositoryPort';

@Injectable({
  providedIn: 'root'
})
export class CalculoService {
  constructor(
    @Inject(CALCULO_REPOSITORY_TOKEN) private calculoRepository: CalculoRepositoryPort
  ) {}

  getMisCalculos(): Observable<CalculoInversion[]> {
    return this.calculoRepository.getMisCalculos();
  }

  createCalculo(calculo: CreateCalculoDto): Observable<CalculoInversion> {
    return this.calculoRepository.createCalculo(calculo);
  }

  getCalculo(id: number): Observable<CalculoInversion> {
    return this.calculoRepository.getCalculo(id);
  }

  deleteCalculo(id: number): Observable<void> {
    return this.calculoRepository.deleteCalculo(id);
  }
} 