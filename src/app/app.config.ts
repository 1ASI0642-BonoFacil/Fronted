import { ApplicationConfig, provideZoneChangeDetection, ErrorHandler } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authProviders } from './core/infrastructure/providers/auth.providers';
import { bonoProviders } from './core/infrastructure/providers/bono.providers';
import { managementProviders } from './core/infrastructure/providers/management.providers';
import { jwtInterceptor } from './core/infrastructure/interceptors/jwt.interceptor';
import { loggingInterceptor } from './core/infrastructure/interceptors/logging.interceptor';
import { GlobalErrorHandler } from './core/infrastructure/error-handlers/global-error.handler';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withHashLocation()),
    provideHttpClient(
      withInterceptors([jwtInterceptor, loggingInterceptor])
    ),
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler
    },
    ...authProviders,
    ...bonoProviders,
    ...managementProviders
  ]
};
