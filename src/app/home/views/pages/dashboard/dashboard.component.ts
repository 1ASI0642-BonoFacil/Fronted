import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../../iam/application/services/auth.service';
import { User } from '../../../../iam/domain/models/user.model';

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
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.isEmisor = this.authService.isEmisor();
    this.isInversor = this.authService.isInversor();

    // Redirigir según el rol si acceden al dashboard general
    if (this.isEmisor) {
      this.router.navigate(['/emisor/dashboard']);
    } else if (this.isInversor) {
      this.router.navigate(['/inversor/dashboard']);
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
} 