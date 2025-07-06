import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BonoService } from '../../../../bonos/application/services/bono.service';
import { Bono } from '../../../../bonos/domain/models/bono.model';
import { LoggerService } from '../../../../shared/services/logger.service';

@Component({
  selector: 'app-catalogo-bonos',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="page-container">
      <!-- Header Principal -->
      <div class="page-header">
        <div class="header-content">
          <h1>Catálogo de Bonos</h1>
          <p class="subtitle">Explora las mejores oportunidades de inversión disponibles en el mercado</p>
        </div>
        <div class="header-actions">
          <a routerLink="/inversor/mis-calculos" class="btn btn-primary">
            <i class="icon">📊</i>
            Mis Cálculos
          </a>
          <a routerLink="/inversor/dashboard" class="btn btn-secondary">
            <i class="icon">🏠</i>
            Dashboard
          </a>
        </div>
      </div>

      <!-- Filtros Avanzados -->
      <div class="content-container">
        <div class="section-header">
          <h2 class="section-title">Filtros de Búsqueda</h2>
          <div class="filter-stats">
            <span class="stats-text">{{ bonos.length }} bonos disponibles</span>
          </div>
        </div>

        <div class="filters-section">
          <div class="filter-group">
            <label class="filter-label">Moneda</label>
            <select class="filter-select" [(ngModel)]="filtroMoneda" (change)="filtrarPorMoneda()">
              <option value="">Todas las monedas</option>
              <option value="PEN">Soles Peruanos (PEN)</option>
              <option value="USD">Dólares Americanos (USD)</option>
              <option value="EUR">Euros (EUR)</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label class="filter-label">Tasa Mínima (%)</label>
            <input type="number" class="filter-input" [(ngModel)]="tasaMinima" step="0.1" min="0" max="100" placeholder="0.0">
          </div>
          
          <div class="filter-group">
            <label class="filter-label">Tasa Máxima (%)</label>
            <input type="number" class="filter-input" [(ngModel)]="tasaMaxima" step="0.1" min="0" max="100" placeholder="100.0">
          </div>
          
          <div class="filter-actions">
            <button class="btn btn-primary" (click)="aplicarFiltros()" [disabled]="loading">
              <i class="icon">🔍</i>
              Filtrar
            </button>
            <button class="btn btn-outline" (click)="limpiarFiltros()" [disabled]="loading">
              <i class="icon">🧹</i>
              Limpiar
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading-container">
        <div class="spinner"></div>
        <p>Cargando oportunidades de inversión...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error" class="error-container">
        <div class="error-card">
          <i class="error-icon">❌</i>
          <h3>Oops! Algo salió mal</h3>
          <p>{{ error }}</p>
          <button class="btn btn-primary" (click)="cargarCatalogoBonos()">
            <i class="icon">🔄</i>
            Reintentar
          </button>
        </div>
      </div>

      <!-- Catálogo de Bonos -->
      <div *ngIf="!loading && !error" class="content-container">
        <div class="section-header">
          <h2 class="section-title">Oportunidades de Inversión</h2>
        </div>

        <!-- Empty State -->
        <div *ngIf="bonos.length === 0" class="empty-state">
          <div class="empty-card">
            <i class="empty-icon">📋</i>
            <h3>No hay bonos disponibles</h3>
            <p>Ups, por ahora no hay bonos disponibles en el catálogo.</p>
            <p>Te invitamos a revisar más tarde o contactar con nuestro equipo de soporte.</p>
            <button class="btn btn-primary" (click)="limpiarFiltros()">
              <i class="icon">🔄</i>
              Intentar de nuevo
            </button>
          </div>
        </div>

        <!-- Grid de Bonos -->
        <div *ngIf="bonos.length > 0" class="bonos-grid">
          <div *ngFor="let bono of bonos; trackBy: trackByBonoId" class="bono-card">
            <div class="card-header">
              <div class="bono-title">
                <h3>{{ bono.nombre }}</h3>
                <div class="emisor-badge">
                  <i class="icon">🏛️</i>
                  {{ bono.emisorNombre || 'Emisor Corporativo' }}
                </div>
              </div>
              <div class="card-actions">
                <span class="currency-badge">{{ bono.moneda?.codigo || 'USD' }}</span>
              </div>
            </div>

            <div class="card-content">
              <div class="financial-highlights">
                <div class="highlight-item primary">
                  <span class="highlight-label">Valor Nominal</span>
                  <span class="highlight-value">{{ formatCurrency(bono.valorNominal, bono.moneda?.codigo) }}</span>
                </div>
                <div class="highlight-item success">
                  <span class="highlight-label">Tasa Cupón</span>
                  <span class="highlight-value rate">{{ bono.tasaCupon }}%</span>
                </div>
              </div>

              <div class="bono-details">
                <div class="detail-row">
                  <span class="detail-icon">⏱️</span>
                  <span class="detail-label">Plazo</span>
                  <span class="detail-value">{{ bono.plazoAnios }} años</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-icon">📅</span>
                  <span class="detail-label">Frecuencia</span>
                  <span class="detail-value">{{ bono.frecuenciaPagos }} pagos/año</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-icon">⚙️</span>
                  <span class="detail-label">Amortización</span>
                  <span class="detail-value">{{ formatMetodoAmortizacion(bono.metodoAmortizacion) }}</span>
                </div>
                
                <div class="detail-row" *ngIf="bono.fechaEmision">
                  <span class="detail-icon">📊</span>
                  <span class="detail-label">Fecha Emisión</span>
                  <span class="detail-value">{{ bono.fechaEmision | date:'dd/MM/yyyy' }}</span>
                </div>
              </div>

              <div class="bono-description" *ngIf="bono.descripcion">
                <p>{{ bono.descripcion }}</p>
              </div>
            </div>
            
            <div class="card-footer">
              <div class="action-buttons">
                <a [routerLink]="['/inversor/detalle-bono', bono.id]" class="btn btn-outline-primary btn-sm">
                  <i class="icon">📋</i>
                  Ver Detalles
                </a>
                <a [routerLink]="['/inversor/calcular-flujo', bono.id]" class="btn btn-primary btn-sm">
                  <i class="icon">📊</i>
                  Calcular Flujo
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation Footer -->
      <div class="navigation-footer">
        <a routerLink="/inversor/dashboard" class="btn btn-back">
          <i class="icon">←</i>
          Volver al Dashboard
        </a>
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

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
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

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
    }

    .btn-secondary {
      background: #ecf0f1;
      color: #2c3e50;
    }

    .btn-secondary:hover {
      background: #d5dbdb;
    }

    .btn-outline {
      background: transparent;
      color: #667eea;
      border: 2px solid #667eea;
    }

    .btn-outline:hover {
      background: #667eea;
      color: white;
    }

    .btn-outline-primary {
      background: transparent;
      color: #17a2b8;
      border: 2px solid #17a2b8;
    }

    .btn-outline-primary:hover {
      background: #17a2b8;
      color: white;
    }

    .btn-back {
      background: #6c757d;
      color: white;
    }

    .btn-back:hover {
      background: #5a6268;
    }

    .content-container {
      background: white;
      border-radius: 20px;
      padding: 40px;
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
      margin-bottom: 30px;
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

    .filter-stats .stats-text {
      color: #667eea;
      font-weight: 600;
      font-size: 1.1rem;
    }

    .filters-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      align-items: end;
      margin-bottom: 20px;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .filter-label {
      font-weight: 600;
      color: #495057;
      font-size: 0.9rem;
    }

    .filter-select,
    .filter-input {
      padding: 12px 16px;
      border: 2px solid #e9ecef;
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.3s ease;
    }

    .filter-select:focus,
    .filter-input:focus {
      outline: none;
      border-color: #667eea;
    }

    .filter-actions {
      display: flex;
      gap: 10px;
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

    .error-container {
      text-align: center;
      padding: 40px;
      background: white;
      border-radius: 20px;
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
    }

    .error-card {
      background: #f8d7da;
      color: #721c24;
      padding: 30px;
      border-radius: 12px;
      border: 1px solid #f5c6cb;
    }

    .error-icon {
      font-size: 3rem;
      margin-bottom: 15px;
      display: block;
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
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: 20px;
      opacity: 0.5;
      display: block;
    }

    .bonos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 25px;
    }

    .bono-card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
      border: 1px solid #e9ecef;
      transition: all 0.3s ease;
      overflow: hidden;
    }

    .bono-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
    }

    .card-header {
      padding: 25px 25px 0;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .bono-title h3 {
      color: #2c3e50;
      font-size: 1.3rem;
      font-weight: 700;
      margin: 0 0 8px 0;
    }

    .emisor-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #6c757d;
      font-size: 0.9rem;
      font-style: italic;
    }

    .currency-badge {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 700;
      text-transform: uppercase;
    }

    .card-content {
      padding: 20px 25px;
    }

    .financial-highlights {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-bottom: 20px;
    }

    .highlight-item {
      padding: 15px;
      border-radius: 12px;
      text-align: center;
    }

    .highlight-item.primary {
      background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
    }

    .highlight-item.success {
      background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
    }

    .highlight-label {
      display: block;
      font-size: 0.8rem;
      color: #6c757d;
      font-weight: 600;
      margin-bottom: 5px;
      text-transform: uppercase;
    }

    .highlight-value {
      display: block;
      font-size: 1.2rem;
      font-weight: 700;
      color: #2c3e50;
    }

    .highlight-value.rate {
      color: #28a745;
    }

    .bono-details {
      margin-bottom: 15px;
    }

    .detail-row {
      display: flex;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #f1f3f4;
    }

    .detail-row:last-child {
      border-bottom: none;
    }

    .detail-icon {
      margin-right: 10px;
      font-size: 1.1rem;
    }

    .detail-label {
      flex: 1;
      font-weight: 500;
      color: #495057;
      font-size: 0.9rem;
    }

    .detail-value {
      font-weight: 600;
      color: #2c3e50;
      font-size: 0.9rem;
    }

    .bono-description {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 15px;
    }

    .bono-description p {
      color: #6c757d;
      font-size: 0.9rem;
      line-height: 1.5;
      margin: 0;
    }

    .card-footer {
      padding: 0 25px 25px;
    }

    .action-buttons {
      display: flex;
      gap: 10px;
    }

    .action-buttons .btn {
      flex: 1;
      justify-content: center;
    }

    .navigation-footer {
      text-align: center;
      margin-top: 30px;
    }

    .icon {
      font-size: 1.1em;
    }

    /* Responsive Design */
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
      
      .section-header {
        flex-direction: column;
        gap: 15px;
        text-align: center;
      }
      
      .filters-section {
        grid-template-columns: 1fr;
      }
      
      .filter-actions {
        flex-direction: column;
      }
      
      .bonos-grid {
        grid-template-columns: 1fr;
      }
      
      .financial-highlights {
        grid-template-columns: 1fr;
      }
      
      .action-buttons {
        flex-direction: column;
      }
    }
  `]
})
export class CatalogoBonosComponent implements OnInit {
  bonos: Bono[] = [];
  loading = false;
  error = '';
  
  // Filtros
  filtroMoneda = '';
  tasaMinima?: number;
  tasaMaxima?: number;

  constructor(
    private bonoService: BonoService,
    private logger: LoggerService
  ) {}

  ngOnInit(): void {
    this.logger.logComponentInit('CatalogoBonosComponent', {});
    this.cargarCatalogoBonos();
  }

  cargarCatalogoBonos(): void {
    this.loading = true;
    this.error = '';
    
    this.logger.info('🔄 Cargando catálogo de bonos...', 'CatalogoBonosComponent');
    
    this.bonoService.getCatalogoBonos().subscribe({
      next: (bonos) => {
        this.bonos = bonos;
        this.loading = false;
        this.logger.info('✅ Catálogo de bonos cargado desde backend', 'CatalogoBonosComponent', {
          cantidad: bonos.length,
          bonos: bonos.map(b => ({ id: b.id, nombre: b.nombre, emisor: b.emisorNombre }))
        });
      },
      error: (error) => {
        this.error = error.error?.message || 'Error al cargar el catálogo de bonos';
        this.loading = false;
        this.logger.error('❌ Error al cargar catálogo de bonos', 'CatalogoBonosComponent', {
          error: this.error,
          status: error.status
        });
      }
    });
  }

  filtrarPorMoneda(): void {
    if (!this.filtroMoneda) {
      this.cargarCatalogoBonos();
      return;
    }

    this.loading = true;
    this.error = '';
    
    this.logger.info('🔍 Filtrando bonos por moneda', 'CatalogoBonosComponent', { moneda: this.filtroMoneda });
    
    this.bonoService.getBonosPorMoneda(this.filtroMoneda).subscribe({
      next: (bonos) => {
        this.bonos = bonos;
        this.loading = false;
        this.logger.info('✅ Bonos filtrados por moneda', 'CatalogoBonosComponent', {
          moneda: this.filtroMoneda,
          cantidad: bonos.length
        });
      },
      error: (error) => {
        this.error = error.error?.message || 'Error al filtrar bonos por moneda';
        this.loading = false;
        this.logger.error('❌ Error al filtrar por moneda', 'CatalogoBonosComponent', {
          error: this.error,
          moneda: this.filtroMoneda
        });
      }
    });
  }

  aplicarFiltros(): void {
    this.loading = true;
    this.error = '';
    
    this.logger.info('🔍 Aplicando filtros combinados', 'CatalogoBonosComponent', { 
      moneda: this.filtroMoneda,
      tasaMinima: this.tasaMinima,
      tasaMaxima: this.tasaMaxima 
    });
    
    // Si no hay filtros activos, cargar todos
    if (!this.filtroMoneda && this.tasaMinima === undefined && this.tasaMaxima === undefined) {
      this.cargarCatalogoBonos();
      return;
    }
    
    // Aplicamos el filtro apropiado según los campos proporcionados
    if (this.filtroMoneda && (this.tasaMinima !== undefined || this.tasaMaxima !== undefined)) {
      // Si tenemos filtro de moneda y tasa, aplicamos ambos
      this.bonoService.getBonosFiltrados(this.filtroMoneda, this.tasaMinima, this.tasaMaxima).subscribe({
        next: (bonos: Bono[]) => {
          this.bonos = bonos;
          this.loading = false;
          this.logger.info('✅ Bonos filtrados por moneda y tasa', 'CatalogoBonosComponent', {
            moneda: this.filtroMoneda,
            tasaMinima: this.tasaMinima,
            tasaMaxima: this.tasaMaxima,
            cantidad: bonos.length
          });
        },
        error: (error: any) => {
          this.error = error.error?.message || 'Error al filtrar bonos';
          this.loading = false;
          this.logger.error('❌ Error al aplicar filtros combinados', 'CatalogoBonosComponent', {
            error: this.error
          });
        }
      });
    } else if (this.filtroMoneda) {
      // Solo filtro de moneda
      this.filtrarPorMoneda();
    } else {
      // Solo filtro de tasa
      this.filtrarPorTasa();
    }
  }

  filtrarPorTasa(): void {
    if (this.tasaMinima === undefined && this.tasaMaxima === undefined) {
      this.cargarCatalogoBonos();
      return;
    }

    this.loading = true;
    this.error = '';
    
    this.logger.info('🔍 Filtrando bonos por tasa', 'CatalogoBonosComponent', {
      tasaMinima: this.tasaMinima,
      tasaMaxima: this.tasaMaxima
    });
    
    this.bonoService.getBonosPorTasa(this.tasaMinima, this.tasaMaxima).subscribe({
      next: (bonos) => {
        this.bonos = bonos;
        this.loading = false;
        this.logger.info('✅ Bonos filtrados por tasa', 'CatalogoBonosComponent', {
          tasaMinima: this.tasaMinima,
          tasaMaxima: this.tasaMaxima,
          cantidad: bonos.length
        });
      },
      error: (error) => {
        this.error = error.error?.message || 'Error al filtrar bonos por tasa';
        this.loading = false;
        this.logger.error('❌ Error al filtrar por tasa', 'CatalogoBonosComponent', {
          error: this.error,
          tasaMinima: this.tasaMinima,
          tasaMaxima: this.tasaMaxima
        });
      }
    });
  }

  limpiarFiltros(): void {
    this.filtroMoneda = '';
    this.tasaMinima = undefined;
    this.tasaMaxima = undefined;
    this.cargarCatalogoBonos();
    this.logger.info('🧹 Filtros limpiados', 'CatalogoBonosComponent');
  }

  trackByBonoId(index: number, bono: Bono): number {
    return bono.id;
  }

  formatCurrency(amount: number, currency?: string): string {
    const symbol = this.getCurrencySymbol(currency);
    return `${symbol} ${amount.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  private getCurrencySymbol(currency?: string): string {
    switch (currency) {
      case 'USD': return '$';
      case 'PEN': return 'S/';
      case 'EUR': return '€';
      default: return '$';
    }
  }

  formatMetodoAmortizacion(metodo: string): string {
    switch (metodo) {
      case 'AMERICANO': return 'Americano';
      case 'ALEMAN': return 'Alemán';
      case 'FRANCES': return 'Francés';
      default: return metodo;
    }
  }
}
