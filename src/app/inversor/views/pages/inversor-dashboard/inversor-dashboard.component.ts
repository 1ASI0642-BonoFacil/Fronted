import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../iam/application/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-inversor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './inversor-dashboard.component.html',
  styleUrls: ['./inversor-dashboard.component.css']
})
export class InversorDashboardComponent {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
