import { Injectable, Inject } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { User, SignUpData, Credentials } from '../../domain/models/user.model';
import { AuthRepositoryPort } from '../../domain/ports/auth.repository.port';
import { AUTH_REPOSITORY_TOKEN } from '../../../core/infrastructure/providers/auth.providers';
import { LoggerService } from '../../../shared/services/logger.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    @Inject(AUTH_REPOSITORY_TOKEN) private authRepository: AuthRepositoryPort,
    private logger: LoggerService
  ) {
    this.logger.logComponentInit('AuthService', { 
      hasStoredUser: !!localStorage.getItem('user'),
      hasStoredToken: !!localStorage.getItem('token')
    });
    // Verificar si hay un usuario almacenado al iniciar
    this.checkStoredUser();
  }

  signUp(signUpData: SignUpData): Observable<User> {
    this.logger.logUserAction('SIGN_UP_ATTEMPT', 'AuthService', { 
      username: signUpData.username,
      roles: signUpData.roles 
    });
    
    return this.authRepository.signUp(signUpData).pipe(
      tap(user => {
        this.logger.logAuth('SIGN_UP', true, user, 'AuthService');
        this.currentUserSubject.next(user);
        if (user.token) {
          localStorage.setItem('token', user.token);
          localStorage.setItem('user', JSON.stringify(user));
          this.logger.info('✅ Token y usuario guardados en localStorage', 'AuthService');
        }
      }),
      catchError(error => {
        this.logger.logAuth('SIGN_UP', false, { username: signUpData.username, error }, 'AuthService');
        return throwError(() => error);
      })
    );
  }

  signIn(credentials: Credentials): Observable<User> {
    this.logger.logUserAction('SIGN_IN_ATTEMPT', 'AuthService', { 
      username: credentials.username 
    });
    
    return this.authRepository.signIn(credentials).pipe(
      tap(user => {
        this.logger.logAuth('SIGN_IN', true, user, 'AuthService');
        this.currentUserSubject.next(user);
        if (user.token) {
          localStorage.setItem('token', user.token);
          localStorage.setItem('user', JSON.stringify(user));
          this.logger.info('✅ Token y usuario guardados en localStorage', 'AuthService');
        }
      }),
      catchError(error => {
        this.logger.logAuth('SIGN_IN', false, { username: credentials.username, error }, 'AuthService');
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    this.logger.logUserAction('LOGOUT', 'AuthService', { 
      user: this.currentUserSubject.value?.username 
    });
    this.authRepository.logout();
    this.currentUserSubject.next(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.logger.info('🚪 Usuario desconectado y datos limpiados', 'AuthService');
  }

  isAuthenticated(): boolean {
    return this.authRepository.isAuthenticated();
  }

  getToken(): string | null {
    return this.authRepository.getStoredToken();
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getUserRole(): string | null {
    return this.authRepository.getUserRole();
  }

  hasRole(role: string): boolean {
    const currentUser = this.currentUserSubject.value;
    const hasRole = currentUser?.roles?.some(r => r.name === role) || false;
    this.logger.debug('🔍 Checking role', 'AuthService', {
      searchingFor: role,
      userRoles: currentUser?.roles?.map(r => r.name) || [],
      hasRole
    });
    return hasRole;
  }

  isEmisor(): boolean {
    const result = this.hasRole('ROLE_EMISOR');
    this.logger.debug('🎯 isEmisor check', 'AuthService', {
      result,
      currentUser: this.currentUserSubject.value?.username,
      roles: this.currentUserSubject.value?.roles?.map(r => r.name) || []
    });
    return result;
  }

  isInversor(): boolean {
    const result = this.hasRole('ROLE_INVERSIONISTA');
    this.logger.debug('🎯 isInversor check', 'AuthService', {
      result,
      currentUser: this.currentUserSubject.value?.username,
      roles: this.currentUserSubject.value?.roles?.map(r => r.name) || []
    });
    return result;
  }

  private checkStoredUser(): void {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        this.currentUserSubject.next(user);
        this.logger.info('👤 Usuario restaurado desde localStorage', 'AuthService', { 
          username: user.username,
          roles: user.roles?.map((r: any) => r.name) 
        });
      } catch (error) {
        this.logger.error('❌ Error parsing stored user', 'AuthService', { error });
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    } else {
      this.logger.info('👻 No hay usuario almacenado en localStorage', 'AuthService');
    }
  }
} 