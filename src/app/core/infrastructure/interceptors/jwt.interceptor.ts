import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../../iam/application/services/auth.service';
import { LoggerService } from '../../../shared/services/logger.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const logger = inject(LoggerService);
  const token = authService.getToken();

  logger.debug('🔐 JWT Interceptor - Checking token', 'JWTInterceptor', {
    url: req.url,
    hasToken: !!token,
    tokenFromLocalStorage: !!localStorage.getItem('token'),
    tokenValue: token ? `${token.substring(0, 20)}...` : null
  });

  if (token) {
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    logger.debug('🔑 JWT Interceptor - Adding token to request', 'JWTInterceptor', {
      url: req.url,
      authHeader: `Bearer ${token.substring(0, 20)}...`
    });
    return next(clonedRequest);
  }

  logger.debug('⚠️ JWT Interceptor - No token available', 'JWTInterceptor', {
    url: req.url
  });
  return next(req);
}; 