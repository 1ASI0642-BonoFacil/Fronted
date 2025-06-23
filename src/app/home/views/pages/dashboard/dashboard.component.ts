import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../../iam/application/services/auth.service';
import { User } from '../../../../iam/domain/models/user.model';
import { LoggerService } from '../../../../shared/services/logger.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  isEmisor = false;
  isInversor = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private logger: LoggerService
  ) {
    this.logger.logComponentInit('DashboardComponent', {});
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.isEmisor = this.authService.isEmisor();
    this.isInversor = this.authService.isInversor();

    // Logging detallado para diagnosticar el problema
    this.logger.info('🔍 Dashboard - Información del usuario', 'DashboardComponent', {
      currentUser: this.currentUser,
      roles: this.currentUser?.roles,
      roleNames: this.currentUser?.roles?.map(r => {
        if (typeof r === 'string') {
          return r;
        } else if (r && typeof r === 'object' && 'name' in r) {
          return (r as any).name;
        }
        return r;
      }),
      isEmisor: this.isEmisor,
      isInversor: this.isInversor,
      isAuthenticated: this.authService.isAuthenticated()
    });

    // Redirigir según el rol si acceden al dashboard general
    if (this.isEmisor) {
      this.logger.logNavigation('/home', '/emisor/dashboard', 'DashboardComponent');
      this.router.navigate(['/emisor/dashboard']);
    } else if (this.isInversor) {
      this.logger.logNavigation('/home', '/inversor/dashboard', 'DashboardComponent');
      this.router.navigate(['/inversor/dashboard']);
    } else {
      this.logger.warn('⚠️ Usuario sin rol específico, permanece en /home', 'DashboardComponent', {
        user: this.currentUser,
        roles: this.currentUser?.roles
      });
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
} 