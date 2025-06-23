import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BonoService } from '../../../../bonos/application/services/bono.service';
import { Bono } from '../../../../bonos/domain/models/bono.model';

@Component({
  selector: 'app-mis-bonos',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './mis-bonos.component.html',
  styleUrls: ['./mis-bonos.component.css']
})
export class MisBonosComponent implements OnInit {
  bonos: Bono[] = [];
  loading = true;
  error = '';

  constructor(private bonoService: BonoService) {}

  ngOnInit(): void {
    this.loadBonos();
  }

  loadBonos(): void {
    this.loading = true;
    this.bonoService.getMisBonos().subscribe({
      next: (bonos) => {
        this.bonos = bonos;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar los bonos';
        this.loading = false;
        console.error('Error:', error);
      }
    });
  }

  deleteBono(id: number): void {
    if (confirm('¿Está seguro de que desea eliminar este bono?')) {
      this.bonoService.deleteBono(id).subscribe({
        next: () => {
          this.bonos = this.bonos.filter(b => b.id !== id);
        },
        error: (error) => {
          this.error = 'Error al eliminar el bono';
          console.error('Error:', error);
        }
      });
    }
  }

  trackByBonoId(index: number, bono: Bono): number {
    return bono.id;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatPercent(rate: number): string {
    return `${rate}%`;
  }
} 