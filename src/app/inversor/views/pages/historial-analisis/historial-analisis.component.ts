import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LoggerService } from '../../../../shared/services/logger.service';
import { CalculoService } from '../../../application/services/calculo.service';
import { CalculoInversion } from '../../../../bonos/domain/models/bono.model';
import { forkJoin } from 'rxjs';

interface AnalisisGuardado {
  id: string;
  fecha: Date;
  tipo: 'TREA' | 'FLUJO_CAJA' | 'CALCULO_BACKEND';
  bono?: string;
  parametros: any;
  resultados: any;
  esDelBackend?: boolean;
  calculoBackend?: CalculoInversion;
}

@Component({
  selector: 'app-historial-analisis',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="header-content">
          <h1>Historial de Análisis</h1>
          <p class="subtitle">Todos tus cálculos y análisis financieros guardados</p>
        </div>
        <div class="header-actions">
          <a routerLink="/inversor/mis-calculos" class="btn btn-primary">
            <i class="icon">🧮</i>
            Nueva Calculadora
          </a>
          <a routerLink="/inversor/dashboard" class="btn btn-secondary">
            <i class="icon">🏠</i>
            Dashboard
          </a>
        </div>
      </div>

      <div class="content-container">
        <div class="section-header">
          <h2 class="section-title">Análisis Guardados</h2>
          <div class="filter-actions">
            <select class="filter-select" [(ngModel)]="filtroTipo" (change)="aplicarFiltros()">
              <option value="">Todos los tipos</option>
              <option value="TREA">Cálculos TREA Locales</option>
              <option value="CALCULO_BACKEND">Cálculos del Sistema</option>
              <option value="FLUJO_CAJA">Flujo de Caja</option>
            </select>
          </div>
        </div>

        <div *ngIf="analisisGuardados.length === 0" class="empty-state">
          <div class="empty-card">
            <i class="empty-icon">📋</i>
            <h3>No tienes análisis guardados</h3>
            <p>Comienza usando la calculadora financiera para ver tus análisis aquí.</p>
            <a routerLink="/inversor/mis-calculos" class="btn btn-primary">
              <i class="icon">🧮</i>
              Crear Primer Análisis
            </a>
          </div>
        </div>

        <div *ngIf="analisisFiltrados.length > 0" class="analisis-grid">
          <div *ngFor="let analisis of analisisFiltrados" class="analisis-card">
            <div class="card-header">
              <div class="tipo-badge">
                <i class="tipo-icon">{{ getTipoIcon(analisis.tipo) }}</i>
                <span>{{ getTipoNombre(analisis.tipo) }}</span>
              </div>
              <div class="analisis-fecha">
                <span>{{ analisis.fecha | date:'dd/MM/yyyy HH:mm' }}</span>
              </div>
            </div>

            <div class="card-content">
              <div *ngIf="analisis.bono" class="bono-info">
                <h4>🏛️ {{ analisis.bono }}</h4>
              </div>
              
              <div class="parametros-section">
                <h5>Parámetros:</h5>
                <div class="parametros-grid">
                  <div *ngFor="let param of getParametrosArray(analisis.parametros)" class="parametro-item">
                    <span class="param-label">{{ param.label }}:</span>
                    <span class="param-value">{{ param.value }}</span>
                  </div>
                </div>
              </div>

              <div class="resultados-section">
                <h5>Resultados:</h5>
                <div class="resultados-highlight">
                  <div *ngFor="let resultado of getResultadosArray(analisis.resultados)" class="resultado-item">
                    <span class="resultado-label">{{ resultado.label }}:</span>
                    <span class="resultado-value">{{ resultado.value }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="card-actions">
              <button class="btn btn-sm btn-outline" (click)="duplicarAnalisis(analisis)">
                <i class="icon">📋</i>
                Duplicar
              </button>
              <button class="btn btn-sm btn-danger" (click)="eliminarAnalisis(analisis.id)">
                <i class="icon">🗑️</i>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: white;
      padding: 30px 40px;
      border-radius: 20px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      margin-bottom: 30px;
    }

    .header-content h1 {
      color: #2c3e50;
      font-size: 2.5rem;
      font-weight: 700;
      margin: 0 0 10px 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .subtitle {
      color: #6c757d;
      font-size: 1.1rem;
      margin: 0;
    }

    .header-actions {
      display: flex;
      gap: 15px;
    }

    .btn {
      padding: 12px 24px;
      border-radius: 12px;
      font-weight: 600;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.3s ease;
      border: none;
      cursor: pointer;
      font-size: 1rem;
    }

    .btn-sm {
      padding: 8px 16px;
      font-size: 0.9rem;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
    }

    .btn-secondary {
      background: #ecf0f1;
      color: #2c3e50;
    }

    .btn-outline {
      background: transparent;
      color: #667eea;
      border: 2px solid #667eea;
    }

    .btn-danger {
      background: #dc3545;
      color: white;
    }

    .content-container {
      background: white;
      border-radius: 20px;
      padding: 40px;
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #f1f3f4;
    }

    .section-title {
      color: #2c3e50;
      font-size: 1.8rem;
      font-weight: 600;
      margin: 0;
    }

    .filter-select {
      padding: 10px 15px;
      border: 2px solid #e9ecef;
      border-radius: 8px;
      font-size: 1rem;
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
    }

    .empty-card {
      background: #f8f9fa;
      padding: 40px;
      border-radius: 16px;
      border: 2px dashed #dee2e6;
      max-width: 400px;
      margin: 0 auto;
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: 20px;
      opacity: 0.5;
      display: block;
    }

    .analisis-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 25px;
    }

    .analisis-card {
      background: white;
      border-radius: 16px;
      padding: 25px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
      border: 2px solid #e9ecef;
      transition: all 0.3s ease;
    }

    .analisis-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .tipo-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 0.9rem;
      font-weight: 600;
      background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
      color: #1976d2;
    }

    .analisis-fecha {
      color: #6c757d;
      font-size: 0.9rem;
    }

    .bono-info h4 {
      color: #2c3e50;
      margin: 0 0 15px 0;
      font-size: 1.1rem;
    }

    .parametros-section, .resultados-section {
      margin-bottom: 20px;
    }

    .parametros-section h5, .resultados-section h5 {
      color: #495057;
      margin: 0 0 10px 0;
      font-size: 1rem;
    }

    .parametros-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 10px;
    }

    .parametro-item {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .param-label {
      font-size: 0.8rem;
      color: #6c757d;
      font-weight: 500;
    }

    .param-value {
      font-weight: 600;
      color: #2c3e50;
    }

    .resultados-highlight {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 8px;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 15px;
    }

    .resultado-item {
      text-align: center;
    }

    .resultado-label {
      display: block;
      font-size: 0.8rem;
      color: #6c757d;
      margin-bottom: 5px;
    }

    .resultado-value {
      display: block;
      font-size: 1.2rem;
      font-weight: 700;
      color: #28a745;
    }

    .card-actions {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
      margin-top: 20px;
      padding-top: 15px;
      border-top: 1px solid #e9ecef;
    }

    .icon {
      font-size: 1em;
    }

    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        gap: 20px;
        text-align: center;
      }

      .section-header {
        flex-direction: column;
        gap: 15px;
      }

      .analisis-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class HistorialAnalisisComponent implements OnInit {
  analisisGuardados: AnalisisGuardado[] = [];
  analisisFiltrados: AnalisisGuardado[] = [];
  filtroTipo = '';

  constructor(
    private logger: LoggerService,
    private calculoService: CalculoService
  ) {}

  ngOnInit(): void {
    this.cargarHistorial();
  }

  cargarHistorial(): void {
    // Cargar análisis locales
    const historialStr = localStorage.getItem('historial_analisis_bonofacil');
    let analisisLocales: AnalisisGuardado[] = [];
    
    if (historialStr) {
      try {
        analisisLocales = JSON.parse(historialStr);
        analisisLocales.forEach(a => a.fecha = new Date(a.fecha));
      } catch (error) {
        analisisLocales = [];
      }
    }

    // Cargar cálculos del backend
    this.calculoService.getMisCalculos().subscribe({
      next: (calculosBackend) => {
        const analisisBackend: AnalisisGuardado[] = calculosBackend.map(calculo => ({
          id: calculo.id.toString(),
          fecha: new Date(calculo.fechaCalculo),
          tipo: 'CALCULO_BACKEND' as const,
          bono: calculo.bonoNombre,
          parametros: {
            bonoId: calculo.bonoId,
            tasaEsperada: calculo.tasaEsperada
          },
          resultados: {
            trea: calculo.trea,
            precioMaximo: calculo.precioMaximo
          },
          esDelBackend: true,
          calculoBackend: calculo
        }));

        // Combinar análisis locales y del backend
        this.analisisGuardados = [...analisisBackend, ...analisisLocales]
          .sort((a, b) => b.fecha.getTime() - a.fecha.getTime()); // Ordenar por fecha descendente
        
        this.analisisFiltrados = [...this.analisisGuardados];
        
        this.logger.info('📊 Historial cargado', 'HistorialAnalisisComponent', {
          calculosBackend: analisisBackend.length,
          analisisLocales: analisisLocales.length,
          total: this.analisisGuardados.length
        });
      },
      error: (error) => {
        // Si falla el backend, solo mostrar análisis locales
        this.analisisGuardados = analisisLocales;
        this.analisisFiltrados = [...this.analisisGuardados];
        
        this.logger.warn('⚠️ Error al cargar cálculos del backend, mostrando solo análisis locales', 'HistorialAnalisisComponent', { error });
      }
    });
  }

  getDatosEjemplo(): AnalisisGuardado[] {
    return [
      {
        id: '1',
        fecha: new Date(Date.now() - 86400000),
        tipo: 'TREA',
        bono: 'Bono Corporativo ABC 2024',
        parametros: {
          precioCompra: 950,
          valorNominal: 1000,
          tasaCupon: 8.5,
          plazoAnios: 5
        },
        resultados: {
          trea: 9.23,
          rendimientoAnual: 92.30,
          rentabilidadTotal: 46.15
        }
      }
    ];
  }

  aplicarFiltros(): void {
    if (this.filtroTipo) {
      this.analisisFiltrados = this.analisisGuardados.filter(a => a.tipo === this.filtroTipo);
    } else {
      this.analisisFiltrados = [...this.analisisGuardados];
    }
  }

  getTipoIcon(tipo: string): string {
    switch (tipo) {
      case 'TREA': return '📈';
      case 'FLUJO_CAJA': return '💰';
      default: return '📊';
    }
  }

  getTipoNombre(tipo: string): string {
    switch (tipo) {
      case 'TREA': return 'Cálculo TREA Local';
      case 'FLUJO_CAJA': return 'Flujo de Caja';
      case 'CALCULO_BACKEND': return 'Cálculo del Sistema';
      default: return tipo;
    }
  }

  getParametrosArray(parametros: any): any[] {
    return Object.entries(parametros).map(([key, value]) => ({
      label: this.formatearParametro(key),
      value: this.formatearValor(key, value)
    }));
  }

  getResultadosArray(resultados: any): any[] {
    return Object.entries(resultados).map(([key, value]) => ({
      label: this.formatearResultado(key),
      value: this.formatearValor(key, value)
    }));
  }

  formatearParametro(key: string): string {
    const labels: any = {
      precioCompra: 'Precio Compra',
      valorNominal: 'Valor Nominal',
      tasaCupon: 'Tasa Cupón',
      plazoAnios: 'Plazo'
    };
    return labels[key] || key;
  }

  formatearResultado(key: string): string {
    const labels: any = {
      trea: 'TREA',
      rendimientoAnual: 'Rendimiento Anual',
      rentabilidadTotal: 'Rentabilidad Total'
    };
    return labels[key] || key;
  }

  formatearValor(key: string, value: any): string {
    if (key.includes('trea') || key.includes('tasa') || key.includes('rentabilidad')) {
      return `${value}%`;
    }
    if (key.includes('precio') || key.includes('valor')) {
      return `$${value.toLocaleString()}`;
    }
    return value?.toString() || '';
  }

  duplicarAnalisis(analisis: AnalisisGuardado): void {
    const nuevoAnalisis: AnalisisGuardado = {
      ...analisis,
      id: Date.now().toString(),
      fecha: new Date()
    };
    
    this.analisisGuardados.unshift(nuevoAnalisis);
    this.guardarHistorial();
    this.aplicarFiltros();
  }

  eliminarAnalisis(id: string): void {
    const analisis = this.analisisGuardados.find(a => a.id === id);
    if (!analisis) return;

    if (confirm('¿Estás seguro de que quieres eliminar este análisis?')) {
      if (analisis.esDelBackend && analisis.calculoBackend) {
        // Eliminar del backend
        this.calculoService.eliminarCalculo(analisis.calculoBackend.id).subscribe({
          next: () => {
            this.analisisGuardados = this.analisisGuardados.filter(a => a.id !== id);
            this.aplicarFiltros();
            this.logger.info('🗑️ Cálculo eliminado del backend', 'HistorialAnalisisComponent', { id });
          },
          error: (error) => {
            this.logger.error('❌ Error al eliminar cálculo del backend', 'HistorialAnalisisComponent', { id, error });
            alert('Error al eliminar el cálculo del servidor. Inténtalo de nuevo.');
          }
        });
      } else {
        // Eliminar localmente
        this.analisisGuardados = this.analisisGuardados.filter(a => a.id !== id);
        this.guardarHistorial();
        this.aplicarFiltros();
        this.logger.info('🗑️ Análisis local eliminado', 'HistorialAnalisisComponent', { id });
      }
    }
  }

  private guardarHistorial(): void {
    localStorage.setItem('historial_analisis_bonofacil', JSON.stringify(this.analisisGuardados));
  }
} 