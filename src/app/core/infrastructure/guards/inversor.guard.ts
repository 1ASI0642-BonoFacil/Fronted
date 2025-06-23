import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../../iam/application/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class InversorGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (this.authService.isAuthenticated() && this.authService.isInversor()) {
      return true;
    }
    
    // Redirigir al home si no es inversor
    return this.router.createUrlTree(['/home']);
  }
} 