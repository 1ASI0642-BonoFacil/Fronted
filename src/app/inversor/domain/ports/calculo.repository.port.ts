import { Observable } from 'rxjs';
import { CalculoInversion, CreateCalculoDto } from '../../../bonos/domain/models/bono.model';

// Puerto de salida para operaciones de cálculos del inversor
export interface CalculoRepositoryPort {
  getMisCalculos(): Observable<CalculoInversion[]>;
  createCalculo(calculo: CreateCalculoDto): Observable<CalculoInversion>;
  getCalculo(id: number): Observable<CalculoInversion>;
  deleteCalculo(id: number): Observable<void>;
} 