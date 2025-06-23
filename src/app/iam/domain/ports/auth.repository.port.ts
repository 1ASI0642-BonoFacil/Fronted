import { Observable } from 'rxjs';
import { User, SignUpData, Credentials } from '../models/user.model';

// Puerto de salida - Define cómo el dominio se comunica con la infraestructura
export interface AuthRepositoryPort {
  signUp(signUpData: SignUpData): Observable<User>;
  signIn(credentials: Credentials): Observable<User>;
  getCurrentUser(): Observable<User | null>;
  getCurrentUserProfile(): Observable<User>;
  logout(): void;
  isAuthenticated(): boolean;
  getStoredToken(): string | null;
  getUserRole(): string | null;
} 