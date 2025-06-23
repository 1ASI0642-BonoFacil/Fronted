import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  data?: any;
  component?: string;
  method?: string;
  url?: string;
  userId?: string;
  elapsedTime?: number;
}

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  private logs: LogEntry[] = [];
  private readonly MAX_LOGS = 100;

  constructor() {
    this.info('🚀 LoggerService initialized', 'LoggerService');
  }

  debug(message: string, component?: string, data?: any) {
    this.log('DEBUG', message, component, data);
  }

  info(message: string, component?: string, data?: any) {
    this.log('INFO', message, component, data);
  }

  warn(message: string, component?: string, data?: any) {
    this.log('WARN', message, component, data);
  }

  error(message: string, component?: string, data?: any) {
    this.log('ERROR', message, component, data);
  }

  // Logging específico para HTTP
  logHttpRequest(method: string, url: string, body?: any, component?: string) {
    this.info(
      `🌐 HTTP ${method} → ${url}`,
      component || 'HttpService',
      { method, url, body, type: 'HTTP_REQUEST' }
    );
  }

  logHttpResponse(method: string, url: string, status: number, response?: any, elapsedTime?: number, component?: string) {
    const emoji = status >= 200 && status < 300 ? '✅' : status >= 400 ? '❌' : '⚠️';
    this.info(
      `${emoji} HTTP ${method} ← ${url} (${status}) ${elapsedTime ? `[${elapsedTime}ms]` : ''}`,
      component || 'HttpService',
      { method, url, status, response, elapsedTime, type: 'HTTP_RESPONSE' }
    );
  }

  logHttpError(method: string, url: string, error: any, elapsedTime?: number, component?: string) {
    this.error(
      `💥 HTTP ${method} ← ${url} ERROR ${elapsedTime ? `[${elapsedTime}ms]` : ''}`,
      component || 'HttpService',
      { method, url, error: error.message || error, status: error.status, elapsedTime, type: 'HTTP_ERROR' }
    );
  }

  // Logging de navegación
  logNavigation(from: string, to: string, component?: string) {
    this.info(
      `🧭 Navigation: ${from} → ${to}`,
      component || 'Router',
      { from, to, type: 'NAVIGATION' }
    );
  }

  // Logging de componentes
  logComponentInit(component: string, data?: any) {
    this.info(
      `🎯 Component initialized: ${component}`,
      component,
      { ...data, type: 'COMPONENT_INIT' }
    );
  }

  logComponentDestroy(component: string) {
    this.info(
      `💀 Component destroyed: ${component}`,
      component,
      { type: 'COMPONENT_DESTROY' }
    );
  }

  // Logging de autenticación
  logAuth(action: string, success: boolean, user?: any, component?: string) {
    const emoji = success ? '🔓' : '🔒';
    this.info(
      `${emoji} Auth ${action}: ${success ? 'SUCCESS' : 'FAILED'}`,
      component || 'AuthService',
      { action, success, user, type: 'AUTHENTICATION' }
    );
  }

  // Logging de errores de usuario
  logUserAction(action: string, component: string, data?: any) {
    this.info(
      `👤 User action: ${action}`,
      component,
      { action, ...data, type: 'USER_ACTION' }
    );
  }

  // Obtener logs para debugging
  getLogs(level?: LogLevel): LogEntry[] {
    if (level) {
      return this.logs.filter(log => log.level === level);
    }
    return [...this.logs];
  }

  // Exportar logs como texto
  exportLogs(): string {
    return this.logs
      .map(log => `[${log.timestamp.toISOString()}] ${log.level} ${log.component || 'Unknown'}: ${log.message}`)
      .join('\n');
  }

  // Limpiar logs
  clearLogs() {
    this.logs = [];
    this.info('🧹 Logs cleared', 'LoggerService');
  }

  private log(level: LogLevel, message: string, component?: string, data?: any) {
    const logEntry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      component,
      data,
      url: window.location.href,
      userId: this.getCurrentUserId()
    };

    this.logs.unshift(logEntry);

    // Mantener solo los últimos logs
    if (this.logs.length > this.MAX_LOGS) {
      this.logs = this.logs.slice(0, this.MAX_LOGS);
    }

    // Console logging con colores
    this.logToConsole(logEntry);
  }

  private logToConsole(entry: LogEntry) {
    const timestamp = entry.timestamp.toLocaleTimeString();
    const component = entry.component ? `[${entry.component}]` : '[Unknown]';
    const prefix = `%c${timestamp} ${component}`;
    
    let style = '';
    let emoji = '';
    
    switch (entry.level) {
      case 'DEBUG':
        style = 'color: #6c757d; font-weight: normal;';
        emoji = '🔍';
        break;
      case 'INFO':
        style = 'color: #0066cc; font-weight: bold;';
        emoji = '📘';
        break;
      case 'WARN':
        style = 'color: #ff8c00; font-weight: bold;';
        emoji = '⚠️';
        break;
      case 'ERROR':
        style = 'color: #dc3545; font-weight: bold;';
        emoji = '🚨';
        break;
    }

    const message = `${emoji} ${entry.message}`;
    
    if (entry.data) {
      console.groupCollapsed(`${prefix} ${message}`, style);
      console.log('📋 Data:', entry.data);
      console.log('🌍 URL:', entry.url);
      if (entry.userId) console.log('👤 User:', entry.userId);
      console.groupEnd();
    } else {
      console.log(`${prefix} ${message}`, style);
    }
  }

  private getCurrentUserId(): string | undefined {
    try {
      const user = localStorage.getItem('user');
      if (user) {
        const userData = JSON.parse(user);
        return userData.username || userData.id;
      }
    } catch (error) {
      // Ignore parsing errors
    }
    return undefined;
  }
} 