import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LoggerService } from '../../../../shared/services/logger.service';
import { CalculoService, CalculoTREA } from '../../../application/services/calculo.service';
import { BonoService } from '../../../../bonos/application/services/bono.service';
import { DuracionConvexidad, Bono } from '../../../../bonos/domain/models/bono.model';

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

      <!-- 🚀 Calculadora Avanzada de Duración y Convexidad -->
      <div class="content-container">
        <div class="section-header">
          <h2 class="section-title"> Análisis Avanzado de Sensibilidad</h2>
          <div class="premium-badge">
            <span class="badge premium">Premium</span>
            <span class="exclusive-text">Análisis que nadie más tiene</span>
          </div>
        </div>

        <div class="advanced-calculator">
          <div class="calculator-card advanced">
            <div class="calc-header advanced">
              <div class="header-icon"></div>
              <div class="header-content">
                <h3>Calculadora de Duración & Convexidad</h3>
                <p>Análisis profesional de sensibilidad al riesgo de tasas de interés</p>
              </div>
              <div class="premium-indicator">
                <span class="premium-star">⭐</span>
                <span class="premium-text">Exclusivo</span>
              </div>
            </div>

            <div class="calc-content advanced">
              <div class="form-group">
                <label class="form-label advanced">ID del Bono</label>
                <input type="number" class="form-input advanced" [(ngModel)]="calculadoraMetricas.bonoId" 
                       (change)="cargarDatosBono()" min="1" placeholder="Ej: 1">
                <small class="form-hint">Ingrese el ID del bono a analizar</small>
              </div>
              
              <div class="form-group">
                <label class="form-label advanced">Tasa de Mercado (%)</label>
                <input type="number" class="form-input advanced" [(ngModel)]="calculadoraMetricas.tasaMercado" 
                       step="0.1" min="0" max="50" placeholder="Ej: 8.0">
                <small class="form-hint">Tasa de interés del mercado actual</small>
              </div>
              
              <div class="form-group">
                <label class="form-label advanced">Cambio en Puntos (%)</label>
                <input type="number" class="form-input advanced" [(ngModel)]="calculadoraMetricas.cambioPuntos" 
                       step="0.1" min="0" max="10" placeholder="Ej: 1.0">
                <small class="form-hint">Variación en puntos porcentuales</small>
              </div>

              <button class="btn btn-advanced" (click)="calcularMetricasAvanzadas()" 
                      [disabled]="!puedeCalcularMetricas() || loadingMetricas">
                <span *ngIf="!loadingMetricas">
                  <i class="icon"></i>
                  Analizar Sensibilidad
                </span>
                <span *ngIf="loadingMetricas" class="loading-text">
                  <i class="spinner-icon"></i>
                  Calculando...
                </span>
              </button>
            </div>

            <!-- 📋 INFORMACIÓN DEL BONO SELECCIONADO -->
            <div *ngIf="loadingBono" class="bond-info-loading">
              <div class="loading-header">
                <div class="spinner"></div>
                <h4>Cargando datos del bono...</h4>
              </div>
              <p>Obteniendo información detallada del bono ID {{ calculadoraMetricas.bonoId }}</p>
            </div>

            <div *ngIf="errorBono" class="bond-info-error">
              <div class="error-header">
                <span class="error-icon">❌</span>
                <h4>Bono no encontrado</h4>
              </div>
              <p>{{ errorBono }}</p>
              <button class="btn btn-secondary" (click)="cargarDatosBono()">
                🔄 Reintentar
              </button>
            </div>

            <div *ngIf="bonoSeleccionado && !loadingBono" class="bond-info-card">
              <div class="bond-info-header">
                <div class="bond-icon">📋</div>
                <div class="bond-title">
                  <h4>{{ bonoSeleccionado.nombre }}</h4>
                  <p class="bond-subtitle">Información del bono a analizar</p>
                </div>
                <div class="bond-status">
                  <span class="status-badge active">✅ Cargado</span>
                </div>
              </div>

              <div class="bond-details-grid">
                <div class="detail-card primary">
                  <div class="detail-icon">💰</div>
                  <div class="detail-content">
                    <span class="detail-label">Valor Nominal</span>
                    <span class="detail-value">{{ getSimboloMoneda(bonoSeleccionado.moneda) }} {{ bonoSeleccionado.valorNominal | number:'1.0-0' }}</span>
                  </div>
                </div>

                <div class="detail-card success">
                  <div class="detail-icon">📈</div>
                  <div class="detail-content">
                    <span class="detail-label">Tasa Cupón</span>
                    <span class="detail-value">{{ bonoSeleccionado.tasaCupon }}%</span>
                  </div>
                </div>

                <div class="detail-card info">
                  <div class="detail-icon">⏰</div>
                  <div class="detail-content">
                    <span class="detail-label">Plazo</span>
                    <span class="detail-value">{{ bonoSeleccionado.plazo }} años</span>
                  </div>
                </div>

                <div class="detail-card warning">
                  <div class="detail-icon">🔄</div>
                  <div class="detail-content">
                    <span class="detail-label">Frecuencia</span>
                    <span class="detail-value">{{ bonoSeleccionado.frecuencia }}x/año</span>
                  </div>
                </div>
              </div>

              <div class="bond-additional-info">
                <div class="info-row">
                  <div class="info-item">
                    <span class="info-label">🏢 Emisor:</span>
                    <span class="info-value">{{ bonoSeleccionado.emisor }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">🔧 Amortización:</span>
                    <span class="info-value amortization" [class]="getAmortizacionClass(bonoSeleccionado.tipoAmortizacion)">
                      {{ bonoSeleccionado.tipoAmortizacion }}
                    </span>
                  </div>
                </div>

                <div class="info-row">
                  <div class="info-item">
                    <span class="info-label">📅 Emisión:</span>
                    <span class="info-value">{{ bonoSeleccionado.fechaEmision | date:'dd/MM/yyyy' }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">🏁 Vencimiento:</span>
                    <span class="info-value">{{ bonoSeleccionado.fechaVencimiento | date:'dd/MM/yyyy' }}</span>
                  </div>
                </div>

                <div class="info-row">
                  <div class="info-item">
                    <span class="info-label">💱 Moneda:</span>
                    <span class="info-value">{{ bonoSeleccionado.moneda }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">⏳ Días restantes:</span>
                    <span class="info-value">{{ getDiasHastaVencimiento(bonoSeleccionado.fechaVencimiento) }} días</span>
                  </div>
                </div>
              </div>

              <div class="analysis-ready-banner">
                <div class="banner-content">
                  <span class="banner-icon">🎯</span>
                  <div class="banner-text">
                    <strong>¡Listo para analizar!</strong>
                    <p>Este bono será analizado con los parámetros de sensibilidad que ingresaste.</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- 🚨 ESTADO DE ERROR CON INFORMACIÓN DETALLADA -->
            <div *ngIf="errorMetricas" class="error-message-enhanced">
              <div class="error-header">
                <div class="error-icon">⚠️</div>
                <h4>Problema Detectado</h4>
              </div>
              
              <div class="error-content">
                <p class="error-main">{{ errorMetricas }}</p>
                
                <div class="error-details">
                  <h5>🔧 Posibles causas:</h5>
                  <ul>
                    <li>El servidor backend está devolviendo valores <code>undefined</code></li>
                    <li>Los parámetros están fuera del rango esperado por el servidor</li>
                    <li>El bono seleccionado no tiene datos completos</li>
                    <li>Problema temporal de conectividad</li>
                  </ul>
                </div>
                
                <div class="error-actions">
                  <button class="btn btn-primary" (click)="calcularMetricasAvanzadas()">
                    🔄 Reintentar
                  </button>
                  <button class="btn btn-secondary" (click)="abrirConsola()">
                    🔍 Ver Detalles Técnicos
                  </button>
                </div>
              </div>
            </div>

            <!-- Results Display -->
            <div *ngIf="resultadoMetricas" class="calc-result advanced">
              <div class="result-header advanced">
                <h4>📊 Análisis de Sensibilidad Completo</h4>
                <div class="sensitivity-indicator" [class]="getSensitivityClass(resultadoMetricas.sensibilidad)">
                  {{ resultadoMetricas.sensibilidad }}
                </div>
              </div>
              
              <div class="result-metrics advanced">
                <div class="metric-card primary">
                  <div class="metric-icon">⏱️</div>
                  <div class="metric-content">
                    <span class="metric-label">Duración</span>
                    <span class="metric-value">{{ resultadoMetricas.duracion }} años</span>
                  </div>
                </div>
                
                <div class="metric-card success">
                  <div class="metric-icon">📉</div>
                  <div class="metric-content">
                    <span class="metric-label">Duración Modificada</span>
                    <span class="metric-value">{{ resultadoMetricas.duracionModificada }}</span>
                  </div>
                </div>
                
                <div class="metric-card info">
                  <div class="metric-icon">📈</div>
                  <div class="metric-content">
                    <span class="metric-label">Convexidad</span>
                    <span class="metric-value">{{ resultadoMetricas.convexidad }}</span>
                  </div>
                </div>
                
                <div class="metric-card warning">
                  <div class="metric-icon">💱</div>
                  <div class="metric-content">
                    <span class="metric-label">Cambio de Precio</span>
                    <span class="metric-value">{{ resultadoMetricas.cambioPrecio | number:'1.2-2' }}%</span>
                  </div>
                </div>
              </div>

                              <!-- Professional Interpretation -->
              <div class="interpretation-panel">
                <h5>🎓 Interpretación Profesional</h5>
                
                <!-- 🚨 ALERTA DE CÁLCULO INCORRECTO -->
                <div *ngIf="tieneCalculoIncorrecto()" class="calculation-alert">
                  <div class="alert-header">
                    <span class="alert-icon">⚠️</span>
                    <strong>ADVERTENCIA: Cálculo Matemáticamente Incorrecto</strong>
                  </div>
                  <div class="alert-content">
                    <p>{{ getExplicacionCalculoIncorrecto() }}</p>
                    <div class="comparison-table">
                      <div class="comparison-row">
                        <span class="label">Cambio Esperado:</span>
                        <span class="expected">{{ getCambioEsperado() }}%</span>
                      </div>
                      <div class="comparison-row">
                        <span class="label">Cambio Calculado:</span>
                        <span class="actual">{{ resultadoMetricas.cambioPrecio | number:'1.2-2' }}%</span>
                      </div>
                      <div class="comparison-row error">
                        <span class="label">Diferencia:</span>
                        <span class="difference">{{ getDiferenciaPorcentual() }}%</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="interpretation-content">
                  <div class="interpretation-item">
                    <strong>📊 Análisis de Sensibilidad:</strong> {{ getInterpretacionSensibilidad(resultadoMetricas.duracionModificada) }}
                  </div>
                  <div class="interpretation-item">
                    <strong>💡 Recomendación de Inversión:</strong> {{ getRecomendacion(resultadoMetricas.duracionModificada, resultadoMetricas.convexidad) }}
                  </div>
                </div>
                
                <!-- 🚨 PANEL DE ADVERTENCIAS MEJORADO -->
                <div *ngIf="resultadoMetricas.advertencias && resultadoMetricas.advertencias.length > 0" class="warning-panel">
                  <h6>⚠️ Problemas Detectados en el Cálculo</h6>
                  <div class="warning-content">
                    <div class="warning-items">
                      <div *ngFor="let advertencia of resultadoMetricas.advertencias" class="warning-item">
                        <span class="warning-icon">🔍</span>
                        <div class="warning-text">
                          <strong>{{ advertencia }}:</strong> 
                          <span [innerHTML]="getDescripcionProblema(advertencia)"></span>
                        </div>
                      </div>
                    </div>
                    
                    <div class="diagnostic-info">
                      <h6>🔧 Diagnóstico Técnico:</h6>
                      <ul class="diagnostic-list">
                        <li>El backend devuelve <code>cambioPorcentualPrecio</code> en lugar de <code>cambioPrecio</code></li>
                        <li>No se encontró <code>duracionModificada</code> en la respuesta del backend</li>
                        <li>Busqué también: <code>modified_duration</code>, <code>modifiedDuration</code></li>
                        <li>Los valores <code>undefined</code> se convierten automáticamente a 0</li>
                        <li><strong>Revisa los logs detallados</strong> para ver todos los campos disponibles</li>
                      </ul>
                    </div>
                    
                    <div class="warning-actions">
                      <div class="suggestion-box">
                        <span class="suggestion-icon">💡</span>
                        <div class="suggestion-content">
                          <strong>Recomendaciones:</strong>
                          <ul>
                            <li>Tasa de mercado: <strong>5% - 15%</strong></li>
                            <li>Cambio en puntos: <strong>0.5% - 2%</strong></li>
                                                         <li>Verifique que el bono seleccionado tenga datos completos</li>
                           </ul>
                         </div>
                       </div>
                       
                       <!-- 🔄 BOTONES DE ACCIÓN -->
                       <div class="retry-section">
                         <button 
                           class="retry-btn"
                           (click)="reintentarCalculo()"
                           [disabled]="loadingMetricas">
                           <span class="retry-icon">🔄</span>
                           {{ loadingMetricas ? 'Recalculando...' : 'Reintentar Cálculo' }}
                         </button>
                         
                         <button 
                           class="debug-btn"
                           (click)="abrirConsola()"
                           title="Ver logs detallados en la consola del navegador">
                           <span class="debug-icon">🔍</span>
                           Ver Logs Detallados
                         </button>
                       </div>
                     </div>
                   </div>
                 </div>
              </div>
            </div>
          </div>

          <!-- Educational Content -->
          <div class="educational-panel">
            <div class="edu-card">
              <h4>🎯 ¿Qué es la Duración?</h4>
              <p>Mide cuánto tiempo toma recuperar la inversión y la sensibilidad del precio ante cambios en tasas de interés.</p>
              <ul>
                <li><strong>Duración Alta:</strong> Mayor sensibilidad al riesgo</li>
                <li><strong>Duración Baja:</strong> Menor volatilidad</li>
              </ul>
            </div>
            
            <div class="edu-card">
              <h4>📈 ¿Qué es la Convexidad?</h4>
              <p>Mide la curvatura de la relación precio-rendimiento, proporcionando una estimación más precisa.</p>
              <ul>
                <li><strong>Convexidad Positiva:</strong> Beneficia al inversionista</li>
                <li><strong>Mayor Convexidad:</strong> Mejor protección contra riesgo</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Herramientas Futuras -->
      <div class="content-container">
        <div class="section-header">
          <h2 class="section-title">Próximas Funcionalidades</h2>
        </div>

        <div class="tools-grid">
          <div class="tool-card future">
            <div class="tool-icon">💰</div>
            <h3>Comparador de Bonos</h3>
            <p>Compare múltiples bonos lado a lado para tomar mejores decisiones</p>
            <span class="badge future">Q2 2025</span>
          </div>

          <div class="tool-card future">
            <div class="tool-icon">📋</div>
            <h3>Simulador de Portafolio</h3>
            <p>Simule diferentes combinaciones de bonos para optimizar su portafolio</p>
            <span class="badge future">Q3 2025</span>
          </div>

          <div class="tool-card future">
            <div class="tool-icon">🤖</div>
            <h3>IA de Recomendaciones</h3>
            <p>Inteligencia artificial que recomienda los mejores bonos según su perfil</p>
            <span class="badge future">Q4 2025</span>
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

    .badge.premium {
      background: linear-gradient(135deg, #ffd700 0%, #ff8c00 100%);
      color: #000;
      font-weight: 700;
      box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
    }

    .badge.future {
      background: #e9ecef;
      color: #6c757d;
    }

    /* 🚀 Premium Styles for Advanced Calculator */
    .premium-badge {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .exclusive-text {
      color: #ff8c00;
      font-size: 0.9rem;
      font-weight: 600;
    }

    .advanced-calculator {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 30px;
    }

    .calculator-card.advanced {
      background: linear-gradient(135deg, #f8f9fa 0%, #fff 100%);
      border: 2px solid #ffd700;
      box-shadow: 0 8px 25px rgba(255, 215, 0, 0.1);
    }

    .calc-header.advanced {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 25px;
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      color: white;
    }

    .header-icon {
      font-size: 2rem;
    }

    .header-content h3 {
      color: white;
      margin: 0;
      font-size: 1.3rem;
    }

    .header-content p {
      color: rgba(255, 255, 255, 0.9);
      margin: 5px 0 0 0;
      font-size: 0.9rem;
    }

    .premium-indicator {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
    }

    .premium-star {
      font-size: 1.5rem;
    }

    .premium-text {
      font-size: 0.7rem;
      font-weight: 600;
    }

    .calc-content.advanced {
      display: grid;
      grid-template-columns: 1fr;
      gap: 20px;
    }

    .form-label.advanced {
      color: #2c3e50;
      font-weight: 700;
      font-size: 1rem;
    }

    .form-input.advanced {
      border: 2px solid #e9ecef;
      border-radius: 10px;
      padding: 15px;
      font-size: 1rem;
      transition: all 0.3s ease;
    }

    .form-input.advanced:focus {
      border-color: #ffd700;
      box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.1);
    }

    .form-hint {
      color: #6c757d;
      font-size: 0.8rem;
      margin-top: 5px;
    }

    .btn-advanced {
      background: linear-gradient(135deg, #ffd700 0%, #ff8c00 100%);
      color: #000;
      font-weight: 700;
      padding: 15px 30px;
      border-radius: 12px;
      border: none;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
    }

    .btn-advanced:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(255, 215, 0, 0.4);
    }

    .btn-advanced:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .loading-text {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .spinner-icon {
      animation: pulse 1s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .error-message.advanced {
      background: #f8d7da;
      color: #721c24;
      padding: 15px;
      border-radius: 8px;
      margin-top: 15px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .calc-result.advanced {
      background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
      border: 2px solid #e9ecef;
      border-radius: 15px;
      padding: 25px;
      margin-top: 20px;
    }

    .result-header.advanced {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .sensitivity-indicator {
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 0.9rem;
      font-weight: 700;
    }

    .sensitivity-indicator.low-risk {
      background: #d4edda;
      color: #155724;
    }

    .sensitivity-indicator.medium-risk {
      background: #fff3cd;
      color: #856404;
    }

    .sensitivity-indicator.high-risk {
      background: #f8d7da;
      color: #721c24;
    }

    .sensitivity-indicator.very-high-risk {
      background: #d1ecf1;
      color: #0c5460;
    }

    .result-metrics.advanced {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 20px;
      margin-bottom: 25px;
    }

    .metric-card {
      background: white;
      padding: 20px;
      border-radius: 12px;
      border: 1px solid #e9ecef;
      display: flex;
      align-items: center;
      gap: 15px;
      transition: all 0.3s ease;
    }

    .metric-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    }

    .metric-card.primary {
      border-left: 4px solid #007bff;
    }

    .metric-card.success {
      border-left: 4px solid #28a745;
    }

    .metric-card.info {
      border-left: 4px solid #17a2b8;
    }

    .metric-card.warning {
      border-left: 4px solid #ffc107;
    }

    .metric-icon {
      font-size: 2rem;
    }

    .metric-content {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .metric-label {
      font-size: 0.8rem;
      color: #6c757d;
      font-weight: 600;
      text-transform: uppercase;
    }

    .metric-value {
      font-size: 1.2rem;
      font-weight: 700;
      color: #2c3e50;
    }

    .interpretation-panel {
      background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
      padding: 20px;
      border-radius: 12px;
      border-left: 4px solid #2196f3;
    }

    .interpretation-panel h5 {
      color: #1976d2;
      margin: 0 0 15px 0;
      font-size: 1.1rem;
    }

    .interpretation-content {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .interpretation-item {
      color: #2c3e50;
      line-height: 1.5;
    }

    .educational-panel {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .edu-card {
      background: white;
      padding: 20px;
      border-radius: 12px;
      border: 1px solid #e9ecef;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    .edu-card h4 {
      color: #2c3e50;
      margin: 0 0 10px 0;
      font-size: 1.1rem;
    }

    .edu-card p {
      color: #6c757d;
      font-size: 0.9rem;
      line-height: 1.5;
      margin: 0 0 10px 0;
    }

    .edu-card ul {
      color: #6c757d;
      font-size: 0.9rem;
      line-height: 1.5;
      margin: 0;
      padding-left: 20px;
    }

    .tool-card.future {
      opacity: 0.8;
      border: 2px dashed #dee2e6;
    }

    .tool-card.future:hover {
      transform: none;
      box-shadow: none;
    }

    /* 🚨 PANEL DE ADVERTENCIAS MEJORADO - BUENAS PRÁCTICAS UX */
    .warning-panel {
      background: linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%);
      border: 2px solid #ff9800;
      border-radius: 16px;
      padding: 24px;
      margin-top: 20px;
      box-shadow: 0 4px 12px rgba(255, 152, 0, 0.15);
      animation: slideInWarning 0.3s ease-out;
    }

    @keyframes slideInWarning {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .warning-panel h6 {
      color: #e65100;
      margin: 0 0 20px 0;
      font-size: 1.1rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .warning-content {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .warning-items {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .warning-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px;
      background: rgba(255, 255, 255, 0.7);
      border-radius: 8px;
      border-left: 4px solid #ff9800;
    }

    .warning-icon {
      font-size: 1.2rem;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .warning-text {
      flex: 1;
      color: #bf360c;
      font-size: 0.9rem;
      line-height: 1.4;
    }

    .warning-text strong {
      color: #e65100;
    }

    /* 🔧 SECCIÓN DE DIAGNÓSTICO TÉCNICO */
    .diagnostic-info {
      background: rgba(255, 152, 0, 0.1);
      padding: 16px;
      border-radius: 8px;
      border: 1px solid rgba(255, 152, 0, 0.3);
    }

    .diagnostic-info h7 {
      color: #e65100;
      font-size: 0.95rem;
      font-weight: 600;
      margin: 0 0 12px 0;
      display: block;
    }

    .diagnostic-list {
      margin: 0;
      padding-left: 20px;
      color: #bf360c;
    }

    .diagnostic-list li {
      margin-bottom: 6px;
      font-size: 0.85rem;
      line-height: 1.3;
    }

    .diagnostic-list code {
      background: #ffecb3;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      font-size: 0.8rem;
      color: #e65100;
      border: 1px solid #ffb74d;
    }

    /* 💡 SECCIÓN DE SUGERENCIAS */
    .warning-actions {
      background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%);
      border: 2px solid #4caf50;
      border-radius: 12px;
      padding: 16px;
    }

    .suggestion-box {
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }

    .suggestion-icon {
      font-size: 1.3rem;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .suggestion-content {
      flex: 1;
    }

    .suggestion-content strong {
      color: #2e7d32;
      font-size: 0.95rem;
      display: block;
      margin-bottom: 8px;
    }

    .suggestion-content ul {
      margin: 0;
      padding-left: 20px;
      color: #388e3c;
    }

    .suggestion-content li {
      margin-bottom: 6px;
      font-size: 0.85rem;
      line-height: 1.3;
    }

         .suggestion-content strong:not(:first-child) {
       color: #1b5e20;
       font-weight: 600;
     }

     /* 🔄 BOTONES DE ACCIÓN */
     .retry-section {
       margin-top: 12px;
       text-align: center;
       display: flex;
       gap: 12px;
       justify-content: center;
       flex-wrap: wrap;
     }

     .retry-btn {
       background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
       color: white;
       border: none;
       border-radius: 8px;
       padding: 10px 20px;
       font-size: 0.9rem;
       font-weight: 600;
       cursor: pointer;
       display: inline-flex;
       align-items: center;
       gap: 8px;
       transition: all 0.3s ease;
       box-shadow: 0 2px 8px rgba(33, 150, 243, 0.3);
     }

     .retry-btn:hover:not([disabled]) {
       background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
       transform: translateY(-1px);
       box-shadow: 0 4px 12px rgba(33, 150, 243, 0.4);
     }

     .retry-btn:disabled {
       background: linear-gradient(135deg, #bdbdbd 0%, #9e9e9e 100%);
       cursor: not-allowed;
       transform: none;
       box-shadow: none;
     }

     .retry-icon {
       font-size: 1rem;
       animation: rotateIcon 2s infinite linear;
     }

     .retry-btn:disabled .retry-icon {
       animation: rotateIcon 1s infinite linear;
     }

     @keyframes rotateIcon {
       from { transform: rotate(0deg); }
       to { transform: rotate(360deg); }
     }

     /* 🔍 BOTÓN DE DEBUG */
     .debug-btn {
       background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
       color: white;
       border: none;
       border-radius: 8px;
       padding: 10px 20px;
       font-size: 0.9rem;
       font-weight: 600;
       cursor: pointer;
       display: inline-flex;
       align-items: center;
       gap: 8px;
       transition: all 0.3s ease;
       box-shadow: 0 2px 8px rgba(255, 152, 0, 0.3);
     }

     .debug-btn:hover {
       background: linear-gradient(135deg, #f57c00 0%, #ef6c00 100%);
       transform: translateY(-1px);
       box-shadow: 0 4px 12px rgba(255, 152, 0, 0.4);
     }

     .debug-icon {
       font-size: 1rem;
     }

     /* 🚨 SECCIÓN DE ERROR MEJORADA */
     .error-message-enhanced {
       background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
       border: 2px solid #e57373;
       border-radius: 16px;
       padding: 24px;
       margin-bottom: 20px;
       box-shadow: 0 4px 12px rgba(229, 115, 115, 0.15);
     }

     .error-header {
       display: flex;
       align-items: center;
       gap: 12px;
       margin-bottom: 20px;
       padding-bottom: 16px;
       border-bottom: 1px solid rgba(229, 115, 115, 0.3);
     }

     .error-header .error-icon {
       font-size: 1.5rem;
     }

     .error-header h4 {
       color: #c62828;
       margin: 0;
       font-size: 1.2rem;
       font-weight: 700;
     }

     .error-main {
       color: #d32f2f;
       font-size: 1rem;
       font-weight: 600;
       margin: 0 0 20px 0;
       line-height: 1.4;
     }

     .error-details {
       background: rgba(255, 255, 255, 0.7);
       padding: 16px;
       border-radius: 8px;
       margin-bottom: 20px;
     }

     .error-details h5 {
       color: #c62828;
       margin: 0 0 12px 0;
       font-size: 0.95rem;
       font-weight: 600;
     }

     .error-details ul {
       margin: 0;
       padding-left: 20px;
       color: #d32f2f;
     }

     .error-details li {
       margin-bottom: 8px;
       font-size: 0.9rem;
       line-height: 1.3;
     }

     .error-details code {
       background: #ffcdd2;
       padding: 2px 6px;
       border-radius: 4px;
       font-family: 'Courier New', monospace;
       font-size: 0.85rem;
       color: #c62828;
       border: 1px solid #e57373;
     }

     .error-actions {
       display: flex;
       gap: 12px;
       flex-wrap: wrap;
     }

     .error-actions .btn {
       padding: 10px 20px;
       font-size: 0.9rem;
     }

     /* 🔔 ANIMACIONES PARA NOTIFICACIONES */
     @keyframes slideInNotification {
       from { 
         opacity: 0; 
         transform: translateX(100%); 
       }
       to { 
         opacity: 1; 
         transform: translateX(0); 
       }
     }

     @keyframes slideOutNotification {
       from { 
         opacity: 1; 
         transform: translateX(0); 
       }
       to { 
         opacity: 0; 
         transform: translateX(100%); 
       }
     }

    /* Sensitivity Badge Styles */
    .sensibilidad-badge.invalid-calc {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      color: #6c757d;
      border: 2px solid #dee2e6;
    }

    .sensibilidad-badge.low-risk {
      background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
      color: #155724;
      border: 2px solid #c3e6cb;
    }

    .sensibilidad-badge.medium-risk {
      background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
      color: #856404;
      border: 2px solid #ffeaa7;
    }

    .sensibilidad-badge.high-risk {
      background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
      color: #721c24;
      border: 2px solid #f5c6cb;
    }

    .sensibilidad-badge.very-high-risk {
      background: linear-gradient(135deg, #d1ecf1 0%, #bee5eb 100%);
      color: #0c5460;
      border: 2px solid #bee5eb;
    }

    .icon {
      font-size: 1.1em;
    }

    /* 🚨 ESTILOS PARA ALERTA DE CÁLCULO INCORRECTO */
    .calculation-alert {
      background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
      border: 2px solid #ffc107;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 20px;
      animation: alertPulse 2s ease-in-out infinite alternate;
    }

    .alert-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 15px;
    }

    .alert-icon {
      font-size: 1.5rem;
      animation: warningBounce 1.5s ease-in-out infinite;
    }

    .alert-header strong {
      color: #856404;
      font-size: 1.1rem;
    }

    .alert-content p {
      color: #856404;
      line-height: 1.6;
      margin-bottom: 15px;
      font-size: 0.95rem;
    }

    .comparison-table {
      background: rgba(255, 255, 255, 0.8);
      border-radius: 8px;
      padding: 15px;
      border: 1px solid #ffc107;
    }

    .comparison-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid rgba(255, 193, 7, 0.3);
    }

    .comparison-row:last-child {
      border-bottom: none;
    }

    .comparison-row.error {
      background: rgba(220, 53, 69, 0.1);
      border-radius: 6px;
      padding: 8px 12px;
      margin-top: 8px;
    }

    .comparison-row .label {
      font-weight: 600;
      color: #856404;
    }

    .comparison-row .expected {
      color: #28a745;
      font-weight: 600;
      background: rgba(40, 167, 69, 0.1);
      padding: 4px 8px;
      border-radius: 4px;
    }

    .comparison-row .actual {
      color: #dc3545;
      font-weight: 600;
      background: rgba(220, 53, 69, 0.1);
      padding: 4px 8px;
      border-radius: 4px;
    }

    .comparison-row .difference {
      color: #dc3545;
      font-weight: 700;
      font-size: 1.1rem;
    }

    @keyframes alertPulse {
      0% { box-shadow: 0 4px 15px rgba(255, 193, 7, 0.3); }
      100% { box-shadow: 0 6px 25px rgba(255, 193, 7, 0.5); }
    }

    @keyframes warningBounce {
      0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
      40% { transform: translateY(-5px); }
      60% { transform: translateY(-3px); }
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

      .calculation-alert {
        padding: 15px;
      }

      .alert-header {
        flex-direction: column;
        text-align: center;
        gap: 8px;
      }

      .comparison-row {
        flex-direction: column;
        gap: 5px;
        text-align: center;
      }

      .bond-info-card {
        padding: 15px;
      }

      .bond-details-grid {
        grid-template-columns: 1fr;
        gap: 10px;
      }

      .info-row {
        flex-direction: column;
        gap: 10px;
      }

      .analysis-ready-banner {
        flex-direction: column;
        text-align: center;
      }
    }

    /* 📋 ESTILOS PARA INFORMACIÓN DEL BONO */
    .bond-info-loading, .bond-info-error {
      background: #f8f9fa;
      border: 2px solid #e9ecef;
      border-radius: 12px;
      padding: 25px;
      margin: 20px 0;
      text-align: center;
    }

    .bond-info-loading .loading-header {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 15px;
      margin-bottom: 10px;
    }

    .bond-info-loading h4, .bond-info-error h4 {
      color: #2c3e50;
      margin: 0;
    }

    .bond-info-error {
      border-color: #dc3545;
      background: #f8d7da;
    }

    .bond-info-error .error-header {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      margin-bottom: 15px;
    }

    .bond-info-card {
      background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
      border: 2px solid #28a745;
      border-radius: 16px;
      padding: 30px;
      margin: 20px 0;
      box-shadow: 0 8px 25px rgba(40, 167, 69, 0.1);
      animation: slideInBond 0.5s ease-out;
    }

    @keyframes slideInBond {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .bond-info-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 25px;
      padding-bottom: 20px;
      border-bottom: 2px solid #e9ecef;
    }

    .bond-info-header .bond-icon {
      font-size: 2.5rem;
      color: #28a745;
    }

    .bond-title {
      flex: 1;
      margin-left: 15px;
    }

    .bond-title h4 {
      color: #2c3e50;
      font-size: 1.3rem;
      font-weight: 700;
      margin: 0 0 5px 0;
    }

    .bond-subtitle {
      color: #6c757d;
      font-size: 0.9rem;
      margin: 0;
    }

    .status-badge {
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-badge.active {
      background: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }

    .bond-details-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 25px;
    }

    .detail-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      border: 2px solid #e9ecef;
      display: flex;
      align-items: center;
      gap: 15px;
      transition: all 0.3s ease;
    }

    .detail-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
    }

    .detail-card.primary {
      border-color: #007bff;
      background: linear-gradient(135deg, #e3f2fd 0%, #ffffff 100%);
    }

    .detail-card.success {
      border-color: #28a745;
      background: linear-gradient(135deg, #e8f5e9 0%, #ffffff 100%);
    }

    .detail-card.info {
      border-color: #17a2b8;
      background: linear-gradient(135deg, #e1f7fa 0%, #ffffff 100%);
    }

    .detail-card.warning {
      border-color: #ffc107;
      background: linear-gradient(135deg, #fff3cd 0%, #ffffff 100%);
    }

    .detail-icon {
      font-size: 1.8rem;
    }

    .detail-content {
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;
    }

    .detail-label {
      font-size: 0.8rem;
      color: #6c757d;
      font-weight: 600;
      text-transform: uppercase;
    }

    .detail-value {
      font-size: 1.2rem;
      font-weight: 700;
      color: #2c3e50;
    }

    .bond-additional-info {
      background: rgba(255, 255, 255, 0.8);
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 20px;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 15px;
    }

    .info-row:last-child {
      margin-bottom: 0;
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
    }

    .info-label {
      font-weight: 600;
      color: #495057;
      font-size: 0.9rem;
    }

    .info-value {
      color: #2c3e50;
      font-weight: 500;
    }

    .amortization {
      padding: 4px 12px;
      border-radius: 15px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .amortization-american {
      background: #e3f2fd;
      color: #1976d2;
    }

    .amortization-french {
      background: #f3e5f5;
      color: #7b1fa2;
    }

    .amortization-german {
      background: #e8f5e9;
      color: #388e3c;
    }

    .amortization-default {
      background: #f5f5f5;
      color: #666;
    }

    .analysis-ready-banner {
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
      border-radius: 12px;
      padding: 20px;
      color: white;
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .banner-icon {
      font-size: 2rem;
    }

    .banner-text {
      flex: 1;
    }

    .banner-text strong {
      font-size: 1.1rem;
      display: block;
      margin-bottom: 5px;
    }

    .banner-text p {
      margin: 0;
      opacity: 0.9;
      font-size: 0.9rem;
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

  // Nueva calculadora para métricas avanzadas
  calculadoraMetricas = {
    bonoId: 0,
    tasaMercado: 8.0,
    cambioPuntos: 1.0
  };

  resultado: {
    trea: number;
    rendimientoAnual: number;
    rentabilidadTotal: number;
  } | null = null;

  // Nuevos resultados para métricas
  resultadoMetricas: {
    duracion: number;
    duracionModificada: number;
    convexidad: number;
    cambioPrecio: number;
    sensibilidad: string;
    advertencias?: string[];
  } | null = null;

  // Estados de carga
  loadingMetricas = false;
  errorMetricas = '';

  // Datos del bono seleccionado
  bonoSeleccionado: {
    id: number;
    nombre: string;
    valorNominal: number;
    tasaCupon: number;
    plazo: number;
    frecuencia: number;
    fechaEmision: string;
    fechaVencimiento: string;
    tipoAmortizacion: string;
    emisor: string;
    moneda: string;
  } | null = null;
  
  loadingBono = false;
  errorBono = '';

  constructor(
    private router: Router,
    private logger: LoggerService,
    private calculoService: CalculoService,
    private bonoService: BonoService
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

  calcularMetricasAvanzadas(): void {
    if (!this.puedeCalcularMetricas()) return;

    // Validar parámetros de entrada
    const { bonoId, tasaMercado, cambioPuntos } = this.calculadoraMetricas;
    
    // Validaciones de entrada más estrictas con notificaciones
    if (tasaMercado < 0 || tasaMercado > 1000) {
      this.errorMetricas = 'La tasa de mercado debe estar entre 0% y 1000%';
      this.mostrarNotificacion('📊 Tasa de mercado fuera de rango. Use valores entre 0% y 1000%', 'warning');
      return;
    }
    
    if (cambioPuntos < 0 || cambioPuntos > 10) {
      this.errorMetricas = 'El cambio en puntos debe estar entre 0% y 10%';
      this.mostrarNotificacion('📈 Cambio en puntos muy alto. Use valores entre 0% y 10%', 'warning');
      return;
    }

    this.loadingMetricas = true;
    this.errorMetricas = '';
    this.resultadoMetricas = null;
    
    this.bonoService.calcularMetricas(bonoId, tasaMercado, cambioPuntos).subscribe({
      next: (metricas: DuracionConvexidad) => {
        // 🔍 LOG DETALLADO DE LA RESPUESTA DEL BACKEND
        console.log('🔍 RESPUESTA COMPLETA DEL BACKEND:', {
          parametrosEnviados: { bonoId, tasaMercado, cambioPuntos },
          respuestaCompleta: metricas,
          stringifyRespuesta: JSON.stringify(metricas, null, 2),
          tiposDeDatos: {
            duracion: typeof metricas?.duracion,
            duracionModificada: typeof metricas?.duracionModificada,
            convexidad: typeof metricas?.convexidad,
            cambioPrecio: typeof metricas?.cambioPrecio
          },
          valoresReales: {
            duracion: metricas?.duracion,
            duracionModificada: metricas?.duracionModificada,
            convexidad: metricas?.convexidad,
            cambioPrecio: metricas?.cambioPrecio
          }
        });
        
        this.logger.info('🔍 Respuesta completa del backend', 'MisCalculosComponent', {
          parametrosEnviados: { bonoId, tasaMercado, cambioPuntos },
          respuestaCompleta: metricas,
          tiposDeDatos: {
            duracion: typeof metricas?.duracion,
            duracionModificada: typeof metricas?.duracionModificada,
            convexidad: typeof metricas?.convexidad,
            cambioPrecio: typeof metricas?.cambioPrecio
          }
        });

        // 🛡️ VALIDACIÓN ROBUSTA DE LA RESPUESTA (MODO PERMISIVO)
        const validacionRespuesta = this.validarRespuestaBackend(metricas);
        
        if (!validacionRespuesta.esValida) {
          console.warn('⚠️ PROBLEMAS EN LA RESPUESTA DEL BACKEND:', validacionRespuesta.errores);
          
          // En lugar de fallar completamente, continuar con advertencias
          this.logger.warn('⚠️ Respuesta con problemas del backend', 'MisCalculosComponent', {
            errores: validacionRespuesta.errores,
            respuestaRecibida: metricas,
            continuandoConAdvertencias: true
          });
        }

        // ✅ PROCESAR DATOS VÁLIDOS CON NOMBRES CORRECTOS DEL BACKEND
        const respuestaAny = metricas as any; // Cast para acceder a propiedades del backend
        
        console.log('🔧 MAPEO DE CAMPOS DEL BACKEND:', {
          duracion: respuestaAny?.duracion,
          cambioPorcentualPrecio: respuestaAny?.cambioPorcentualPrecio,
          convexidad: respuestaAny?.convexidad,
          duracionModificada: respuestaAny?.duracionModificada,
          // Otros campos que podrían estar presentes:
          allFields: Object.keys(respuestaAny || {})
        });
        
        const duracion = this.validarNumero(respuestaAny?.duracion, 'Duración');
        
        // 🔧 INTENTAR MÚLTIPLES NOMBRES PARA DURACIÓN MODIFICADA
        const duracionModificadaValor = respuestaAny?.duracionModificada || 
                                       respuestaAny?.modified_duration ||
                                       respuestaAny?.modifiedDuration ||
                                       (respuestaAny?.duracion ? respuestaAny.duracion / (1 + (respuestaAny?.tasaMercado || 10) / 100) : 0);
        
        console.log('🎯 DURACIÓN MODIFICADA ENCONTRADA:', {
          duracionModificada: respuestaAny?.duracionModificada,
          modified_duration: respuestaAny?.modified_duration,
          modifiedDuration: respuestaAny?.modifiedDuration,
          valorFinal: duracionModificadaValor
        });
        
        const duracionModificada = this.validarNumero(duracionModificadaValor, 'Duración Modificada');
        
        const convexidad = this.validarNumero(respuestaAny?.convexidad, 'Convexidad');
        
        // 🎯 USAR NOMBRE CORRECTO DEL BACKEND: cambioPorcentualPrecio
        const cambioPrecioValor = respuestaAny?.cambioPorcentualPrecio || respuestaAny?.cambioPrecio;
        
        console.log('💰 CAMBIO DE PRECIO ENCONTRADO:', {
          cambioPorcentualPrecio: respuestaAny?.cambioPorcentualPrecio,
          cambioPrecio: respuestaAny?.cambioPrecio,
          valorFinal: cambioPrecioValor
        });
        
        const cambioPrecio = this.validarNumero(cambioPrecioValor, 'Cambio de Precio');

        // 🔍 DETECTAR VALORES PROBLEMÁTICOS
        const valoresProblematicos = this.detectarValoresProblematicos(metricas, {
          duracion, duracionModificada, convexidad, cambioPrecio
        });

        // Agregar errores de validación a las advertencias
        if (!validacionRespuesta.esValida) {
          valoresProblematicos.push(`Errores de validación: ${validacionRespuesta.errores.join(', ')}`);
        }

        this.resultadoMetricas = {
          duracion: Number(duracion.toFixed(2)),
          duracionModificada: Number(duracionModificada.toFixed(2)),
          convexidad: Number(convexidad.toFixed(2)),
          cambioPrecio: Number(cambioPrecio.toFixed(2)),
          sensibilidad: this.interpretarSensibilidad(duracionModificada),
          advertencias: valoresProblematicos
        };
        
        this.loadingMetricas = false;
        
        // 🎉 NOTIFICAR ÉXITO O ADVERTENCIAS
        if (valoresProblematicos.length > 0) {
          this.mostrarNotificacion(
            `⚠️ Cálculo completado con ${valoresProblematicos.length} advertencia(s). Revise los resultados.`,
            'warning'
          );
        } else {
          this.mostrarNotificacion('✅ Métricas calculadas correctamente', 'success');
        }
        
        this.logger.info('✅ Métricas procesadas correctamente', 'MisCalculosComponent', {
          parametrosEntrada: { bonoId, tasaMercado, cambioPuntos },
          resultadoFinal: this.resultadoMetricas,
          advertencias: valoresProblematicos
        });
      },
      error: (error: any) => {
        this.handleErrorMetricas(error);
      }
    });
  }

  puedeCalcularMetricas(): boolean {
    return this.calculadoraMetricas.bonoId > 0 && 
           this.calculadoraMetricas.tasaMercado > 0;
  }

  private interpretarSensibilidad(duracionModificada: number): string {
    if (duracionModificada === 0) return 'Cálculo Inválido';
    if (duracionModificada < 1.99) return 'Baja Sensibilidad';
    if (duracionModificada <= 4.99) return 'Sensibilidad Moderada';
    if (duracionModificada <= 7.99) return 'Alta Sensibilidad';
    return 'Muy Alta Sensibilidad';
  }

  getSensitivityClass(sensibilidad: string): string {
    switch (sensibilidad) {
      case 'Cálculo Inválido': return 'invalid-calc';
      case 'Baja Sensibilidad': return 'low-risk';
      case 'Sensibilidad Moderada': return 'medium-risk';
      case 'Alta Sensibilidad': return 'high-risk';
      case 'Muy Alta Sensibilidad': return 'very-high-risk';
      default: return 'medium-risk';
    }
  }

  getInterpretacionSensibilidad(duracionModificada: number): string {
    const tasaMercado = this.calculadoraMetricas.tasaMercado;
    const cambioEnPuntos = this.calculadoraMetricas.cambioPuntos;
    
    if (duracionModificada === 0) {
      return `Con una tasa de mercado del ${tasaMercado}% y cambio de ${cambioEnPuntos}%, el cálculo resultó inválido. Verifique que los valores sean realistas.`;
    }
    
    // Interpretación completamente dinámica con rangos consistentes
    let interpretacion = `Con los parámetros actuales (Tasa: ${tasaMercado}%, Cambio: ${cambioEnPuntos}%), `;
    
    if (duracionModificada < 1.99) {
      interpretacion += `la duración modificada de ${duracionModificada} años indica BAJA sensibilidad. `;
      interpretacion += `Por cada 1% de cambio en tasas, el precio varía aproximadamente ${duracionModificada.toFixed(1)}%. `;
      interpretacion += 'Ideal para inversores conservadores que buscan estabilidad.';
    } else if (duracionModificada <= 4.99) {
      interpretacion += `la duración modificada de ${duracionModificada} años indica sensibilidad MODERADA. `;
      interpretacion += `Por cada 1% de cambio en tasas, el precio varía aproximadamente ${duracionModificada.toFixed(1)}%. `;
      interpretacion += 'Adecuado para perfiles de riesgo equilibrado.';
    } else if (duracionModificada <= 7.99) {
      interpretacion += `la duración modificada de ${duracionModificada} años indica ALTA sensibilidad. `;
      interpretacion += `Por cada 1% de cambio en tasas, el precio varía aproximadamente ${duracionModificada.toFixed(1)}%. `;
      interpretacion += 'Requiere experiencia en mercados de renta fija.';
    } else {
      interpretacion += `la duración modificada de ${duracionModificada} años indica MUY ALTA sensibilidad. `;
      interpretacion += `Por cada 1% de cambio en tasas, el precio varía aproximadamente ${duracionModificada.toFixed(1)}%. `;
      interpretacion += 'Solo recomendado para inversores con alta tolerancia al riesgo.';
    }
    
    return interpretacion;
  }

  getRecomendacion(duracionModificada: number, convexidad: number): string {
    const tasaMercado = this.calculadoraMetricas.tasaMercado;
    const cambioEnPuntos = this.calculadoraMetricas.cambioPuntos;
    const cambioPrecio = this.resultadoMetricas?.cambioPrecio || 0;
    
    if (duracionModificada === 0 || convexidad === 0) {
      return `❌ No se puede generar recomendación válida. Revise los parámetros ingresados (Tasa: ${tasaMercado}%, Cambio: ${cambioEnPuntos}%).`;
    }
    
    let recomendacion = '';
    
    // 🎯 PARTE 1: EVALUACIÓN DE LA TASA DE MERCADO
    if (tasaMercado > 30) {
      recomendacion += `🚨 TASA EXTREMA: ${tasaMercado}% indica hiperinflación. Considere activos reales o bonos indexados. `;
    } else if (tasaMercado > 15) {
      recomendacion += `⚠️ TASA ALTA: ${tasaMercado}% requiere evaluar riesgo país cuidadosamente. `;
    } else if (tasaMercado < 2) {
      recomendacion += `📉 TASA BAJA: ${tasaMercado}% es muy baja. Considere la inflación y busque diversificación. `;
    } else {
      recomendacion += `✅ TASA NORMAL: ${tasaMercado}% está en rango aceptable para análisis. `;
    }
    
    // 🛡️ PARTE 2: ANÁLISIS DE PROTECCIÓN (CONVEXIDAD)
    if (convexidad > 50) {
      recomendacion += `🛡️ BUENA PROTECCIÓN: Convexidad ${convexidad.toFixed(1)} ofrece protección ante volatilidad. `;
    } else if (convexidad > 10) {
      recomendacion += `⚖️ PROTECCIÓN MODERADA: Convexidad ${convexidad.toFixed(1)} brinda protección limitada. `;
    } else {
      recomendacion += `⚠️ POCA PROTECCIÓN: Convexidad ${convexidad.toFixed(1)} ofrece escasa protección. `;
    }
    
    // 📊 PARTE 3: RECOMENDACIÓN FINAL SEGÚN PERFIL
    if (duracionModificada <= 2) {
      recomendacion += `🎯 PERFIL CONSERVADOR: Cambio de precio del ${cambioPrecio.toFixed(2)}% indica baja volatilidad. RECOMENDADO para inversores que buscan estabilidad.`;
    } else if (duracionModificada <= 4.99) {
      recomendacion += `📊 PERFIL EQUILIBRADO: Cambio de precio del ${cambioPrecio.toFixed(2)}% en rango moderado. ADECUADO para portfolios balanceados.`;
    } else if (duracionModificada <= 7.99) {
      recomendacion += `⚡ PERFIL AVANZADO: Cambio de precio del ${cambioPrecio.toFixed(2)}% indica alta sensibilidad. REQUIERE experiencia en mercados de renta fija.`;
    } else {
      recomendacion += `🚨 PERFIL EXPERTO: Cambio de precio del ${cambioPrecio.toFixed(2)}% indica muy alta sensibilidad. SOLO para inversores con alta tolerancia al riesgo.`;
    }
    
    return recomendacion;
  }

  private validarNumero(valor: any, nombreCampo: string): number {
    if (valor === undefined || valor === null || isNaN(Number(valor))) {
      this.logger.warn(`⚠️ Valor inválido para ${nombreCampo}: ${valor}`, 'MisCalculosComponent');
      return 0;
    }
    return Number(valor);
  }

  /**
   * 🛡️ VALIDACIÓN ROBUSTA DE LA RESPUESTA DEL BACKEND
   * Implementa las mejores prácticas para validar datos del servidor
   */
  private validarRespuestaBackend(respuesta: any): { esValida: boolean; errores: string[] } {
    const errores: string[] = [];

    // Verificar que la respuesta no sea null o undefined
    if (!respuesta) {
      errores.push('Respuesta vacía del servidor');
      return { esValida: false, errores };
    }

    // Verificar que sea un objeto
    if (typeof respuesta !== 'object') {
      errores.push('Formato de respuesta inválido');
      return { esValida: false, errores };
    }

    // ✅ VALIDAR USANDO LOS NOMBRES REALES DEL BACKEND
    const propiedadesFaltantes: string[] = [];
    
    // Verificar duracion
    if (!respuesta.duracion && respuesta.duracion !== 0) {
      propiedadesFaltantes.push('duracion');
    }
    
    // Verificar duracionModificada (varios nombres posibles)
    if (!respuesta.duracionModificada && !respuesta.modified_duration && !respuesta.modifiedDuration) {
      propiedadesFaltantes.push('duracionModificada');
    }
    
    // Verificar convexidad
    if (!respuesta.convexidad && respuesta.convexidad !== 0) {
      propiedadesFaltantes.push('convexidad');
    }
    
    // Verificar cambioPrecio (nombre real: cambioPorcentualPrecio)
    if (!respuesta.cambioPorcentualPrecio && !respuesta.cambioPrecio && respuesta.cambioPorcentualPrecio !== 0) {
      propiedadesFaltantes.push('cambioPorcentualPrecio');
    }

    if (propiedadesFaltantes.length > 0) {
      errores.push(`Propiedades con undefined: ${propiedadesFaltantes.join(', ')}`);
    }

    // Verificar que al menos algunas propiedades tengan valores válidos
    const camposDisponibles = ['duracion', 'convexidad', 'cambioPorcentualPrecio', 'duracionModificada'];
    const propiedadesValidas = camposDisponibles.filter(campo => 
      respuesta[campo] !== undefined && 
      respuesta[campo] !== null && 
      !isNaN(Number(respuesta[campo]))
    );

    // Solo fallar si NO HAY NINGUNA propiedad válida (caso extremo)
    if (propiedadesValidas.length === 0) {
      errores.push('⚠️ CRÍTICO: Ninguna propiedad contiene valores válidos');
    }

    // SOLO consideramos inválida la respuesta si es un caso extremo
    const esInvalida = propiedadesValidas.length === 0 || propiedadesFaltantes.length >= 3;

    return { 
      esValida: !esInvalida, // Cambiado: ahora es menos estricto
      errores 
    };
  }

  /**
   * 🔍 DETECTAR VALORES PROBLEMÁTICOS
   * Identifica qué valores pueden ser imprecisos o problemáticos
   */
  private detectarValoresProblematicos(
    respuestaOriginal: any, 
    valoresProcesados: { duracion: number; duracionModificada: number; convexidad: number; cambioPrecio: number }
  ): string[] {
    const problemas: string[] = [];

    // Detectar valores que fueron convertidos a 0 por ser undefined/null
    if (valoresProcesados.duracion === 0 && respuestaOriginal?.duracion !== 0) {
      problemas.push('Duración');
    }
    
    // Verificar duración modificada con múltiples nombres posibles
    const duracionModificadaOriginal = respuestaOriginal?.duracionModificada || 
                                      respuestaOriginal?.modified_duration || 
                                      respuestaOriginal?.modifiedDuration;
    if (valoresProcesados.duracionModificada === 0 && duracionModificadaOriginal !== 0) {
      problemas.push('Duración Modificada');
    }
    
    if (valoresProcesados.convexidad === 0 && respuestaOriginal?.convexidad !== 0) {
      problemas.push('Convexidad');
    }
    
    // Verificar cambio de precio con el nombre correcto del backend
    const cambioPrecioOriginal = respuestaOriginal?.cambioPorcentualPrecio || respuestaOriginal?.cambioPrecio;
    if (valoresProcesados.cambioPrecio === 0 && cambioPrecioOriginal !== 0) {
      problemas.push('Cambio de Precio');
    }

    // Detectar valores extremos que pueden indicar problemas de cálculo
    if (valoresProcesados.duracion > 100) {
      problemas.push('Duración (valor extremo)');
    }
    
    if (valoresProcesados.convexidad > 1000) {
      problemas.push('Convexidad (valor extremo)');
    }

    return problemas;
  }

  /**
   * 🚨 MANEJO CENTRALIZADO DE ERRORES
   * Implementa las mejores prácticas de manejo de errores HTTP
   */
  private handleErrorMetricas(error: any): void {
    let mensajeUsuario = 'Error al calcular métricas. ';
    let detalleError = '';

    // Categorizar tipos de error según las mejores prácticas
    if (error.status === 0) {
      // Error de red o servidor no disponible
      mensajeUsuario += 'Problema de conexión con el servidor.';
      detalleError = 'Network error or server unavailable';
    } else if (error.status >= 400 && error.status < 500) {
      // Errores del cliente (4xx)
      mensajeUsuario += 'Parámetros inválidos o problema de autorización.';
      detalleError = error.error?.message || `HTTP ${error.status}`;
    } else if (error.status >= 500) {
      // Errores del servidor (5xx)
      mensajeUsuario += 'Error interno del servidor.';
      detalleError = `Server error ${error.status}`;
    } else {
      // Otros errores
      mensajeUsuario += 'Error inesperado.';
      detalleError = error.message || 'Unknown error';
    }

    this.errorMetricas = mensajeUsuario + ' Intente nuevamente.';
    this.loadingMetricas = false;

    // Log detallado para debugging
    this.logger.error('🚨 Error en cálculo de métricas', 'MisCalculosComponent', {
      errorStatus: error.status,
      errorMessage: error.message,
      errorDetails: error.error,
      parametros: this.calculadoraMetricas,
      tipoError: this.categorizarError(error),
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 🏷️ CATEGORIZAR ERRORES PARA MEJOR DEBUGGING
   */
  private categorizarError(error: any): string {
    if (error.status === 0) return 'NETWORK_ERROR';
    if (error.status === 400) return 'BAD_REQUEST';
    if (error.status === 401) return 'UNAUTHORIZED';
    if (error.status === 403) return 'FORBIDDEN';
    if (error.status === 404) return 'NOT_FOUND';
    if (error.status >= 500) return 'SERVER_ERROR';
    return 'UNKNOWN_ERROR';
  }

  /**
   * 📝 OBTENER DESCRIPCIÓN DETALLADA DE PROBLEMAS
   * Proporciona explicaciones específicas para cada tipo de problema
   */
  getDescripcionProblema(problema: string): string {
    const descripciones: { [key: string]: string } = {
      'Duración': 'El servidor no pudo calcular la duración del bono. Esto puede indicar un problema con los datos del bono.',
      'Duración Modificada': 'El backend no devuelve <code>duracionModificada</code>. Busqué también <code>modified_duration</code> y <code>modifiedDuration</code> sin éxito.',
      'Convexidad': 'La convexidad no se pudo determinar. Importante para estrategias de cobertura.',
      'Cambio de Precio': 'El backend devuelve <code>cambioPorcentualPrecio</code> pero puede estar <code>undefined</code>. Verifique la implementación del backend.',
      'Duración (valor extremo)': 'La duración calculada es inusualmente alta (>100). Verifique los datos.',
      'Convexidad (valor extremo)': 'La convexidad es extremadamente alta (>1000). Posible error de cálculo.'
    };

    // Manejar errores de validación
    if (problema.startsWith('Errores de validación:')) {
      return 'La respuesta del servidor no contiene todas las propiedades esperadas. Revisa los logs detallados para ver qué campos faltan.';
    }

    return descripciones[problema] || 'Valor no disponible o inconsistente con los parámetros proporcionados.';
  }

  /**
   * 🔄 REINTENTAR CÁLCULO CON LOGGING MEJORADO
   * Implementa retry con buenas prácticas
   */
  reintentarCalculo(): void {
    this.logger.info('🔄 Usuario solicitó reintentar cálculo', 'MisCalculosComponent', {
      parametrosActuales: this.calculadoraMetricas,
      timestamp: new Date().toISOString()
    });

    // Limpiar errores previos
    this.errorMetricas = '';
    this.resultadoMetricas = null;
    
    // Notificar al usuario
    this.mostrarNotificacion('🔄 Reintentando cálculo con los mismos parámetros...', 'info');
    
    // Volver a ejecutar el cálculo
    this.calcularMetricasAvanzadas();
  }

  /**
   * 🔔 SISTEMA DE NOTIFICACIONES PARA MEJOR UX
   * Muestra notificaciones temporales al usuario
   */
  private mostrarNotificacion(mensaje: string, tipo: 'success' | 'error' | 'warning' | 'info'): void {
    // Crear elemento de notificación
    const notificacion = document.createElement('div');
    notificacion.className = `notification notification-${tipo}`;
    notificacion.innerHTML = `
      <div class="notification-content">
        <span class="notification-message">${mensaje}</span>
        <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `;

    // Agregar estilos inline para asegurar que se vea
    notificacion.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      max-width: 400px;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      animation: slideInNotification 0.3s ease-out;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    // Colores según el tipo
    const colores = {
      success: { bg: '#d4edda', border: '#c3e6cb', text: '#155724' },
      error: { bg: '#f8d7da', border: '#f5c6cb', text: '#721c24' },
      warning: { bg: '#fff3cd', border: '#ffeaa7', text: '#856404' },
      info: { bg: '#d1ecf1', border: '#bee5eb', text: '#0c5460' }
    };

    const color = colores[tipo];
    notificacion.style.backgroundColor = color.bg;
    notificacion.style.border = `2px solid ${color.border}`;
    notificacion.style.color = color.text;

    // Agregar al DOM
    document.body.appendChild(notificacion);

    // Auto-remover después de 5 segundos
    setTimeout(() => {
      if (notificacion.parentNode) {
        notificacion.style.animation = 'slideOutNotification 0.3s ease-out';
        setTimeout(() => notificacion.remove(), 300);
      }
    }, 5000);

    // Log de la notificación
    this.logger.info(`🔔 Notificación mostrada: ${tipo}`, 'MisCalculosComponent', { mensaje });
  }

  /**
   * 🚨 DETECTAR CÁLCULOS MATEMÁTICAMENTE INCORRECTOS
   * Implementa la validación que mencionó Claude sobre inconsistencias
   */
  tieneCalculoIncorrecto(): boolean {
    if (!this.resultadoMetricas) return false;
    
    const cambioEsperado = this.getCambioEsperadoNumerico();
    const cambiReal = Math.abs(this.resultadoMetricas.cambioPrecio);
    const diferencia = Math.abs(Math.abs(cambioEsperado) - cambiReal);
    
    // Si la diferencia es mayor a 5 puntos porcentuales, es sospechoso
    return diferencia > 5;
  }

  /**
   * 📊 CALCULAR EL CAMBIO ESPERADO SEGÚN LA FÓRMULA MATEMÁTICA
   */
  getCambioEsperadoNumerico(): number {
    if (!this.resultadoMetricas) return 0;
    
    // Fórmula: Cambio % ≈ -Duración Modificada × Cambio en Tasa
    const duracionModificada = this.resultadoMetricas.duracionModificada;
    const cambioEnTasa = this.calculadoraMetricas.cambioPuntos / 100;
    
    return Math.abs(duracionModificada * cambioEnTasa * 100);
  }

  /**
   * 📈 OBTENER CAMBIO ESPERADO FORMATEADO
   */
  getCambioEsperado(): string {
    return this.getCambioEsperadoNumerico().toFixed(2);
  }

  /**
   * 🔍 CALCULAR LA DIFERENCIA PORCENTUAL
   */
  getDiferenciaPorcentual(): string {
    if (!this.resultadoMetricas) return '0.00';
    
    const esperado = this.getCambioEsperadoNumerico();
    const real = Math.abs(this.resultadoMetricas.cambioPrecio);
    const diferencia = Math.abs(esperado - real);
    
    return diferencia.toFixed(2);
  }

  /**
   * 💬 EXPLICACIÓN DETALLADA DEL PROBLEMA DE CÁLCULO
   */
  getExplicacionCalculoIncorrecto(): string {
    const tasaMercado = this.calculadoraMetricas.tasaMercado;
    const cambioEnPuntos = this.calculadoraMetricas.cambioPuntos;
    const duracionModificada = this.resultadoMetricas?.duracionModificada || 0;
    
    return `Con una tasa de mercado del ${tasaMercado}% y un cambio de ${cambioEnPuntos} puntos porcentuales, ` +
           `la duración modificada de ${duracionModificada} años debería resultar en un cambio de precio de ` +
           `aproximadamente ${this.getCambioEsperado()}% (fórmula: ${duracionModificada} × ${cambioEnPuntos}% = ${this.getCambioEsperado()}%). ` +
           `Sin embargo, el sistema calculó ${this.resultadoMetricas?.cambioPrecio.toFixed(2)}%. ` +
           `Esta discrepancia sugiere un problema en los cálculos del backend o en los datos del bono.`;
  }

  /**
   * 🔎 CARGAR DATOS DEL BONO SELECCIONADO
   * Se ejecuta cuando el usuario cambia el ID del bono
   */
  cargarDatosBono(): void {
    const bonoId = this.calculadoraMetricas.bonoId;
    
    if (bonoId <= 0) {
      this.bonoSeleccionado = null;
      this.errorBono = '';
      return;
    }

    this.loadingBono = true;
    this.errorBono = '';
    this.bonoSeleccionado = null;

    // Usar el servicio real del backend
    this.bonoService.getBonoDetalle(bonoId).subscribe({
      next: (bono) => {
        // Mapear los datos reales del bono a la estructura esperada
        this.bonoSeleccionado = this.mapearDatosBono(bono);
        this.loadingBono = false;
        this.mostrarNotificacion(`📋 Bono "${this.bonoSeleccionado?.nombre}" cargado correctamente`, 'success');
        
        this.logger.info('📋 Datos del bono cargados', 'MisCalculosComponent', {
          bonoId,
          bonoSeleccionado: this.bonoSeleccionado
        });
      },
      error: (error: any) => {
        this.loadingBono = false;
        this.errorBono = `Error al cargar datos del bono ID ${bonoId}. Verifique que existe.`;
        this.mostrarNotificacion(`❌ No se pudo cargar el bono ID ${bonoId}`, 'error');
        
        this.logger.error('❌ Error al cargar datos del bono', 'MisCalculosComponent', {
          bonoId,
          error
        });
      }
    });
  }

  /**
   * 🔄 MAPEAR DATOS REALES DEL BONO A LA ESTRUCTURA ESPERADA
   * Convierte el modelo real del backend a la interfaz del componente
   */
  private mapearDatosBono(bono: Bono): any {
    // Calcular fecha de vencimiento
    const fechaEmision = new Date(bono.fechaEmision);
    const fechaVencimiento = new Date(fechaEmision);
    fechaVencimiento.setFullYear(fechaEmision.getFullYear() + bono.plazoAnios);

    return {
      id: bono.id,
      nombre: bono.nombre || `Bono ${bono.id}`,
      valorNominal: bono.valorNominal,
      tasaCupon: bono.tasaCupon,
      plazo: bono.plazoAnios,
      frecuencia: bono.frecuenciaPagos,
      fechaEmision: bono.fechaEmision,
      fechaVencimiento: fechaVencimiento.toISOString().split('T')[0],
      tipoAmortizacion: bono.metodoAmortizacion || 'Americano',
      emisor: bono.emisorNombre || 'Emisor no especificado',
      moneda: bono.moneda?.codigo || bono.moneda || 'USD'
    };
  }

  /**
   * 🎨 OBTENER CLASE CSS PARA EL TIPO DE AMORTIZACIÓN
   */
  getAmortizacionClass(tipo: string): string {
    switch (tipo.toLowerCase()) {
      case 'americano': return 'amortization-american';
      case 'francés': case 'frances': return 'amortization-french';
      case 'alemán': case 'aleman': return 'amortization-german';
      default: return 'amortization-default';
    }
  }

  /**
   * 💱 OBTENER SÍMBOLO DE MONEDA
   */
  getSimboloMoneda(moneda: string): string {
    switch (moneda.toUpperCase()) {
      case 'USD': return '$';
      case 'PEN': case 'SOL': return 'S/';
      case 'EUR': return '€';
      case 'GBP': return '£';
      default: return moneda;
    }
  }

  /**
   * 📅 CALCULAR DÍAS HASTA VENCIMIENTO
   */
  getDiasHastaVencimiento(fechaVencimiento: string): number {
    const hoy = new Date();
    const vencimiento = new Date(fechaVencimiento);
    const diferencia = vencimiento.getTime() - hoy.getTime();
    return Math.ceil(diferencia / (1000 * 3600 * 24));
  }

  /**
   * 🔍 ABRIR CONSOLA DEL NAVEGADOR PARA VER LOGS DETALLADOS
   * Útil para debugging en desarrollo
   */
  abrirConsola(): void {
    console.log('🔍 INFORMACIÓN DE DEBUGGING PARA EL USUARIO:');
    console.log('=====================================');
    console.log('1. Los logs detallados aparecen arriba en esta consola');
    console.log('2. Busca mensajes que empiecen con "🔍 RESPUESTA COMPLETA DEL BACKEND"');
    console.log('3. Ahí podrás ver exactamente qué está devolviendo el servidor');
    console.log('4. Si ves "undefined" en algún campo, ese es el problema');
    console.log('=====================================');
    
    // Mostrar información del estado actual
    if (this.resultadoMetricas) {
      console.log('📊 ESTADO ACTUAL DE MÉTRICAS:', this.resultadoMetricas);
    }
    
    console.log('⚙️ PARÁMETROS ACTUALES:', this.calculadoraMetricas);
    
    // Notificación al usuario
    this.mostrarNotificacion(
      '🔍 Revisa la consola del navegador (F12) para ver logs detallados',
      'info'
    );
    
    // Intentar abrir devtools automáticamente (solo funciona en desarrollo)
    try {
      (window as any).open('', '_self', '').console;
    } catch (e) {
      console.log('💡 Presiona F12 o click derecho > Inspeccionar para abrir las herramientas de desarrollador');
    }
  }
} 