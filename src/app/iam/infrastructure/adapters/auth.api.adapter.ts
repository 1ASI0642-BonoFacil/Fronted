import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthRepositoryPort } from '../../domain/ports/auth.repository.port';
import { User, SignUpData, Credentials } from '../../domain/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthApiAdapter implements AuthRepositoryPort {
  private readonly apiUrl = `${environment.apiUrl}/api/v1/authentication`;

  constructor(private http: HttpClient) {}

  signUp(signUpData: SignUpData): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/sign-up`, signUpData);
  }

  signIn(credentials: Credentials): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/sign-in`, credentials);
  }

  getCurrentUser(): Observable<User | null> {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return new Observable(observer => {
          observer.next(JSON.parse(userStr));
          observer.complete();
        });
      } catch {
        return new Observable(observer => {
          observer.next(null);
          observer.complete();
        });
      }
    }
    return new Observable(observer => {
      observer.next(null);
      observer.complete();
    });
  }

  logout(): void {
    // En este caso, el logout es solo del lado del cliente
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  isAuthenticated(): boolean {
    return !!this.getStoredToken();
  }

  getStoredToken(): string | null {
    return localStorage.getItem('token');
  }

  getUserRole(): string | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.roles?.[0]?.name || null;
      } catch {
        return null;
      }
    }
    return null;
  }
} 