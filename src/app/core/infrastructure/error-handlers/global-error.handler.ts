import { ErrorHandler, Injectable, inject } from '@angular/core';
import { LoggerService } from '../../../shared/services/logger.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private logger = inject(LoggerService);

  handleError(error: any): void {
    // Log del error global
    this.logger.error(
      `🚨 Global Error: ${error.message || error.toString()}`,
      'GlobalErrorHandler',
      {
        error: error.message || error.toString(),
        stack: error.stack,
        name: error.name,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      }
    );

    // Información adicional sobre el tipo de error
    if (error.name === 'ChunkLoadError') {
      this.logger.error(
        '📦 Error de carga de chunk - Posible actualización de la aplicación',
        'GlobalErrorHandler',
        {
          solution: 'Recarga la página para obtener la última versión',
          error
        }
      );
    } else if (error.message?.includes('Loading chunk')) {
      this.logger.error(
        '📦 Error de carga lazy loading',
        'GlobalErrorHandler',
        {
          solution: 'Verifica la conexión a internet y recarga la página',
          error
        }
      );
    } else if (error.message?.includes('ResizeObserver')) {
      this.logger.warn(
        '👁️ Warning ResizeObserver (ignorable)',
        'GlobalErrorHandler',
        { error }
      );
    } else if (error.message?.includes('Non-Error promise rejection')) {
      this.logger.warn(
        '🔄 Promise rejection sin error específico',
        'GlobalErrorHandler',
        { error }
      );
    }

    // Log en consola también para desarrollo
    console.error('🚨 Global Error Caught:', error);
  }
} 