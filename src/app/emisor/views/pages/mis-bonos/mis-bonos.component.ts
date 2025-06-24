import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BonoService } from '../../../../bonos/application/services/bono.service';
import { Bono } from '../../../../bonos/domain/models/bono.model';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

interface BonoStats {
  totalBonos: number;
  valorTotal: number;
  promedioTasa: number;
  proximoVencimiento: Date | null;
  bonosActivos: number;
  rentabilidadTotal: number;
}

interface ViewMode {
  type: 'grid' | 'list';
  icon: string;
  label: string;
}

interface FilterState {
  searchTerm: string;
  moneda: string;
  plazoMin: number | null;
  plazoMax: number | null;
  tasaMin: number | null;
  tasaMax: number | null;
  sortBy: 'nombre' | 'valorNominal' | 'tasaCupon' | 'fechaEmision';
  sortOrder: 'asc' | 'desc';
}

@Component({
  selector: 'app-mis-bonos',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './mis-bonos.component.html',
  styleUrls: ['./mis-bonos.component.css']
})
export class MisBonosComponent implements OnInit, OnDestroy {
  // Data
  bonos: Bono[] = [];
  filteredBonos: Bono[] = [];
  selectedBonos: Set<number> = new Set();
  
  // UI State
  loading = true;
  error = '';
  showFilters = false;
  showExportOptions = false;
  currentView: ViewMode['type'] = 'grid';
  
  // Search & Filters
  searchTerm = '';
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();
  
  filterState: FilterState = {
    searchTerm: '',
    moneda: '',
    plazoMin: null,
    plazoMax: null,
    tasaMin: null,
    tasaMax: null,
    sortBy: 'fechaEmision',
    sortOrder: 'desc'
  };
  
  // View modes
  viewModes: ViewMode[] = [
    { type: 'grid', icon: '🎯', label: 'Tarjetas' },
    { type: 'list', icon: '📋', label: 'Lista' }
  ];
  
  // Stats
  stats: BonoStats = {
    totalBonos: 0,
    valorTotal: 0,
    promedioTasa: 0,
    proximoVencimiento: null,
    bonosActivos: 0,
    rentabilidadTotal: 0
  };
  
  // Available currencies for filter
  availableCurrencies: string[] = [];
  
  // Animation states
  cardAnimationDelay = 0;
  
  constructor(private bonoService: BonoService) {
    this.setupSearch();
  }

  ngOnInit(): void {
    this.loadBonos();
    this.loadUserPreferences();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSearch(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(term => {
      this.filterState.searchTerm = term;
      this.applyFilters();
    });
  }

  private loadUserPreferences(): void {
    const savedView = localStorage.getItem('emisor-bonos-view');
    if (savedView && ['grid', 'list'].includes(savedView)) {
      this.currentView = savedView as ViewMode['type'];
    }
  }

  private saveUserPreferences(): void {
    localStorage.setItem('emisor-bonos-view', this.currentView);
  }

  loadBonos(): void {
    this.loading = true;
    this.error = '';
    
    this.bonoService.getMisBonos().subscribe({
      next: (bonos) => {
        this.bonos = bonos;
        this.filteredBonos = [...bonos];
        this.updateStats();
        this.extractAvailableCurrencies();
        this.applyFilters();
        this.loading = false;
        this.animateCards();
      },
      error: (error) => {
        this.error = 'Error al cargar los bonos. Intenta nuevamente.';
        this.loading = false;
        console.error('Error loading bonos:', error);
      }
    });
  }

  private updateStats(): void {
    if (this.bonos.length === 0) {
      this.stats = {
        totalBonos: 0,
        valorTotal: 0,
        promedioTasa: 0,
        proximoVencimiento: null,
        bonosActivos: 0,
        rentabilidadTotal: 0
      };
      return;
    }

    const now = new Date();
    const bonosActivos = this.bonos.filter(b => {
      const fechaVencimiento = new Date(b.fechaEmision);
      fechaVencimiento.setFullYear(fechaVencimiento.getFullYear() + b.plazoAnios);
      return fechaVencimiento > now;
    });

    this.stats = {
      totalBonos: this.bonos.length,
      valorTotal: this.bonos.reduce((sum, b) => sum + b.valorNominal, 0),
      promedioTasa: this.bonos.reduce((sum, b) => sum + b.tasaCupon, 0) / this.bonos.length,
      proximoVencimiento: this.getProximoVencimiento(),
      bonosActivos: bonosActivos.length,
      rentabilidadTotal: this.calcularRentabilidadTotal()
    };
  }

  private getProximoVencimiento(): Date | null {
    const now = new Date();
    const vencimientos = this.bonos
      .map(b => {
        const fecha = new Date(b.fechaEmision);
        fecha.setFullYear(fecha.getFullYear() + b.plazoAnios);
        return fecha;
      })
      .filter(fecha => fecha > now)
      .sort((a, b) => a.getTime() - b.getTime());

    return vencimientos.length > 0 ? vencimientos[0] : null;
  }

  private calcularRentabilidadTotal(): number {
    return this.bonos.reduce((total, bono) => {
      const rentabilidadAnual = (bono.valorNominal * bono.tasaCupon / 100) * bono.plazoAnios;
      return total + rentabilidadAnual;
    }, 0);
  }

  private extractAvailableCurrencies(): void {
    const currencies = new Set<string>();
    this.bonos.forEach(bono => {
      if (bono.moneda?.codigo) {
        currencies.add(bono.moneda.codigo);
      }
    });
    this.availableCurrencies = Array.from(currencies).sort();
  }

  private animateCards(): void {
    this.cardAnimationDelay = 0;
    this.filteredBonos.forEach((_, index) => {
      setTimeout(() => {
        const card = document.querySelector(`.bono-card[data-index="${index}"]`);
        if (card) {
          card.classList.add('animate-in');
        }
      }, index * 100);
    });
  }

  onSearchChange(term: string): void {
    this.searchSubject.next(term);
  }

  applyFilters(): void {
    let filtered = [...this.bonos];

    // Text search
    if (this.filterState.searchTerm) {
      const term = this.filterState.searchTerm.toLowerCase();
      filtered = filtered.filter(bono =>
        bono.nombre.toLowerCase().includes(term) ||
        (bono.descripcion && bono.descripcion.toLowerCase().includes(term))
      );
    }

    // Currency filter
    if (this.filterState.moneda) {
      filtered = filtered.filter(bono => 
        bono.moneda?.codigo === this.filterState.moneda
      );
    }

    // Plazo filters
    if (this.filterState.plazoMin !== null) {
      filtered = filtered.filter(bono => bono.plazoAnios >= this.filterState.plazoMin!);
    }
    if (this.filterState.plazoMax !== null) {
      filtered = filtered.filter(bono => bono.plazoAnios <= this.filterState.plazoMax!);
    }

    // Tasa filters
    if (this.filterState.tasaMin !== null) {
      filtered = filtered.filter(bono => bono.tasaCupon >= this.filterState.tasaMin!);
    }
    if (this.filterState.tasaMax !== null) {
      filtered = filtered.filter(bono => bono.tasaCupon <= this.filterState.tasaMax!);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (this.filterState.sortBy) {
        case 'nombre':
          aValue = a.nombre.toLowerCase();
          bValue = b.nombre.toLowerCase();
          break;
        case 'valorNominal':
          aValue = a.valorNominal;
          bValue = b.valorNominal;
          break;
        case 'tasaCupon':
          aValue = a.tasaCupon;
          bValue = b.tasaCupon;
          break;
        case 'fechaEmision':
          aValue = new Date(a.fechaEmision).getTime();
          bValue = new Date(b.fechaEmision).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return this.filterState.sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.filterState.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    this.filteredBonos = filtered;
    this.animateCards();
  }

  clearFilters(): void {
    this.filterState = {
      searchTerm: '',
      moneda: '',
      plazoMin: null,
      plazoMax: null,
      tasaMin: null,
      tasaMax: null,
      sortBy: 'fechaEmision',
      sortOrder: 'desc'
    };
    this.searchTerm = '';
    this.applyFilters();
  }

  changeView(viewType: ViewMode['type']): void {
    this.currentView = viewType;
    this.saveUserPreferences();
    
    // Add transition animation
    const container = document.querySelector('.bonos-container');
    if (container) {
      container.classList.add('view-changing');
      setTimeout(() => {
        container.classList.remove('view-changing');
      }, 300);
    }
  }

  toggleBonoSelection(bonoId: number): void {
    if (this.selectedBonos.has(bonoId)) {
      this.selectedBonos.delete(bonoId);
    } else {
      this.selectedBonos.add(bonoId);
    }
  }

  selectAllBonos(): void {
    if (this.selectedBonos.size === this.filteredBonos.length) {
      this.selectedBonos.clear();
    } else {
      this.filteredBonos.forEach(bono => this.selectedBonos.add(bono.id));
    }
  }

  deleteBono(id: number): void {
    const bono = this.bonos.find(b => b.id === id);
    if (!bono) return;

    if (confirm(`¿Estás seguro de eliminar "${bono.nombre}"? Esta acción no se puede deshacer.`)) {
      this.bonoService.deleteBono(id).subscribe({
        next: () => {
          this.bonos = this.bonos.filter(b => b.id !== id);
          this.filteredBonos = this.filteredBonos.filter(b => b.id !== id);
          this.selectedBonos.delete(id);
          this.updateStats();
          this.showNotification('Bono eliminado exitosamente', 'success');
        },
        error: (error) => {
          this.error = 'Error al eliminar el bono';
          this.showNotification('Error al eliminar el bono', 'error');
          console.error('Error:', error);
        }
      });
    }
  }

  deleteSelectedBonos(): void {
    if (this.selectedBonos.size === 0) return;

    const count = this.selectedBonos.size;
    if (confirm(`¿Estás seguro de eliminar ${count} bono(s) seleccionado(s)?`)) {
      const deletePromises = Array.from(this.selectedBonos).map(id =>
        this.bonoService.deleteBono(id).toPromise()
      );

      Promise.all(deletePromises).then(() => {
        this.loadBonos();
        this.selectedBonos.clear();
        this.showNotification(`${count} bono(s) eliminado(s) exitosamente`, 'success');
      }).catch(error => {
        this.showNotification('Error al eliminar algunos bonos', 'error');
        console.error('Error:', error);
      });
    }
  }

  exportBonos(format: 'csv' | 'excel'): void {
    const data = this.selectedBonos.size > 0 
      ? this.bonos.filter(b => this.selectedBonos.has(b.id))
      : this.filteredBonos;

    // Implementation for export functionality
    this.showNotification(`Exportando ${data.length} bono(s) en formato ${format.toUpperCase()}`, 'info');
    // TODO: Implement actual export logic
  }

  private showNotification(message: string, type: 'success' | 'error' | 'info'): void {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  trackByBonoId(index: number, bono: Bono): number {
    return bono.id;
  }

  formatCurrency(amount: number, currency?: string): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  formatPercent(rate: number): string {
    return `${rate.toFixed(2)}%`;
  }

  formatDate(date: string | Date): string {
    return new Intl.DateTimeFormat('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(date));
  }

  getBonoStatus(bono: Bono): { status: string; label: string; color: string } {
    const now = new Date();
    const fechaVencimiento = new Date(bono.fechaEmision);
    fechaVencimiento.setFullYear(fechaVencimiento.getFullYear() + bono.plazoAnios);
    
    const diasRestantes = Math.ceil((fechaVencimiento.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diasRestantes < 0) {
      return { status: 'matured', label: 'Vencido', color: '#dc3545' };
    } else if (diasRestantes <= 30) {
      return { status: 'pending', label: 'Próximo a vencer', color: '#f57c00' };
    } else {
      return { status: 'active', label: 'Activo', color: '#2e7d32' };
    }
  }

  getDaysToMaturity(bono: Bono): number {
    const now = new Date();
    const fechaVencimiento = new Date(bono.fechaEmision);
    fechaVencimiento.setFullYear(fechaVencimiento.getFullYear() + bono.plazoAnios);
    return Math.ceil((fechaVencimiento.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }

  getProgressPercentage(bono: Bono): number {
    const now = new Date();
    const fechaInicio = new Date(bono.fechaEmision);
    const fechaVencimiento = new Date(bono.fechaEmision);
    fechaVencimiento.setFullYear(fechaVencimiento.getFullYear() + bono.plazoAnios);
    
    const totalDuration = fechaVencimiento.getTime() - fechaInicio.getTime();
    const elapsed = now.getTime() - fechaInicio.getTime();
    
    return Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);
  }


} 