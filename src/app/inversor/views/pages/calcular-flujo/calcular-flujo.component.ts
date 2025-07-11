import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BonoService } from '../../../../bonos/application/services/bono.service';
import { LoggerService } from '../../../../shared/services/logger.service';
import { Bono, FlujoCaja } from '../../../../bonos/domain/models/bono.model';
import { Subscription, filter } from 'rxjs';

@Component({
  selector: 'app-calcular-flujo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="header-content">
          <h1>Flujo de Caja del Bono</h1>
          <p class="subtitle" *ngIf="bono">{{ bono.nombre }}</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-primary" (click)="volverAlCatalogo()">
            <i class="icon">←</i>
            Volver al Catálogo
          </button>
        </div>
      </div>

      <div *ngIf="loading" class="loading-container">
        <div class="spinner"></div>
        <p>Cargando flujo de caja...</p>
      </div>

      <div *ngIf="error" class="error-container">
        <div class="error-card">
          <h3>Error</h3>
          <p>{{ error }}</p>
          <button class="btn-retry" (click)="cargarDatos()">Reintentar</button>
        </div>
      </div>

      <div *ngIf="!loading && !error" class="content-container">
        <!-- Información del Bono -->
        <div *ngIf="bono" class="bono-info">
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
              <span class="value">{{ bono.metodoAmortizacion || 'N/A' }}</span>
            </div>
          </div>
        </div>

        <!-- Flujo de Caja -->
        <div class="flujo-section">
          <div class="flujo-card">
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
              <button class="btn btn-confirm" (click)="aplicarFiltros()">Confirmar</button>
            </div>

            <div *ngIf="errorFlujo" class="error-flujo">
              <p>{{ errorFlujo }}</p>
            </div>

            <!-- Mensaje cuando no hay datos reales -->
            <div *ngIf="!loadingFlujo && !errorFlujo && flujoCaja.length === 0" class="no-data-real">
              <div class="no-data-card">
                <h4>⚠️ Sin Datos de Flujo de Caja</h4>
                <p>No se encontraron datos de flujo de caja para este bono.</p>
                <div class="action-buttons">
                  <button class="btn-retry" (click)="calcularFlujo()" [disabled]="loadingFlujo">
                    🔄 Reintentar
                  </button>
                  <button class="btn-back" (click)="volverAlCatalogo()">
                    ← Volver al Catálogo
                  </button>
                </div>
              </div>
            </div>

            <!-- Tabla de Flujo de Caja -->
            <div *ngIf="flujoCaja.length > 0" class="table-container">
              <table class="flujo-table">
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
                  <tr *ngFor="let flujo of flujoFiltrado; let i = index" 
                      class="flujo-row" 
                      [class.destacado]="flujo.periodo % 12 === 0"
                      [class.ultimo]="flujo.periodo === flujoCaja.length">
                    <td>
                      <div class="periodo-badge">{{ flujo.periodo }}</div>
                    </td>
                    <td>{{ flujo.fecha }}</td>
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
      font-weight: 500;
    }

    .header-actions {
      display: flex;
      gap: 15px;
    }

    .content-container {
      background: white;
      border-radius: 20px;
      padding: 40px;
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
      margin-bottom: 30px;
    }

    .bono-info {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      padding: 25px;
      border-radius: 12px;
      margin-bottom: 30px;
      border: 1px solid #e9ecef;
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

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
    }

    .flujo-section {
      margin-top: 30px;
    }

    .flujo-card {
      background: white;
      border-radius: 15px;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .table-controls {
      display: flex;
      gap: 10px;
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

    /* Filtros */
    .filters-panel {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 12px;
      margin-bottom: 20px;
      display: flex;
      gap: 20px;
      align-items: flex-end;
      flex-wrap: wrap;
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

    .btn-reset {
      background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
      color: white;
      padding: 8px 16px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
    }

    .btn-confirm {
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
      color: white;
      padding: 8px 16px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
    }

    .btn-retry {
      background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
      color: white;
      padding: 12px 20px;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.95rem;
      box-shadow: 0 4px 15px rgba(0, 123, 255, 0.3);
      transition: all 0.3s ease;
    }

    .btn-retry:hover:not(:disabled) {
      background: linear-gradient(135deg, #0056b3 0%, #004085 100%);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 123, 255, 0.4);
    }

    .btn-retry:disabled {
      background: #6c757d;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }

    .error-flujo {
      background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
      color: #721c24;
      padding: 20px;
      border-radius: 12px;
      margin-bottom: 20px;
      border: 1px solid #f5c6cb;
      text-align: center;
    }

    .no-data-real {
      margin-bottom: 20px;
    }

    .no-data-card {
      background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
      color: #856404;
      padding: 30px;
      border-radius: 12px;
      border: 1px solid #ffeaa7;
      text-align: center;
      max-width: 600px;
      margin: 0 auto;
    }

    .no-data-card h4 {
      color: #856404;
      font-size: 1.4rem;
      font-weight: 600;
      margin: 0 0 15px 0;
    }

    .no-data-card p {
      color: #856404;
      margin: 10px 0;
      line-height: 1.6;
    }

    .action-buttons {
      display: flex;
      gap: 15px;
      justify-content: center;
      margin-top: 25px;
      flex-wrap: wrap;
    }

    .btn-back {
      background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
      color: white;
      padding: 12px 20px;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.95rem;
      box-shadow: 0 4px 15px rgba(108, 117, 125, 0.3);
      transition: all 0.3s ease;
    }

    .btn-back:hover:not(:disabled) {
      background: linear-gradient(135deg, #5a6268 0%, #495057 100%);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(108, 117, 125, 0.4);
    }

    .table-container {
      overflow-x: auto;
      border-radius: 15px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .flujo-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.9rem;
    }

    .flujo-table th {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 15px 10px;
      text-align: center;
      font-weight: 600;
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .flujo-table td {
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

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px;
      background: white;
      border-radius: 20px;
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
    }

    .spinner {
      width: 50px;
      height: 50px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 20px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .loading-container p {
      color: #6c757d;
      font-size: 1.1rem;
    }

    .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px;
      background: white;
      border-radius: 20px;
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
    }

    .error-card {
      background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
      color: #721c24;
      padding: 30px;
      border-radius: 12px;
      border: 1px solid #f5c6cb;
      text-align: center;
      max-width: 400px;
    }

    .error-card h3 {
      margin: 0 0 15px 0;
      font-size: 1.3rem;
    }

    .error-card p {
      margin: 0 0 20px 0;
      line-height: 1.5;
    }

    .icon {
      font-size: 1.1em;
    }

    @media (max-width: 768px) {
      .page-container {
        padding: 15px;
      }

      .page-header {
        flex-direction: column;
        gap: 20px;
        padding: 20px;
        text-align: center;
      }

      .header-content h1 {
        font-size: 2rem;
      }

      .content-container {
        padding: 20px;
      }

      .info-grid {
        grid-template-columns: 1fr;
      }

      .filters-panel {
        flex-direction: column;
      }

      .flujo-table th,
      .flujo-table td {
        padding: 8px 6px;
        font-size: 0.8rem;
      }
    }
  `]
})
export class CalcularFlujoComponent implements OnInit, OnDestroy {
  bono: Bono | null = null;
  flujoCaja: FlujoCaja[] = [];
  flujoFiltrado: FlujoCaja[] = [];
  loading = false;
  loadingFlujo = false;
  error = '';
  errorFlujo = '';
  bonoId: number = 0;
  showFilters = false;
  filtroDesde = 1;
  filtroHasta = 0;
  private routerSubscription: Subscription | null = null;
  private navigationHistory: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bonoService: BonoService,
    private logger: LoggerService
  ) {
    // Suscribirse a los eventos de navegación para rastrear el historial
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.navigationHistory.push(event.urlAfterRedirects);
        // Mantener solo las últimas 10 rutas para evitar crecimiento excesivo
        if (this.navigationHistory.length > 10) {
          this.navigationHistory.shift();
        }
        this.logger.info('🧭 Navegación registrada', 'CalcularFlujoComponent', { 
          ruta: event.urlAfterRedirects,
          historial: this.navigationHistory.length
        });
      });
  }

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

  ngOnDestroy(): void {
    // Limpiar la suscripción al destruir el componente
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  cargarDatos(): void {
    this.loading = true;
    this.error = '';
    
    this.bonoService.getBonoDetalle(this.bonoId).subscribe({
      next: (bono) => {
        if (!bono) {
          this.error = 'No se encontró información del bono';
          this.loading = false;
          return;
        }
        
        this.bono = bono;
        this.loading = false;
        this.logger.info('✅ Información del bono cargada', 'CalcularFlujoComponent', { 
          bonoId: this.bonoId, 
          bono: this.bono.nombre
        });
        
        // Una vez que tenemos la información del bono, calculamos el flujo
        this.calcularFlujo();
      },
      error: (error) => {
        this.error = 'Error al cargar el bono: ' + (error.message || 'Error desconocido');
        this.loading = false;
        this.logger.error('❌ Error cargando bono', 'CalcularFlujoComponent', { error });
      }
    });
  }

  calcularFlujo(): void {
    if (!this.bonoId || !this.bono) return;
    
    this.loadingFlujo = true;
    this.errorFlujo = '';
    
    // Solo usar datos reales del backend
    this.bonoService.getFlujoBonoInversor(this.bonoId).subscribe({
      next: (flujo) => {
        // Procesar respuesta del backend
        let flujoProcesado: FlujoCaja[] = [];
        
        // Procesar datos del backend
        const flujoData = flujo as any;
        if (flujo && typeof flujo === 'object' && !Array.isArray(flujo)) {
          // Buscar la propiedad que contiene el array
          if (flujoData.data && Array.isArray(flujoData.data)) {
            flujoProcesado = flujoData.data;
          } else if (flujoData.flujoCaja && Array.isArray(flujoData.flujoCaja)) {
            flujoProcesado = flujoData.flujoCaja;
          } else if (flujoData.flujos && Array.isArray(flujoData.flujos)) {
            flujoProcesado = flujoData.flujos;
          } else {
            flujoProcesado = [flujo];
          }
        } else if (Array.isArray(flujo)) {
          // Mapear datos del backend al formato del frontend
          flujoProcesado = flujo.map((item: any) => ({
            periodo: item.periodo || 0,
            fecha: this.convertirFecha(item.fecha),
            cupon: item.interes || 0,  // Backend: "interes" → Frontend: "cupon"
            amortizacion: item.amortizacion || 0,
            flujoTotal: item.flujo || item.cuota || 0, // Backend: "flujo" → Frontend: "flujoTotal"
            saldoInsoluto: item.saldo || 0,
            valorPresente: item.valorActual || 0
          }));
        }
        
        // Corregir y recalcular el flujo para evitar inconsistencias
        this.flujoCaja = this.recalcularFlujo(flujoProcesado);
        
        // Inicializar el filtro y flujoFiltrado
        this.filtroDesde = 1;
        this.filtroHasta = this.flujoCaja.length;
        this.flujoFiltrado = [...this.flujoCaja];
        
        this.loadingFlujo = false;
        this.logger.info('✅ Flujo de caja real obtenido', 'CalcularFlujoComponent', {
          bonoId: this.bonoId,
          periodos: this.flujoCaja.length,
          tienedatos: this.flujoCaja.length > 0
        });
      },
      error: (error) => {
        this.errorFlujo = `Error al obtener flujo de caja: ${error.message}`;
        this.loadingFlujo = false;
        this.logger.error('❌ Error obteniendo flujo de caja', 'CalcularFlujoComponent', { 
          bonoId: this.bonoId, 
          error: error.message 
        });
      }
    });
  }

  /**
   * Recalcula y corrige el flujo de caja para asegurar consistencia en los valores
   * @param flujoOriginal Flujo de caja original que puede tener inconsistencias
   * @returns Flujo de caja corregido
   */
  private recalcularFlujo(flujoOriginal: FlujoCaja[]): FlujoCaja[] {
    if (!flujoOriginal || flujoOriginal.length === 0 || !this.bono) {
      return [];
    }

    const valorNominal = this.bono.valorNominal || 0;
    const metodo = this.bono.metodoAmortizacion || 'AMERICANO';
    const flujoCorregido: FlujoCaja[] = [];
    
    // Crear un nuevo array de flujos corregido
    for (let i = 0; i < flujoOriginal.length; i++) {
      const flujoActual = flujoOriginal[i];
      const esPeriodoInicial = flujoActual.periodo === 0;
      const esUltimoPeriodo = i === flujoOriginal.length - 1;
      
      // Calcular valores correctos
      let cupon = flujoActual.cupon || 0;
      let amortizacion = flujoActual.amortizacion || 0;
      let saldoInsoluto: number;
      
      // Validar cálculos para periodo inicial (inversión)
      if (esPeriodoInicial) {
        // En el periodo 0, se registra la inversión inicial como un flujo negativo
        cupon = 0;
        amortizacion = 0;
        saldoInsoluto = valorNominal;
        
        // El flujo total es negativo, ya que es una salida de dinero
        const flujoTotal = -valorNominal;
        
        flujoCorregido.push({
          ...flujoActual,
          cupon,
          amortizacion,
          flujoTotal,
          saldoInsoluto
        });
      } else {
        // Calcular saldo insoluto
        if (metodo === 'AMERICANO') {
          // En método americano, el saldo insoluto es constante hasta el último período
          saldoInsoluto = esUltimoPeriodo ? 0 : valorNominal;
        } else if (metodo === 'ALEMAN') {
          // En método alemán, el saldo se reduce linealmente
          const totalPeriodos = flujoOriginal.length - 1; // Excluir periodo 0
          const amortizacionPorPeriodo = valorNominal / totalPeriodos;
          saldoInsoluto = Math.max(0, valorNominal - (amortizacionPorPeriodo * flujoActual.periodo));
        } else if (metodo === 'FRANCES') {
          // En método francés, usar el saldo calculado o recalcularlo
          saldoInsoluto = i > 0 
            ? flujoCorregido[i - 1].saldoInsoluto - amortizacion 
            : valorNominal - amortizacion;
        } else {
          // Default (por seguridad)
          saldoInsoluto = flujoActual.saldoInsoluto || 0;
        }
        
        // Recalcular flujo total como la suma de cupón y amortización
        const flujoTotal = cupon + amortizacion;
        
        flujoCorregido.push({
          ...flujoActual,
          cupon,
          amortizacion,
          flujoTotal,
          saldoInsoluto
        });
      }
    }
    
    return flujoCorregido;
  }

  volverAlCatalogo(): void {
    try {
      // Estrategia 1: Intentar navegación absoluta con opciones de skipLocationChange
      this.logger.info('🧭 Navegando al catálogo (ruta absoluta)', 'CalcularFlujoComponent');
      this.router.navigate(['/inversor/catalogo'], { 
        replaceUrl: true // Reemplazar la URL actual en el historial
      }).then(success => {
        if (!success) {
          // Estrategia 2: Si falla, intentar navegación relativa
          this.logger.warn('⚠️ Navegación absoluta falló, intentando ruta relativa', 'CalcularFlujoComponent');
          this.router.navigate(['../catalogo'], { 
            relativeTo: this.route,
            replaceUrl: true
          }).then(relativeSuccess => {
            if (!relativeSuccess) {
              // Estrategia 3: Si ambas fallan, usar history.back() con verificación
              this.logger.warn('⚠️ Navegación relativa falló, intentando history.back()', 'CalcularFlujoComponent');
              
              // Verificar si hay una ruta previa en nuestro historial que contenga "catalogo"
              const prevCatalogRoute = this.navigationHistory
                .slice(0, -1) // Excluir la ruta actual
                .reverse() // Invertir para buscar desde la más reciente
                .find(route => route.includes('catalogo'));
              
              if (prevCatalogRoute) {
                // Si encontramos una ruta previa al catálogo, navegar directamente a ella
                this.router.navigateByUrl(prevCatalogRoute, { replaceUrl: true });
              } else {
                // Como último recurso, usar history.back()
                window.history.back();
              }
            }
          });
        }
      });
    } catch (error) {
      this.logger.error('❌ Error en navegación', 'CalcularFlujoComponent', { error });
      // Fallback final: Redirigir al dashboard del inversor
      this.router.navigate(['/inversor/dashboard'], { replaceUrl: true });
    }
  }

  private convertirFecha(fecha: any): string {
    if (Array.isArray(fecha) && fecha.length >= 3) {
      // Convertir [2025, 12, 23] a "23/12/2025"
      const [año, mes, dia] = fecha;
      return `${dia.toString().padStart(2, '0')}/${mes.toString().padStart(2, '0')}/${año}`;
    } else if (typeof fecha === 'string') {
      return fecha;
    } else {
      return 'N/A';
    }
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  aplicarFiltros(): void {
    if (this.filtroDesde > this.filtroHasta) {
      this.filtroHasta = this.filtroDesde;
    }
    this.flujoFiltrado = this.flujoCaja.slice(this.filtroDesde - 1, this.filtroHasta);
  }

  resetFilters(): void {
    this.filtroDesde = 1;
    this.filtroHasta = this.flujoCaja.length;
    this.flujoFiltrado = [...this.flujoCaja];
    this.showFilters = false;
  }

  getProgreso(periodo: number): number {
    return (periodo / this.flujoCaja.length) * 100;
  }

  getTotalCupones(): number {
    return this.flujoCaja.reduce((total, flujo) => total + flujo.cupon, 0);
  }

  getTotalAmortizacion(): number {
    return this.flujoCaja.reduce((total, flujo) => total + flujo.amortizacion, 0);
  }

  getTotalFlujo(): number {
    // Calcular la suma real de todos los flujos, incluyendo la amortización
    return this.flujoCaja
      .filter(flujo => flujo.periodo > 0) // Excluir el periodo inicial (inversión)
      .reduce((total, flujo) => total + flujo.cupon + flujo.amortizacion, 0);
  }

  getTotalVP(): number {
    return this.flujoCaja.reduce((total, flujo) => total + flujo.valorPresente, 0);
  }
}
