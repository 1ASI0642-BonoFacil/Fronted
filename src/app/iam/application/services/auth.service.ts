import { Injectable, Inject } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, catchError, switchMap, map } from 'rxjs/operators';
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
        this.logger.info('🔍 Login response from backend', 'AuthService', { 
          user: user,
          hasRoles: !!user.roles,
          rolesCount: user.roles?.length || 0
        });
        
        // PRIMERO: Guardar el token inmediatamente para que esté disponible para el interceptor
        this.currentUserSubject.next(user);
        if (user.token) {
          localStorage.setItem('token', user.token);
          localStorage.setItem('user', JSON.stringify(user));
          this.logger.info('✅ Token guardado en localStorage', 'AuthService');
        }
      }),
      switchMap(user => {
        // SEGUNDO: Ahora hacer la llamada a /me con el token ya disponible
        this.logger.info('📞 Fetching user data from /authentication/me endpoint', 'AuthService');
        
        return this.authRepository.getCurrentUserProfile().pipe(
          map(userProfile => {
            this.logger.info('✅ User profile fetched successfully', 'AuthService', { 
              userId: userProfile.id,
              username: userProfile.username,
              roles: userProfile.roles
            });
            
            // Combinar datos del login con el perfil completo
            const completeUser: User = {
              id: userProfile.id,
              username: userProfile.username,
              token: user.token, // Mantener el token del login
              roles: userProfile.roles || []
            };
            
            // Actualizar con el usuario completo (con roles)
            this.currentUserSubject.next(completeUser);
            localStorage.setItem('user', JSON.stringify(completeUser));
            this.logger.info('✅ Usuario completo con roles guardado en localStorage', 'AuthService');
            
            return completeUser; // Retornar el usuario completo
          }),
          catchError(rolesError => {
            // Si falla la obtención de roles, continuar con el usuario sin roles
            this.logger.warn('⚠️ No se pudieron obtener los roles, continuando sin roles', 'AuthService', {
              error: rolesError.message,
              status: rolesError.status
            });
            return of(user); // Retornar el usuario original sin roles
          })
        );
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
    
    if (!currentUser?.roles) {
      return false;
    }
    
    const hasRole = currentUser.roles.some(r => {
      // El backend devuelve roles como strings, no objetos
      if (typeof r === 'string') {
        return r === role;
      } else if (r && typeof r === 'object' && 'name' in r) {
        return (r as any).name === role;
      }
      return false;
    });
    
    this.logger.debug('🔍 Role check', 'AuthService', {
      searchingFor: role,
      userRoles: currentUser.roles,
      hasRole
    });
    
    return hasRole;
  }

  isEmisor(): boolean {
    const result = this.hasRole('ROLE_EMISOR');
    this.logger.debug('🎯 isEmisor check', 'AuthService', {
      result,
      currentUser: this.currentUserSubject.value?.username,
      roles: this.currentUserSubject.value?.roles || []
    });
    return result;
  }

  isInversor(): boolean {
    const result = this.hasRole('ROLE_INVERSOR');
    this.logger.debug('🎯 isInversor check', 'AuthService', {
      result,
      currentUser: this.currentUserSubject.value?.username,
      roles: this.currentUserSubject.value?.roles || []
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