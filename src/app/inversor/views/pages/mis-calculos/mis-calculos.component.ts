import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LoggerService } from '../../../../shared/services/logger.service';
import { CalculoService, CalculoTREA } from '../../../application/services/calculo.service';

@Component({
  selector: 'app-mis-calculos',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="page-container">
      <!-- Header Principal -->
      <div class="page-header">
        <div class="header-content">
          <h1>Calculadora Financiera</h1>
          <p class="subtitle">Herramientas independientes para análisis de bonos</p>
        </div>
        <div class="header-actions">
          <a routerLink="/inversor/catalogo" class="btn btn-primary">
            <i class="icon">📋</i>
            Ver Catálogo
          </a>
          <a routerLink="/inversor/dashboard" class="btn btn-secondary">
            <i class="icon">🏠</i>
            Dashboard
          </a>
        </div>
      </div>

      <!-- Calculadora de Rendimientos -->
      <div class="content-container">
        <div class="section-header">
          <h2 class="section-title">Calculadora de Rendimientos</h2>
          <div class="filter-stats">
            <span class="stats-text">Herramientas de análisis financiero</span>
          </div>
        </div>

        <div class="calculator-section">
          <div class="calculator-card">
            <div class="calc-header">
              <h3>📊 Análisis de TREA</h3>
              <p>Calcula la Tasa de Rendimiento Efectiva Anual</p>
            </div>
            <div class="calc-content">
              <div class="form-group">
                <label class="form-label">Precio de Compra</label>
                <input type="number" class="form-input" [(ngModel)]="calculadora.precioCompra" 
                       step="0.01" min="0" placeholder="Ej: 950.00">
              </div>
              <div class="form-group">
                <label class="form-label">Valor Nominal</label>
                <input type="number" class="form-input" [(ngModel)]="calculadora.valorNominal" 
                       step="0.01" min="0" placeholder="Ej: 1000.00">
              </div>
              <div class="form-group">
                <label class="form-label">Tasa Cupón (%)</label>
                <input type="number" class="form-input" [(ngModel)]="calculadora.tasaCupon" 
                       step="0.01" min="0" max="100" placeholder="Ej: 8.5">
              </div>
              <div class="form-group">
                <label class="form-label">Plazo (años)</label>
                <input type="number" class="form-input" [(ngModel)]="calculadora.plazoAnios" 
                       step="1" min="1" max="50" placeholder="Ej: 5">
              </div>
              <button class="btn btn-primary" (click)="calcularTREA()" [disabled]="!puedeCalcular()">
                <i class="icon">📈</i>
                Calcular TREA
              </button>
            </div>
            
            <div *ngIf="resultado" class="calc-result">
              <div class="result-header">
                <h4>📋 Resultado del Análisis</h4>
              </div>
              <div class="result-metrics">
                <div class="metric-item primary">
                  <span class="metric-label">TREA</span>
                  <span class="metric-value">{{ resultado.trea }}%</span>
                </div>
                <div class="metric-item success">
                  <span class="metric-label">Rendimiento Anual</span>
                  <span class="metric-value">{{ resultado.rendimientoAnual | number:'1.2-2' }}</span>
                </div>
                <div class="metric-item info">
                  <span class="metric-label">Rentabilidad Total</span>
                  <span class="metric-value">{{ resultado.rentabilidadTotal }}%</span>
                </div>
              </div>
            </div>
          </div>

          <div class="info-cards">
            <div class="info-card">
              <h4>💡 ¿Qué es la TREA?</h4>
              <p>La Tasa de Rendimiento Efectiva Anual representa el retorno real que obtienes de tu inversión, considerando el precio pagado versus el valor nominal y los cupones recibidos.</p>
            </div>
            
            <div class="info-card">
              <h4>📈 Consejos de Inversión</h4>
              <ul>
                <li>Compare la TREA con tasas de mercado</li>
                <li>Considere el riesgo crediticio del emisor</li>
                <li>Evalúe la liquidez del bono</li>
                <li>Diversifique su portafolio</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Herramientas Adicionales -->
      <div class="content-container">
        <div class="section-header">
          <h2 class="section-title">Herramientas Adicionales</h2>
        </div>

        <div class="tools-grid">
          <div class="tool-card">
            <div class="tool-icon">📊</div>
            <h3>Análisis de Duración</h3>
            <p>Mide la sensibilidad del precio del bono ante cambios en las tasas de interés</p>
            <span class="badge coming-soon">Próximamente</span>
          </div>

          <div class="tool-card">
            <div class="tool-icon">📈</div>
            <h3>Análisis de Convexidad</h3>
            <p>Evaluación avanzada de la relación precio-rendimiento</p>
            <span class="badge coming-soon">Próximamente</span>
          </div>

          <div class="tool-card">
            <div class="tool-icon">💰</div>
            <h3>Comparador de Bonos</h3>
            <p>Compare múltiples bonos lado a lado para tomar mejores decisiones</p>
            <span class="badge coming-soon">Próximamente</span>
          </div>

          <div class="tool-card">
            <div class="tool-icon">📋</div>
            <h3>Simulador de Portafolio</h3>
            <p>Simule diferentes combinaciones de bonos para optimizar su portafolio</p>
            <span class="badge coming-soon">Próximamente</span>
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

    .btn-secondary {
      background: #ecf0f1;
      color: #2c3e50;
    }

    .btn-secondary:hover {
      background: #d5dbdb;
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

    .calculator-section {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 30px;
    }

    .calculator-card {
      background: #f8f9fa;
      border-radius: 16px;
      padding: 30px;
      border: 1px solid #e9ecef;
    }

    .calc-header h3 {
      color: #2c3e50;
      font-size: 1.5rem;
      margin: 0 0 10px 0;
    }

    .calc-header p {
      color: #6c757d;
      margin: 0 0 20px 0;
    }

    .calc-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 20px;
    }

    .calc-content .btn {
      grid-column: 1 / -1;
      justify-self: center;
      padding: 15px 30px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .form-label {
      font-weight: 600;
      color: #495057;
      font-size: 0.9rem;
    }

    .form-input {
      padding: 12px 16px;
      border: 2px solid #e9ecef;
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.3s ease;
    }

    .form-input:focus {
      outline: none;
      border-color: #667eea;
    }

    .calc-result {
      background: white;
      border-radius: 12px;
      padding: 20px;
      border: 2px solid #e9ecef;
    }

    .result-header h4 {
      color: #2c3e50;
      margin: 0 0 15px 0;
    }

    .result-metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 15px;
    }

    .metric-item {
      padding: 15px;
      border-radius: 12px;
      text-align: center;
    }

    .metric-item.primary {
      background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
    }

    .metric-item.success {
      background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
    }

    .metric-item.info {
      background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%);
    }

    .metric-label {
      display: block;
      font-size: 0.8rem;
      color: #6c757d;
      font-weight: 600;
      margin-bottom: 5px;
      text-transform: uppercase;
    }

    .metric-value {
      display: block;
      font-size: 1.4rem;
      font-weight: 700;
      color: #2c3e50;
    }

    .info-cards {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .info-card {
      background: #fff;
      border-radius: 12px;
      padding: 20px;
      border: 1px solid #e9ecef;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }

    .info-card h4 {
      color: #2c3e50;
      margin: 0 0 10px 0;
      font-size: 1.1rem;
    }

    .info-card p {
      color: #6c757d;
      font-size: 0.9rem;
      line-height: 1.5;
      margin: 0;
    }

    .info-card ul {
      color: #6c757d;
      font-size: 0.9rem;
      line-height: 1.5;
      margin: 0;
      padding-left: 20px;
    }

    .tools-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 25px;
    }

    .tool-card {
      background: #f8f9fa;
      border-radius: 16px;
      padding: 25px;
      text-align: center;
      border: 1px solid #e9ecef;
      transition: all 0.3s ease;
      position: relative;
    }

    .tool-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
    }

    .tool-icon {
      font-size: 3rem;
      margin-bottom: 15px;
    }

    .tool-card h3 {
      color: #2c3e50;
      font-size: 1.2rem;
      margin: 0 0 10px 0;
    }

    .tool-card p {
      color: #6c757d;
      font-size: 0.9rem;
      line-height: 1.5;
      margin: 0 0 15px 0;
    }

    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .badge.coming-soon {
      background: #fff3cd;
      color: #856404;
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
      
      .calculator-section {
        grid-template-columns: 1fr;
      }
      
      .calc-content {
        grid-template-columns: 1fr;
      }
      
      .result-metrics {
        grid-template-columns: 1fr;
      }
      
      .tools-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class MisCalculosComponent implements OnInit {
  calculadora = {
    precioCompra: 0,
    valorNominal: 0,
    tasaCupon: 0,
    plazoAnios: 0
  };

  resultado: {
    trea: number;
    rendimientoAnual: number;
    rentabilidadTotal: number;
  } | null = null;

  constructor(
    private router: Router,
    private logger: LoggerService,
    private calculoService: CalculoService
  ) {}

  ngOnInit(): void {
    this.logger.logComponentInit('MisCalculosComponent', {});
  }

  puedeCalcular(): boolean {
    return this.calculadora.precioCompra > 0 && 
           this.calculadora.valorNominal > 0 && 
           this.calculadora.tasaCupon > 0 && 
           this.calculadora.plazoAnios > 0;
  }

  calcularTREA(): void {
    if (!this.puedeCalcular()) return;

    const { precioCompra, valorNominal, tasaCupon, plazoAnios } = this.calculadora;
    
    // Usar el servicio para calcular TREA
    const calculoDetallado = this.calculoService.calcularTREAIndependiente(
      precioCompra, valorNominal, tasaCupon, plazoAnios
    );

    this.resultado = {
      trea: calculoDetallado.trea,
      rendimientoAnual: calculoDetallado.gananciaTotal / plazoAnios,
      rentabilidadTotal: calculoDetallado.rentabilidadTotal
    };

    // Guardar en historial
    this.guardarEnHistorial();

    this.logger.info('📊 TREA calculada exitosamente', 'MisCalculosComponent', {
      calculadora: this.calculadora,
      resultado: this.resultado,
      calculoDetallado
    });
  }

  private guardarEnHistorial(): void {
    if (!this.resultado) return;

    const analisis = {
      id: Date.now().toString(),
      fecha: new Date(),
      tipo: 'TREA' as const,
      bono: 'Cálculo Independiente',
      parametros: { ...this.calculadora },
      resultados: { ...this.resultado }
    };

    // Obtener historial existente
    const historialStr = localStorage.getItem('historial_analisis_bonofacil');
    let historial = [];
    
    if (historialStr) {
      try {
        historial = JSON.parse(historialStr);
      } catch (error) {
        historial = [];
      }
    }

    // Agregar nuevo análisis al principio
    historial.unshift(analisis);

    // Mantener solo los últimos 20 análisis
    historial = historial.slice(0, 20);

    // Guardar en localStorage
    localStorage.setItem('historial_analisis_bonofacil', JSON.stringify(historial));

    this.logger.info('💾 Análisis guardado en historial', 'MisCalculosComponent', { analisis });
  }
} 