import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { BonoService } from '../../../../bonos/application/services/bono.service';
import { Bono } from '../../../../bonos/domain/models/bono.model';
import { LoggerService } from '../../../../shared/services/logger.service';

@Component({
  selector: 'app-detalle-bono',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-container">
      <!-- Header Principal -->
      <div class="page-header">
        <div class="header-content">
          <h1>Detalle del Bono</h1>
          <p class="subtitle">Análisis completo de la oportunidad de inversión</p>
        </div>
        <div class="header-actions">
          <a routerLink="/inversor/mis-calculos" class="btn btn-primary">
            <i class="icon">📊</i>
            Calcular Rendimiento
          </a>
          <a routerLink="/inversor/catalogo" class="btn btn-secondary">
            <i class="icon">←</i>
            Volver al Catálogo
          </a>
        </div>
      </div>

      <!-- Loading state -->
      <div *ngIf="loading" class="loading-container">
        <div class="spinner"></div>
        <p>Cargando información del bono...</p>
      </div>

      <!-- Error state -->
      <div *ngIf="error" class="error-container">
        <div class="error-card">
          <i class="error-icon">❌</i>
          <h3>Error al cargar información</h3>
          <p>{{ error }}</p>
          <button class="btn-retry" (click)="cargarDetalleBono()">
            <i class="icon">🔄</i>
            Reintentar
          </button>
        </div>
      </div>

      <!-- Detalle del bono -->
      <div *ngIf="!loading && !error && bono" class="content-container">
        <div class="section-header">
          <div class="bono-title-section">
            <h2 class="section-title">{{ bono.nombre }}</h2>
            <div class="emisor-badge">
              <i class="icon">🏛️</i>
              {{ bono.emisorNombre || 'Emisor Corporativo' }}
            </div>
          </div>
          <div class="currency-badge">{{ bono.moneda?.codigo || 'USD' }}</div>
        </div>

          <div class="info-grid">
            <div class="info-card">
              <h3>Información Básica</h3>
              <div class="info-item">
                <span class="label">Valor Nominal:</span>
                <span class="value">{{ bono.moneda?.simbolo || '$' }} {{ bono.valorNominal | number:'1.2-2' }}</span>
              </div>
              <div class="info-item">
                <span class="label">Tasa Cupón:</span>
                <span class="value tasa">{{ bono.tasaCupon }}%</span>
              </div>
              <div class="info-item">
                <span class="label">Plazo:</span>
                <span class="value">{{ bono.plazoAnios }} años</span>
              </div>
              <div class="info-item">
                <span class="label">Frecuencia de Pagos:</span>
                <span class="value">{{ bono.frecuenciaPagos }} veces por año</span>
              </div>
              <div class="info-item">
                <span class="label">Fecha de Emisión:</span>
                <span class="value">{{ bono.fechaEmision | date:'dd/MM/yyyy' }}</span>
              </div>
              <div class="info-item">
                <span class="label">Moneda:</span>
                <span class="value">{{ bono.moneda?.nombre || bono.moneda?.codigo || 'No especificada' }}</span>
              </div>
            </div>

            <div class="info-card">
              <h3>Detalles Financieros</h3>
              <div class="info-item">
                <span class="label">Tasa de Descuento:</span>
                <span class="value">{{ bono.tasaDescuento }}%</span>
              </div>
              <div class="info-item">
                <span class="label">Método de Amortización:</span>
                <span class="value">{{ bono.metodoAmortizacion }}</span>
              </div>
              <div class="info-item">
                <span class="label">Plazo de Gracia:</span>
                <span class="value">{{ bono.plazoGracia?.tipo || 'NINGUNO' }} ({{ bono.plazoGracia?.periodos || 0 }} períodos)</span>
              </div>
              <div class="info-item">
                <span class="label">Tipo de Tasa:</span>
                <span class="value">{{ bono.tasaInteres?.tipo || 'No especificado' }}</span>
              </div>
              <div class="info-item">
                <span class="label">Valor de Tasa:</span>
                <span class="value">{{ bono.tasaInteres?.valor || 0 }}%</span>
              </div>
              <div class="info-item" *ngIf="bono.tasaInteres?.frecuenciaCapitalizacion">
                <span class="label">Frecuencia Capitalización:</span>
                                 <span class="value">{{ bono.tasaInteres?.frecuenciaCapitalizacion }}</span>
              </div>
            </div>
          </div>

          <div class="descripcion-card" *ngIf="bono.descripcion">
            <h3>Descripción</h3>
            <p>{{ bono.descripcion }}</p>
          </div>



                     <!-- Acciones -->
           <div class="acciones">
             <a [routerLink]="['/inversor/mis-calculos']" class="btn btn-primary">
               <i class="icon">📊</i>
               Calcular Rendimiento
             </a>
             <a routerLink="/inversor/catalogo" class="btn btn-secondary">
               <i class="icon">←</i>
               Volver al Catálogo
             </a>
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

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
    }

    .btn-primary:hover {
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

    .btn-retry {
      margin-top: 10px;
      padding: 12px 24px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      font-weight: 600;
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

    .bono-title-section {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .section-title {
      color: #2c3e50;
      font-size: 1.8rem;
      font-weight: 600;
      margin: 0;
    }

    .emisor-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #6c757d;
      font-size: 1.1rem;
      font-style: italic;
    }

    .currency-badge {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 12px 20px;
      border-radius: 20px;
      font-size: 1rem;
      font-weight: 700;
      text-transform: uppercase;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .info-card {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #e9ecef;
    }

    .info-card h3 {
      color: #495057;
      margin: 0 0 15px 0;
      font-size: 1.2em;
      border-bottom: 2px solid #007bff;
      padding-bottom: 5px;
    }

    .info-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      padding: 8px 0;
      border-bottom: 1px solid #e9ecef;
    }

    .info-item:last-child {
      border-bottom: none;
    }

    .info-item .label {
      font-weight: 500;
      color: #495057;
    }

    .info-item .value {
      color: #2c3e50;
      font-weight: 500;
    }

    .tasa {
      color: #28a745;
      font-weight: 600;
    }

    .descripcion-card {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #e9ecef;
      margin-bottom: 30px;
    }

    .descripcion-card h3 {
      color: #495057;
      margin: 0 0 15px 0;
      border-bottom: 2px solid #007bff;
      padding-bottom: 5px;
    }



    .acciones {
      display: flex;
      gap: 15px;
      justify-content: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 2px solid #f1f3f4;
    }

    .icon {
      font-size: 1.1em;
    }

    @media (max-width: 768px) {
      .header {
        flex-direction: column;
        gap: 15px;
        text-align: center;
      }
      
      .info-grid {
        grid-template-columns: 1fr;
      }
      
      .acciones {
        flex-direction: column;
      }
    }
  `]
})
export class DetalleBonoComponent implements OnInit {
  bono: Bono | null = null;
  loading = false;
  error = '';
  bonoId: number = 0;

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
        this.cargarDetalleBono();
      } else {
        this.error = 'ID de bono no válido';
        this.logger.error('❌ ID de bono no válido', 'DetalleBonoComponent', { id: params['id'] });
      }
    });
  }

  cargarDetalleBono(): void {
    this.loading = true;
    this.error = '';
    
    this.logger.info('🔄 Cargando detalle del bono', 'DetalleBonoComponent', { bonoId: this.bonoId });
    
    this.bonoService.getBonoDetalle(this.bonoId).subscribe({
      next: (bono) => {
        this.bono = bono;
        this.loading = false;
        this.logger.info('✅ Detalle del bono cargado exitosamente', 'DetalleBonoComponent', {
          bonoId: this.bonoId,
          nombre: bono.nombre,
          emisor: bono.emisorNombre
        });
      },
      error: (error) => {
        this.error = error.error?.message || 'Error al cargar el detalle del bono';
        this.loading = false;
        this.logger.error('❌ Error al cargar detalle del bono', 'DetalleBonoComponent', {
          bonoId: this.bonoId,
          error: this.error,
          status: error.status
        });
      }
    });
  }


}
