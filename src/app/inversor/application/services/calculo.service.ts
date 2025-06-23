import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CalculoRepositoryPort } from '../../domain/ports/calculo.repository.port';
import { CalculoInversion, CreateCalculoDto } from '../../../bonos/domain/models/bono.model';

// Token de inyección para el repositorio de cálculos
export const CALCULO_REPOSITORY_TOKEN = 'CalculoRepositoryPort';

export interface CalculoTREA {
  trea: number;
  precioCompra: number;
  valorNominal: number;
  gananciaTotal: number;
  rentabilidadTotal: number;
}

@Injectable({
  providedIn: 'root'
})
export class CalculoService {
  constructor(
    @Inject(CALCULO_REPOSITORY_TOKEN) private calculoRepository: CalculoRepositoryPort
  ) {}

  // ==================== GESTIÓN DE CÁLCULOS ====================

  /**
   * Crear un nuevo cálculo de inversión
   */
  crearCalculo(calculo: CreateCalculoDto): Observable<CalculoInversion> {
    return this.calculoRepository.createCalculo(calculo);
  }

  /**
   * Obtener todos mis cálculos
   */
  getMisCalculos(): Observable<CalculoInversion[]> {
    return this.calculoRepository.getMisCalculos();
  }

  /**
   * Obtener un cálculo específico por ID
   */
  getCalculoPorId(id: number): Observable<CalculoInversion> {
    return this.calculoRepository.getCalculo(id);
  }

  /**
   * Eliminar un cálculo
   */
  eliminarCalculo(id: number): Observable<void> {
    return this.calculoRepository.deleteCalculo(id);
  }

  // ==================== UTILIDADES ====================

  /**
   * Calcular TREA independiente (sin bono específico)
   */
  calcularTREAIndependiente(precioCompra: number, valorNominal: number, tasaCupon: number, plazoAnios: number): CalculoTREA {
    // Cálculo local para la calculadora independiente
    const cuponAnual = (valorNominal * tasaCupon) / 100;
    const gananciaCupon = cuponAnual * plazoAnios;
    const gananciaCapital = valorNominal - precioCompra;
    const gananciaTotal = gananciaCupon + gananciaCapital;
    
    const rendimientoAnual = gananciaTotal / plazoAnios;
    const trea = (rendimientoAnual / precioCompra) * 100;
    const rentabilidadTotal = (gananciaTotal / precioCompra) * 100;

    return {
      trea: Number(trea.toFixed(2)),
      precioCompra,
      valorNominal,
      gananciaTotal: Number(gananciaTotal.toFixed(2)),
      rentabilidadTotal: Number(rentabilidadTotal.toFixed(2))
    };
  }
} 