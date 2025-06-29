import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BonoService } from '../../../../bonos/application/services/bono.service';
import { CreateBonoDto } from '../../../../bonos/domain/models/bono.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LoggerService } from '../../../../shared/services/logger.service';
import { Moneda } from '../../../../bonos/domain/models/bono.model';

@Component({
  selector: 'app-crear-bono',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ReactiveFormsModule],
  templateUrl: './crear-bono.component.html',
  styleUrls: ['./crear-bono.component.css']
})
export class CrearBonoComponent implements OnInit, OnDestroy {
  bonoForm!: FormGroup;
  isLoading = false;
  error = '';
  monedas: Moneda[] = [];

  // Nueva funcionalidad de capitalización
  showCapitalizacion = false;
  tasaEfectivaCalculada = 0;

  private destroy$ = new Subject<void>();

  // Opciones para selects
  frecuenciaOpciones = [
    { valor: 1, texto: 'Anual' },
    { valor: 2, texto: 'Semestral' },
    { valor: 4, texto: 'Trimestral' },
    { valor: 12, texto: 'Mensual' }
  ];

  constructor(
    private fb: FormBuilder,
    private bonoService: BonoService,
    private router: Router,
    private logger: LoggerService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadMonedas();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.bonoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      descripcion: ['', [Validators.maxLength(500)]],
      valorNominal: [1000, [Validators.required, Validators.min(100), Validators.max(1000000)]],
      tasaCupon: [8, [Validators.required, Validators.min(0.1), Validators.max(50)]],
      plazoAnios: [5, [Validators.required, Validators.min(1), Validators.max(50)]],
      frecuenciaPagos: [1, [Validators.required, Validators.min(1), Validators.max(12)]],
      moneda: ['USD', [Validators.required]],
      fechaEmision: [this.getCurrentDate(), [Validators.required]],
      plazosGraciaTotal: [0, [Validators.min(0)]],
      plazosGraciaParcial: [0, [Validators.min(0)]],
      tasaDescuento: [8, [Validators.required, Validators.min(0.1), Validators.max(50)]],
      metodoAmortizacion: ['AMERICANO', [Validators.required]],
      
      // Nuevos campos para configuración avanzada de tasas
      tipoTasa: ['EFECTIVA', [Validators.required]],
      valorTasaInteres: [8, [Validators.required, Validators.min(0.1), Validators.max(50)]],
      frecuenciaCapitalizacion: [12, [Validators.required, Validators.min(1)]]
    });

    // Suscripciones para cálculos en tiempo real
    this.setupFormSubscriptions();
  }

  private setupFormSubscriptions(): void {
    // Escuchar cambios en el valor de la tasa para recalcular
    this.bonoForm.get('valorTasaInteres')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.showCapitalizacion) {
          this.calcularTasaEfectiva();
        }
      });

    // Escuchar cambios en la frecuencia de capitalización
    this.bonoForm.get('frecuenciaCapitalizacion')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.showCapitalizacion) {
          this.calcularTasaEfectiva();
        }
      });
  }

  onTipoTasaChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const tipoTasa = target.value;
    
    this.showCapitalizacion = tipoTasa === 'NOMINAL';
    
    if (this.showCapitalizacion) {
      // Agregar validadores para capitalización
      this.bonoForm.get('frecuenciaCapitalizacion')?.setValidators([
        Validators.required, 
        Validators.min(1)
      ]);
      this.calcularTasaEfectiva();
    } else {
      // Remover validadores y limpiar
      this.bonoForm.get('frecuenciaCapitalizacion')?.clearValidators();
      this.tasaEfectivaCalculada = 0;
    }
    
    this.bonoForm.get('frecuenciaCapitalizacion')?.updateValueAndValidity();
    
    this.logger.info('🔄 Tipo de tasa cambiado', 'CrearBonoComponent', {
      tipoTasa,
      showCapitalizacion: this.showCapitalizacion
    });
  }

  calcularTasaEfectiva(): void {
    const valorTasa = this.bonoForm.get('valorTasaInteres')?.value;
    const frecuencia = this.bonoForm.get('frecuenciaCapitalizacion')?.value;
    
    if (valorTasa && frecuencia && this.showCapitalizacion) {
      // Fórmula: TEA = (1 + TNM/m)^m - 1
      // TEA: Tasa Efectiva Anual
      // TNM: Tasa Nominal
      // m: Frecuencia de capitalización
      
      const tasaNominalDecimal = valorTasa / 100;
      const tasaEfectivaDecimal = Math.pow(1 + (tasaNominalDecimal / frecuencia), frecuencia) - 1;
      this.tasaEfectivaCalculada = tasaEfectivaDecimal * 100;
      
      this.logger.info('📊 Tasa efectiva calculada', 'CrearBonoComponent', {
        tasaNominal: valorTasa,
        frecuencia,
        tasaEfectiva: this.tasaEfectivaCalculada
      });
    }
  }

  getFrecuenciaTexto(frecuencia: number): string {
    const frecuencias: { [key: number]: string } = {
      1: 'anual',
      2: 'semestral', 
      4: 'trimestral',
      6: 'bimestral',
      12: 'mensual',
      365: 'diaria'
    };
    return frecuencias[frecuencia] || `${frecuencia} veces al año`;
  }

  getCurrentDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  onSubmit(): void {
    if (this.bonoForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
    this.error = '';

    const bonoData: CreateBonoDto = this.bonoForm.value;

    this.bonoService.createBono(bonoData).subscribe({
      next: (bono) => {
        console.log('Bono creado:', bono);
        this.router.navigate(['/emisor/bonos']);
      },
      error: (error) => {
        this.error = error.error?.message || 'Error al crear el bono';
        this.isLoading = false;
        console.error('Error:', error);
      }
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.bonoForm.controls).forEach(key => {
      const control = this.bonoForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.bonoForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.bonoForm.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors['required']) {
        return `Este campo es requerido`;
      }
      if (field.errors['minlength']) {
        return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
      }
      if (field.errors['min']) {
        return `Valor mínimo: ${field.errors['min'].min}`;
      }
      if (field.errors['max']) {
        return `Valor máximo: ${field.errors['max'].max}`;
      }
    }
    return '';
  }

  loadMonedas(): void {
    // Implement the logic to load monedas
  }

  navigateToMisBonos(): void {
    this.router.navigate(['/emisor/bonos']);
  }
} 