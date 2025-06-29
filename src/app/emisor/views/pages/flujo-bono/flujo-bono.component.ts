import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { BonoService } from '../../../../bonos/application/services/bono.service';
import { LoggerService } from '../../../../shared/services/logger.service';
import { Bono, FlujoCaja } from '../../../../bonos/domain/models/bono.model';

@Component({
  selector: 'app-flujo-bono',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="premium-container">
      <!-- Header Premium -->
      <div class="premium-header">
        <div class="header-content">
          <div class="header-info">
            <h1>💎 Flujo de Caja Premium</h1>
            <p class="subtitle" *ngIf="bono">{{ bono.nombre }}</p>
            <div class="breadcrumb">
              <a routerLink="/emisor/bonos">Mis Bonos</a>
              <span class="separator">→</span>
              <span class="current">Flujo de Caja</span>
            </div>
          </div>
          <div class="premium-badge">
            <span class="badge exclusive">🚀 Exclusivo</span>
            <span class="badge-text">Análisis profesional</span>
          </div>
        </div>
        <div class="header-actions">
          <button class="btn btn-export" (click)="exportarExcel()" [disabled]="!flujoCaja.length">
            <i class="icon">📊</i>
            Exportar Excel
          </button>
          <button class="btn btn-print" (click)="imprimir()" [disabled]="!flujoCaja.length">
            <i class="icon">🖨️</i>
            Imprimir
          </button>
          <a routerLink="/emisor/bonos" class="btn btn-secondary">
            <i class="icon">←</i>
            Volver
          </a>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading-container">
        <div class="premium-loader">
          <div class="loader-animation"></div>
          <p>Generando flujo de caja premium...</p>
        </div>
      </div>

      <!-- Error State -->
      <div *ngIf="error" class="error-container">
        <div class="error-card premium">
          <div class="error-icon">⚠️</div>
          <h3>Error en el Análisis</h3>
          <p>{{ error }}</p>
          <div class="error-actions">
            <button class="btn btn-retry" (click)="cargarDatos()">
              <i class="icon">🔄</i>
              Reintentar
            </button>
            <a routerLink="/emisor/bonos" class="btn btn-secondary">
              <i class="icon">←</i>
              Volver a Mis Bonos
            </a>
          </div>
        </div>
      </div>

      <!-- Información del Bono -->
      <div *ngIf="!loading && !error && bono" class="bono-info-section">
        <div class="info-card premium">
          <div class="card-header">
            <h2>📋 Información del Bono</h2>
            <div class="status-indicator active">
              Activo
            </div>
          </div>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">Emisor:</span>
              <span class="value">{{ bono.emisorNombre || 'Empresa Emisora' }}</span>
            </div>
            <div class="info-item">
              <span class="label">Valor Nominal:</span>
              <span class="value">{{ bono.moneda?.simbolo || '$' }} {{ bono.valorNominal | number:'1.2-2' }}</span>
            </div>
            <div class="info-item">
              <span class="label">Tasa Cupón:</span>
              <span class="value highlight">{{ bono.tasaCupon }}%</span>
            </div>
            <div class="info-item">
              <span class="label">Plazo:</span>
              <span class="value">{{ bono.plazoAnios }} años</span>
            </div>
            <div class="info-item">
              <span class="label">Frecuencia:</span>
              <span class="value">{{ bono.frecuenciaPagos }}x año</span>
            </div>
            <div class="info-item">
              <span class="label">Método:</span>
              <span class="value">{{ bono.metodoAmortizacion }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Resumen Ejecutivo -->
      <div *ngIf="!loading && !error && flujoCaja.length > 0" class="resumen-section">
        <div class="resumen-card premium">
          <div class="card-header">
            <h2>📊 Resumen Ejecutivo</h2>
          </div>
          <div class="resumen-metrics">
            <div class="metric-card primary">
              <div class="metric-icon">💰</div>
              <div class="metric-content">
                <span class="metric-label">Total Cupones</span>
                <span class="metric-value">{{ getTotalCupones() | number:'1.2-2' }}</span>
              </div>
            </div>
            <div class="metric-card success">
              <div class="metric-icon">📈</div>
              <div class="metric-content">
                <span class="metric-label">Total Amortización</span>
                <span class="metric-value">{{ getTotalAmortizacion() | number:'1.2-2' }}</span>
              </div>
            </div>
            <div class="metric-card info">
              <div class="metric-icon">💎</div>
              <div class="metric-content">
                <span class="metric-label">Flujo Total</span>
                <span class="metric-value">{{ getTotalFlujo() | number:'1.2-2' }}</span>
              </div>
            </div>
            <div class="metric-card warning">
              <div class="metric-icon">⏰</div>
              <div class="metric-content">
                <span class="metric-label">Períodos</span>
                <span class="metric-value">{{ flujoCaja.length }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabla de Flujo de Caja Premium -->
      <div *ngIf="!loading && !error && flujoCaja.length > 0" class="flujo-section">
        <div class="flujo-card premium">
          <div class="card-header">
            <h2>💎 Tabla de Flujo de Caja</h2>
            <div class="table-controls">
              <button class="btn-filter" (click)="toggleFilters()">
                <i class="icon">🔍</i>
                {{ showFilters ? 'Ocultar' : 'Filtros' }}
              </button>
            </div>
          </div>

          <!-- Filtros -->
          <div *ngIf="showFilters" class="filters-panel">
            <div class="filter-group">
              <label>Mostrar desde período:</label>
              <input type="number" [(ngModel)]="filtroDesde" (change)="aplicarFiltros()" min="1" [max]="flujoCaja.length">
            </div>
            <div class="filter-group">
              <label>Hasta período:</label>
              <input type="number" [(ngModel)]="filtroHasta" (change)="aplicarFiltros()" min="1" [max]="flujoCaja.length">
            </div>
            <button class="btn btn-reset" (click)="resetFilters()">Resetear</button>
          </div>

          <!-- Tabla Premium -->
          <div class="table-container premium">
            <table class="flujo-table premium">
              <thead>
                <tr>
                  <th>Período</th>
                  <th>Fecha</th>
                  <th>Cupón</th>
                  <th>Amortización</th>
                  <th>Flujo Total</th>
                  <th>Saldo Insoluto</th>
                  <th>Valor Presente</th>
                  <th>Progreso</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let flujo of flujoFiltrado; let i = index; trackBy: trackByPeriodo" 
                    class="flujo-row" 
                    [class.destacado]="flujo.periodo % 12 === 0"
                    [class.ultimo]="flujo.periodo === flujoCaja.length">
                  <td>
                    <div class="periodo-badge">{{ flujo.periodo }}</div>
                  </td>
                  <td>{{ formatearFecha(flujo.fecha) }}</td>
                  <td>
                    <span class="amount positive">{{ flujo.cupon | number:'1.2-2' }}</span>
                  </td>
                  <td>
                    <span class="amount neutral">{{ flujo.amortizacion | number:'1.2-2' }}</span>
                  </td>
                  <td>
                    <span class="amount primary">{{ flujo.flujoTotal | number:'1.2-2' }}</span>
                  </td>
                  <td>
                    <span class="amount info">{{ flujo.saldoInsoluto | number:'1.2-2' }}</span>
                  </td>
                  <td>
                    <span class="amount success">{{ flujo.valorPresente | number:'1.2-2' }}</span>
                  </td>
                  <td>
                    <div class="progress-bar">
                      <div class="progress-fill" [style.width.%]="getProgreso(flujo.periodo)"></div>
                    </div>
                    <span class="progress-text">{{ getProgreso(flujo.periodo) | number:'1.0-0' }}%</span>
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="totals-row">
                  <td colspan="2"><strong>TOTALES</strong></td>
                  <td><strong class="amount positive">{{ getTotalCupones() | number:'1.2-2' }}</strong></td>
                  <td><strong class="amount neutral">{{ getTotalAmortizacion() | number:'1.2-2' }}</strong></td>
                  <td><strong class="amount primary">{{ getTotalFlujo() | number:'1.2-2' }}</strong></td>
                  <td>-</td>
                  <td><strong class="amount success">{{ getTotalVP() | number:'1.2-2' }}</strong></td>
                  <td>100%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      <!-- Sin Datos -->
      <div *ngIf="!loading && !error && flujoCaja.length === 0" class="no-data-container">
        <div class="no-data-card premium">
          <div class="no-data-icon">📊</div>
          <h3>Sin Flujo de Caja</h3>
          <p>No se encontraron datos de flujo de caja para este bono.</p>
          <div class="no-data-actions">
            <button class="btn btn-primary" (click)="cargarDatos()">
              <i class="icon">🔄</i>
              Recargar
            </button>
            <a routerLink="/emisor/bonos" class="btn btn-secondary">
              <i class="icon">←</i>
              Volver a Mis Bonos
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .premium-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .premium-header {
      background: white;
      border-radius: 20px;
      padding: 30px 40px;
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
      margin-bottom: 30px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 30px;
    }

    .header-info h1 {
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
      margin: 0 0 10px 0;
    }

    .breadcrumb {
      color: #6c757d;
      font-size: 0.9rem;
    }

    .breadcrumb a {
      color: #667eea;
      text-decoration: none;
    }

    .separator {
      margin: 0 8px;
    }

    .current {
      font-weight: 600;
    }

    .premium-badge {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 5px;
    }

    .badge.exclusive {
      background: linear-gradient(135deg, #ffd700 0%, #ff8c00 100%);
      color: #000;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: 700;
      box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
    }

    .badge-text {
      color: #6c757d;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .header-actions {
      display: flex;
      gap: 15px;
    }

    .btn {
      padding: 12px 20px;
      border-radius: 12px;
      font-weight: 600;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      border: none;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-export {
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
      color: white;
      box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
    }

    .btn-print {
      background: linear-gradient(135deg, #17a2b8 0%, #6f42c1 100%);
      color: white;
      box-shadow: 0 4px 15px rgba(23, 162, 184, 0.3);
    }

    .btn-secondary {
      background: #ecf0f1;
      color: #2c3e50;
    }

    .btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    /* Loading States */
    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 400px;
    }

    .premium-loader {
      text-align: center;
      color: white;
    }

    .loader-animation {
      width: 60px;
      height: 60px;
      border: 4px solid rgba(255, 255, 255, 0.3);
      border-top: 4px solid white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Error States */
    .error-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 400px;
    }

    .error-card.premium {
      background: white;
      border-radius: 20px;
      padding: 40px;
      text-align: center;
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
      max-width: 500px;
    }

    .error-icon {
      font-size: 4rem;
      margin-bottom: 20px;
    }

    .error-actions {
      display: flex;
      gap: 15px;
      justify-content: center;
      margin-top: 20px;
    }

    /* Info Cards */
    .info-card.premium, .resumen-card.premium, .flujo-card.premium {
      background: white;
      border-radius: 20px;
      padding: 30px;
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
      margin-bottom: 30px;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 25px;
      padding-bottom: 15px;
      border-bottom: 2px solid #f1f3f4;
    }

    .card-header h2 {
      color: #2c3e50;
      font-size: 1.8rem;
      font-weight: 600;
      margin: 0;
    }

    .status-indicator {
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 0.9rem;
      font-weight: 600;
    }

    .status-indicator.active {
      background: #d4edda;
      color: #155724;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
    }

    .info-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 12px;
      border-left: 4px solid #667eea;
    }

    .info-item .label {
      color: #6c757d;
      font-weight: 600;
    }

    .info-item .value {
      color: #2c3e50;
      font-weight: 700;
    }

    .info-item .value.highlight {
      color: #28a745;
    }

    /* Resumen Metrics */
    .resumen-metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
    }

    .metric-card {
      background: white;
      padding: 20px;
      border-radius: 15px;
      border: 1px solid #e9ecef;
      display: flex;
      align-items: center;
      gap: 15px;
      transition: all 0.3s ease;
    }

    .metric-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    }

    .metric-card.primary { border-left: 4px solid #007bff; }
    .metric-card.success { border-left: 4px solid #28a745; }
    .metric-card.info { border-left: 4px solid #17a2b8; }
    .metric-card.warning { border-left: 4px solid #ffc107; }

    .metric-icon {
      font-size: 2.5rem;
    }

    .metric-content {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .metric-label {
      color: #6c757d;
      font-size: 0.9rem;
      font-weight: 600;
    }

    .metric-value {
      color: #2c3e50;
      font-size: 1.5rem;
      font-weight: 700;
    }

    /* Table Styles */
    .table-container.premium {
      overflow-x: auto;
      border-radius: 15px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .flujo-table.premium {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.9rem;
    }

    .flujo-table.premium th {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 15px 10px;
      text-align: center;
      font-weight: 600;
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .flujo-table.premium td {
      padding: 12px 10px;
      text-align: center;
      border-bottom: 1px solid #e9ecef;
      vertical-align: middle;
    }

    .flujo-row {
      transition: all 0.2s ease;
    }

    .flujo-row:hover {
      background: #f8fbff;
    }

    .flujo-row.destacado {
      background: #fff3cd;
    }

    .flujo-row.ultimo {
      background: #d4edda;
      font-weight: 600;
    }

    .periodo-badge {
      background: #667eea;
      color: white;
      padding: 4px 8px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.8rem;
    }

    .amount {
      font-weight: 600;
      font-family: 'Courier New', monospace;
    }

    .amount.positive { color: #28a745; }
    .amount.neutral { color: #6c757d; }
    .amount.primary { color: #007bff; }
    .amount.info { color: #17a2b8; }
    .amount.success { color: #28a745; }

    .progress-bar {
      width: 100%;
      height: 8px;
      background: #e9ecef;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 5px;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
      transition: width 0.5s ease;
    }

    .progress-text {
      font-size: 0.8rem;
      color: #6c757d;
      font-weight: 600;
    }

    .totals-row {
      background: #f8f9fa;
      border-top: 2px solid #dee2e6;
    }

    .totals-row td {
      padding: 15px 10px;
      font-weight: 700;
    }

    /* Filters */
    .filters-panel {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 12px;
      margin-bottom: 20px;
      display: flex;
      gap: 20px;
      align-items: end;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .filter-group label {
      font-weight: 600;
      color: #2c3e50;
      font-size: 0.9rem;
    }

    .filter-group input {
      padding: 8px 12px;
      border: 1px solid #ced4da;
      border-radius: 8px;
      font-size: 0.9rem;
    }

    .btn-filter {
      background: #667eea;
      color: white;
      padding: 8px 16px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .premium-header {
        flex-direction: column;
        gap: 20px;
        text-align: center;
        padding: 20px;
      }

      .header-content {
        flex-direction: column;
        gap: 15px;
      }

      .header-info h1 {
        font-size: 2rem;
      }

      .header-actions {
        flex-wrap: wrap;
        justify-content: center;
      }

      .info-grid {
        grid-template-columns: 1fr;
      }

      .resumen-metrics {
        grid-template-columns: repeat(2, 1fr);
      }

      .flujo-table.premium {
        font-size: 0.8rem;
      }

      .flujo-table.premium th,
      .flujo-table.premium td {
        padding: 8px 5px;
      }

      .filters-panel {
        flex-direction: column;
        gap: 15px;
      }
    }

    .icon {
      font-size: 1.1em;
    }
  `]
})
export class FlujoBonoComponent implements OnInit {
  bono: Bono | null = null;
  flujoCaja: FlujoCaja[] = [];
  flujoFiltrado: FlujoCaja[] = [];
  loading = false;
  error = '';
  bonoId: number = 0;

  // Filtros y configuración
  showFilters = false;
  filtroDesde = 1;
  filtroHasta = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bonoService: BonoService,
    private logger: LoggerService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.bonoId = +params['id'];
      if (this.bonoId) {
        this.cargarDatos();
      } else {
        this.error = 'ID de bono no válido';
      }
    });
  }

  cargarDatos(): void {
    this.loading = true;
    this.error = '';
    
    // Cargar información del bono y flujo de caja
    this.bonoService.getMiBono(this.bonoId).subscribe({
      next: (bono) => {
        this.bono = bono;
        this.cargarFlujoCaja();
      },
      error: (error) => {
        this.error = 'Error al cargar el bono: ' + (error.error?.message || error.message);
        this.loading = false;
        this.logger.error('❌ Error cargando bono', 'FlujoBonoComponent', { error });
      }
    });
  }

  cargarFlujoCaja(): void {
    this.bonoService.getFlujoBono(this.bonoId).subscribe({
      next: (flujo) => {
        this.flujoCaja = flujo;
        this.filtroHasta = flujo.length;
        this.aplicarFiltros();
        this.loading = false;
        this.logger.info('✅ Flujo de caja cargado', 'FlujoBonoComponent', {
          bonoId: this.bonoId,
          periodos: flujo.length
        });
      },
      error: (error) => {
        this.error = 'Error al cargar flujo de caja: ' + (error.error?.message || error.message);
        this.loading = false;
        this.logger.error('❌ Error cargando flujo', 'FlujoBonoComponent', { error });
      }
    });
  }

  // Métodos de cálculo
  getTotalCupones(): number {
    return this.flujoCaja.reduce((total, flujo) => total + flujo.cupon, 0);
  }

  getTotalAmortizacion(): number {
    return this.flujoCaja.reduce((total, flujo) => total + flujo.amortizacion, 0);
  }

  getTotalFlujo(): number {
    return this.flujoCaja.reduce((total, flujo) => total + flujo.flujoTotal, 0);
  }

  getTotalVP(): number {
    return this.flujoCaja.reduce((total, flujo) => total + flujo.valorPresente, 0);
  }

  getProgreso(periodo: number): number {
    return (periodo / this.flujoCaja.length) * 100;
  }

  // Métodos de utilidad
  formatearFecha(fecha: string): string {
    try {
      return new Date(fecha).toLocaleDateString('es-ES');
    } catch {
      return fecha;
    }
  }

  trackByPeriodo(index: number, flujo: FlujoCaja): number {
    return flujo.periodo;
  }

  // Métodos de filtrado
  aplicarFiltros(): void {
    this.flujoFiltrado = this.flujoCaja.filter(flujo => 
      flujo.periodo >= this.filtroDesde && flujo.periodo <= this.filtroHasta
    );
  }

  resetFilters(): void {
    this.filtroDesde = 1;
    this.filtroHasta = this.flujoCaja.length;
    this.aplicarFiltros();
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  // Métodos de exportación
  exportarExcel(): void {
    this.logger.info('📊 Exportando a Excel', 'FlujoBonoComponent');
    alert('Funcionalidad de exportación será implementada próximamente');
  }

  imprimir(): void {
    this.logger.info('🖨️ Imprimiendo flujo', 'FlujoBonoComponent');
    window.print();
  }
} 