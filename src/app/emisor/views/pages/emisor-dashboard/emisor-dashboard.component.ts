import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../iam/application/services/auth.service';
import { BonoService } from '../../../../bonos/application/services/bono.service';
import { User } from '../../../../iam/domain/models/user.model';
import { Bono } from '../../../../bonos/domain/models/bono.model';

@Component({
  selector: 'app-emisor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './emisor-dashboard.component.html',
  styleUrls: ['./emisor-dashboard.component.css']
})
export class EmisorDashboardComponent implements OnInit {
  currentUser: User | null = null;
  totalBonos = 0;
  bonosActivos = 0;
  montoTotalEmitido = 0;
  loading = true;

  constructor(
    private authService: AuthService,
    private bonoService: BonoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadEstadisticas();
  }

  loadEstadisticas(): void {
    this.loading = true;
    this.bonoService.getMisBonos().subscribe({
      next: (bonos) => {
        this.calculateEstadisticas(bonos);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar estadísticas:', error);
        this.loading = false;
      }
    });
  }

  private calculateEstadisticas(bonos: Bono[]): void {
    this.totalBonos = bonos.length;
    this.bonosActivos = bonos.length; // Por ahora todos los bonos están activos
    this.montoTotalEmitido = bonos.reduce((total, bono) => total + bono.valorNominal, 0);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
} 