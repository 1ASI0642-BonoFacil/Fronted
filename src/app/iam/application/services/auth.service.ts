import { Injectable, Inject } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { User, SignUpData, Credentials } from '../../domain/models/user.model';
import { AuthRepositoryPort } from '../../domain/ports/auth.repository.port';
import { AUTH_REPOSITORY_TOKEN } from '../../../core/infrastructure/providers/auth.providers';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(@Inject(AUTH_REPOSITORY_TOKEN) private authRepository: AuthRepositoryPort) {
    // Verificar si hay un usuario almacenado al iniciar
    this.checkStoredUser();
  }

  signUp(signUpData: SignUpData): Observable<User> {
    return this.authRepository.signUp(signUpData).pipe(
      tap(user => {
        this.currentUserSubject.next(user);
        if (user.token) {
          localStorage.setItem('token', user.token);
          localStorage.setItem('user', JSON.stringify(user));
        }
      })
    );
  }

  signIn(credentials: Credentials): Observable<User> {
    return this.authRepository.signIn(credentials).pipe(
      tap(user => {
        this.currentUserSubject.next(user);
        if (user.token) {
          localStorage.setItem('token', user.token);
          localStorage.setItem('user', JSON.stringify(user));
        }
      })
    );
  }

  logout(): void {
    this.authRepository.logout();
    this.currentUserSubject.next(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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
    return currentUser?.roles?.some(r => r.name === role) || false;
  }

  isEmisor(): boolean {
    return this.hasRole('ROLE_EMISOR');
  }

  isInversor(): boolean {
    return this.hasRole('ROLE_INVERSIONISTA');
  }

  private checkStoredUser(): void {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    }
  }
} 