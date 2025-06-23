import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BonoGeneralRepositoryPort } from '../../domain/ports/user-management.port';
import { BonoGeneralResource, CreateBonoGeneralResource } from '../../domain/models/user-management.model';

// Token de inyección para el repositorio de API general de bonos
export const BONO_GENERAL_REPOSITORY_TOKEN = 'BonoGeneralRepositoryPort';

@Injectable({
  providedIn: 'root'
})
export class BonoGeneralService {
  constructor(
    @Inject(BONO_GENERAL_REPOSITORY_TOKEN) private bonoRepository: BonoGeneralRepositoryPort
  ) {}

  getAllBonos(): Observable<BonoGeneralResource[]> {
    return this.bonoRepository.getAllBonos();
  }

  createBono(bono: CreateBonoGeneralResource): Observable<BonoGeneralResource> {
    return this.bonoRepository.createBono(bono);
  }

  getBonoById(id: string): Observable<BonoGeneralResource> {
    return this.bonoRepository.getBonoById(id);
  }

  updateBono(id: string, bono: CreateBonoGeneralResource): Observable<BonoGeneralResource> {
    return this.bonoRepository.updateBono(id, bono);
  }

  deleteBono(id: string): Observable<void> {
    return this.bonoRepository.deleteBono(id);
  }

  buscarBonosPorNombre(nombre: string): Observable<BonoGeneralResource[]> {
    return this.bonoRepository.buscarBonosPorNombre(nombre);
  }

  getBonosPorMoneda(moneda: string): Observable<BonoGeneralResource[]> {
    return this.bonoRepository.getBonosPorMoneda(moneda);
  }
} 