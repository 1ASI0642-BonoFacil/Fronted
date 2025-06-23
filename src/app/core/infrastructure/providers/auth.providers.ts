import { Provider, InjectionToken } from '@angular/core';
import { AuthRepositoryPort } from '../../../iam/domain/ports/auth.repository.port';
import { AuthApiAdapter } from '../../../iam/infrastructure/adapters/auth.api.adapter';

// Token de inyección para el repositorio de autenticación
export const AUTH_REPOSITORY_TOKEN = new InjectionToken<AuthRepositoryPort>('AuthRepositoryPort');

export const authProviders: Provider[] = [
  {
    provide: AUTH_REPOSITORY_TOKEN,
    useClass: AuthApiAdapter
  }
]; 