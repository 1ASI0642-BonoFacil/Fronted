import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../iam/application/services/auth.service';

@Component({
  selector: 'app-connection-test',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="connection-test">
      <h2>🔗 Test de Conexión Backend</h2>
      <div class="test-results">
        <div class="test-item">
          <strong>URL Backend:</strong> {{ backendUrl }}
          <span [class]="'status ' + (backendStatus || 'pending')">
            {{ backendStatusText }}
          </span>
        </div>
        
        <div class="test-item">
          <strong>Autenticación:</strong>
          <span [class]="'status ' + (authStatus || 'pending')">
            {{ authStatusText }}
          </span>
        </div>
        
        <div class="test-item">
          <strong>JWT Token:</strong>
          <span [class]="'status ' + (tokenStatus || 'pending')">
            {{ tokenStatusText }}
          </span>
        </div>
      </div>
      
      <div class="actions">
        <button (click)="testConnection()" class="btn test-btn">
          🔄 Probar Conexión
        </button>
        <button (click)="testAuth()" class="btn auth-btn">
          🔐 Probar Auth
        </button>
      </div>
      
      <div *ngIf="logs.length > 0" class="logs">
        <h3>📋 Logs:</h3>
        <div class="log-container">
          <div *ngFor="let log of logs" [class]="'log ' + log.type">
            <span class="timestamp">{{ log.timestamp | date:'HH:mm:ss' }}</span>
            {{ log.message }}
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .connection-test {
      background: white;
      padding: 30px;
      border-radius: 16px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      margin: 20px;
      max-width: 800px;
    }
    
    h2 {
      color: #2c3e50;
      margin-bottom: 25px;
      font-size: 1.5rem;
    }
    
    .test-results {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 12px;
      margin-bottom: 20px;
    }
    
    .test-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
      border-bottom: 1px solid #e9ecef;
    }
    
    .test-item:last-child {
      border-bottom: none;
    }
    
    .status {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 0.85rem;
      font-weight: 600;
    }
    
    .status.success {
      background: #d4edda;
      color: #155724;
    }
    
    .status.error {
      background: #f8d7da;
      color: #721c24;
    }
    
    .status.pending {
      background: #fff3cd;
      color: #856404;
    }
    
    .actions {
      display: flex;
      gap: 15px;
      margin-bottom: 20px;
    }
    
    .btn {
      padding: 12px 20px;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    
    .test-btn {
      background: #667eea;
      color: white;
    }
    
    .auth-btn {
      background: #28a745;
      color: white;
    }
    
    .btn:hover {
      transform: translateY(-2px);
      opacity: 0.9;
    }
    
    .logs {
      background: #1e1e1e;
      border-radius: 8px;
      padding: 20px;
      color: #fff;
    }
    
    .logs h3 {
      color: #fff;
      margin-bottom: 15px;
      font-size: 1.1rem;
    }
    
    .log-container {
      max-height: 300px;
      overflow-y: auto;
    }
    
    .log {
      padding: 5px 0;
      font-family: 'Courier New', monospace;
      font-size: 0.9rem;
    }
    
    .log.success {
      color: #4ade80;
    }
    
    .log.error {
      color: #f87171;
    }
    
    .log.info {
      color: #60a5fa;
    }
    
    .timestamp {
      color: #9ca3af;
    }
  `]
})
export class ConnectionTestComponent implements OnInit {
  backendUrl = environment.apiUrl;
  backendStatus: string | null = null;
  authStatus: string | null = null;
  tokenStatus: string | null = null;
  
  backendStatusText = 'No probado';
  authStatusText = 'No probado';
  tokenStatusText = 'No probado';
  
  logs: Array<{type: string, message: string, timestamp: Date}> = [];

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.checkTokenStatus();
    this.addLog('info', 'Componente de prueba inicializado');
  }

  testConnection() {
    this.addLog('info', 'Probando conexión al backend...');
    this.backendStatus = 'pending';
    this.backendStatusText = 'Probando...';
    
    // Test simple de conectividad
    this.http.get(`${this.backendUrl}/actuator/health`).subscribe({
      next: (response) => {
        this.backendStatus = 'success';
        this.backendStatusText = '✅ Conectado';
        this.addLog('success', `Backend respondió: ${JSON.stringify(response)}`);
      },
      error: (error) => {
        // Intentar con endpoint alternativo si actuator no existe
        this.http.get(`${this.backendUrl}/api/v1/roles`).subscribe({
          next: (response) => {
            this.backendStatus = 'success';
            this.backendStatusText = '✅ Conectado (via API)';
            this.addLog('success', 'Backend respondió via endpoint de roles');
          },
          error: (error2) => {
            this.backendStatus = 'error';
            this.backendStatusText = '❌ Sin conexión';
            this.addLog('error', `Error de conexión: ${error2.message}`);
          }
        });
      }
    });
  }

  testAuth() {
    this.addLog('info', 'Probando endpoint de autenticación...');
    this.authStatus = 'pending';
    this.authStatusText = 'Probando...';
    
    // Test del endpoint de roles (requiere autenticación)
    this.http.get(`${this.backendUrl}/api/v1/roles`).subscribe({
      next: (response) => {
        this.authStatus = 'success';
        this.authStatusText = '✅ Auth OK';
        this.addLog('success', `Roles obtenidos: ${JSON.stringify(response)}`);
      },
      error: (error) => {
        if (error.status === 401) {
          this.authStatus = 'error';
          this.authStatusText = '❌ Sin autorización';
          this.addLog('error', 'Token JWT inválido o expirado');
        } else if (error.status === 403) {
          this.authStatus = 'error';
          this.authStatusText = '❌ Sin permisos';
          this.addLog('error', 'Usuario sin permisos para este endpoint');
        } else {
          this.authStatus = 'error';
          this.authStatusText = '❌ Error Auth';
          this.addLog('error', `Error de autenticación: ${error.message}`);
        }
      }
    });
  }

  checkTokenStatus() {
    const token = this.authService.getToken();
    if (token) {
      this.tokenStatus = 'success';
      this.tokenStatusText = '✅ Token presente';
      this.addLog('success', `Token JWT detectado: ${token.substring(0, 20)}...`);
    } else {
      this.tokenStatus = 'error';
      this.tokenStatusText = '❌ Sin token';
      this.addLog('error', 'No se encontró token JWT en localStorage');
    }
  }

  private addLog(type: string, message: string) {
    this.logs.unshift({
      type,
      message,
      timestamp: new Date()
    });
    
    // Mantener solo los últimos 20 logs
    if (this.logs.length > 20) {
      this.logs = this.logs.slice(0, 20);
    }
  }
} 