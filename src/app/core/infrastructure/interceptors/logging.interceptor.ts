import { HttpInterceptorFn, HttpRequest, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { tap, catchError, finalize } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { LoggerService } from '../../../shared/services/logger.service';

interface RequestLog {
  startTime: number;
  url: string;
  method: string;
  body?: any;
}

export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  const logger = inject(LoggerService);
  const startTime = Date.now();
  
  // Log de la petición
  logger.logHttpRequest(req.method, req.url, req.body);
  
  return next(req).pipe(
    tap(event => {
      if (event instanceof HttpResponse) {
        const elapsedTime = Date.now() - startTime;
        logger.logHttpResponse(
          req.method,
          req.url,
          event.status,
          event.body,
          elapsedTime
        );
      }
    }),
    catchError((error: HttpErrorResponse) => {
      const elapsedTime = Date.now() - startTime;
      logger.logHttpError(req.method, req.url, error, elapsedTime);
      
      // Log adicional para errores específicos
      if (error.status === 0) {
        logger.error(
          '🔌 Error de conectividad - Backend no responde',
          'HttpInterceptor',
          {
            url: req.url,
            method: req.method,
            message: 'No se pudo establecer conexión con el servidor',
            possibleCauses: [
              'Backend no está ejecutándose',
              'CORS mal configurado',
              'URL incorrecta',
              'Firewall bloqueando la conexión'
            ]
          }
        );
      } else if (error.status === 401) {
        logger.warn(
          '🔐 Token JWT expirado o inválido',
          'HttpInterceptor',
          {
            url: req.url,
            method: req.method,
            message: 'Se requiere autenticación'
          }
        );
      } else if (error.status === 403) {
        logger.warn(
          '⛔ Acceso denegado - Permisos insuficientes',
          'HttpInterceptor',
          {
            url: req.url,
            method: req.method,
            message: 'El usuario no tiene permisos para esta operación'
          }
        );
      } else if (error.status === 404) {
        logger.warn(
          '🔍 Endpoint no encontrado',
          'HttpInterceptor',
          {
            url: req.url,
            method: req.method,
            message: 'El endpoint solicitado no existe'
          }
        );
      } else if (error.status >= 500) {
        logger.error(
          '💥 Error interno del servidor',
          'HttpInterceptor',
          {
            url: req.url,
            method: req.method,
            status: error.status,
            message: error.error?.message || 'Error interno del servidor'
          }
        );
      }
      
      return throwError(() => error);
    }),
    finalize(() => {
      const elapsedTime = Date.now() - startTime;
      logger.debug(
        `⏱️ HTTP Request completed in ${elapsedTime}ms`,
        'HttpInterceptor',
        {
          url: req.url,
          method: req.method,
          elapsedTime
        }
      );
    })
  );
}; 