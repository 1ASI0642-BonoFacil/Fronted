import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authProviders } from './core/infrastructure/providers/auth.providers';
import { bonoProviders } from './core/infrastructure/providers/bono.providers';
import { managementProviders } from './core/infrastructure/providers/management.providers';
import { jwtInterceptor } from './core/infrastructure/interceptors/jwt.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([jwtInterceptor])
    ),
    ...authProviders,
    ...bonoProviders,
    ...managementProviders
  ]
};
