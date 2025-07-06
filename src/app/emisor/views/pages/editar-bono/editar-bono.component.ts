import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BonoService } from '../../../../bonos/application/services/bono.service';
import { CreateBonoDto, Bono, Moneda } from '../../../../bonos/domain/models/bono.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LoggerService } from '../../../../shared/services/logger.service';

@Component({
  selector: 'app-editar-bono',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ReactiveFormsModule],
  templateUrl: './editar-bono.component.html',
  styleUrls: ['./editar-bono.component.css']
})
export class EditarBonoComponent implements OnInit, OnDestroy {
  bonoForm!: FormGroup;
  isLoading = false;
  loadingBono = false;
  error = '';
  bonoId: number = 0;
  bonoActual: Bono | null = null;
  monedas: Moneda[] = [];

  // Funcionalidad de capitalización
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
    private route: ActivatedRoute,
    private logger: LoggerService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadMonedas();
    
    // Obtener el ID del bono de la URL
    this.route.params.subscribe(params => {
      this.bonoId = +params['id'];
      if (this.bonoId) {
        this.loadBonoData();
      } else {
        this.error = 'ID de bono no válido';
      }
    });
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
      
      // Campos para configuración avanzada de tasas
      tipoTasa: ['EFECTIVA', [Validators.required]],
      valorTasaInteres: [8, [Validators.required, Validators.min(0.1), Validators.max(50)]],
      frecuenciaCapitalizacion: [12, [Validators.required, Validators.min(1)]]
    });

    // Suscripciones para cálculos en tiempo real
    this.setupFormSubscriptions();
  }

  private loadBonoData(): void {
    this.loadingBono = true;
    this.error = '';
    
    this.bonoService.getMiBono(this.bonoId).subscribe({
      next: (bono) => {
        this.bonoActual = bono;
        this.updateFormWithBonoData(bono);
        this.loadingBono = false;
        this.logger.info('✅ Datos del bono cargados', 'EditarBonoComponent', { 
          bonoId: this.bonoId, 
          nombre: bono.nombre 
        });
      },
      error: (error) => {
        this.error = 'Error al cargar los datos del bono: ' + (error.error?.message || error.message || 'Error desconocido');
        this.loadingBono = false;
        this.logger.error('❌ Error al cargar datos del bono', 'EditarBonoComponent', { 
          bonoId: this.bonoId, 
          error 
        });
      }
    });
  }

  private updateFormWithBonoData(bono: Bono): void {
    // Actualizar el formulario con los datos del bono
    this.bonoForm.patchValue({
      nombre: bono.nombre,
      descripcion: bono.descripcion,
      valorNominal: bono.valorNominal,
      tasaCupon: bono.tasaCupon,
      plazoAnios: bono.plazoAnios,
      frecuenciaPagos: bono.frecuenciaPagos,
      moneda: bono.moneda?.codigo || 'USD',
      fechaEmision: this.formatDate(bono.fechaEmision),
      plazosGraciaTotal: bono.plazoGracia?.tipo === 'TOTAL' ? bono.plazoGracia.periodos : 0,
      plazosGraciaParcial: bono.plazoGracia?.tipo === 'PARCIAL' ? bono.plazoGracia.periodos : 0,
      tasaDescuento: bono.tasaDescuento,
      metodoAmortizacion: bono.metodoAmortizacion,
      
      // Configuración de tasas
      tipoTasa: bono.tasaInteres?.tipo || 'EFECTIVA',
      valorTasaInteres: bono.tasaInteres?.valor || bono.tasaCupon,
      frecuenciaCapitalizacion: bono.tasaInteres?.frecuenciaCapitalizacion || 12
    });

    // Verificar si debe mostrar la sección de capitalización
    this.showCapitalizacion = bono.tasaInteres?.tipo === 'NOMINAL';
    if (this.showCapitalizacion) {
      this.calcularTasaEfectiva();
    }
  }

  private formatDate(dateString: string): string {
    if (!dateString) return this.getCurrentDate();
    
    try {
      // Convertir la fecha a formato YYYY-MM-DD para el input date
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch (error) {
      return this.getCurrentDate();
    }
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
    
    this.logger.info('🔄 Tipo de tasa cambiado', 'EditarBonoComponent', {
      tipoTasa,
      showCapitalizacion: this.showCapitalizacion
    });
  }

  calcularTasaEfectiva(): void {
    const valorTasa = this.bonoForm.get('valorTasaInteres')?.value;
    const frecuencia = this.bonoForm.get('frecuenciaCapitalizacion')?.value;
    
    if (valorTasa && frecuencia && this.showCapitalizacion) {
      // Fórmula: TEA = (1 + TNM/m)^m - 1
      const tasaNominalDecimal = valorTasa / 100;
      const tasaEfectivaDecimal = Math.pow(1 + (tasaNominalDecimal / frecuencia), frecuencia) - 1;
      this.tasaEfectivaCalculada = tasaEfectivaDecimal * 100;
      
      this.logger.info('📊 Tasa efectiva calculada', 'EditarBonoComponent', {
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

    this.bonoService.updateBono(this.bonoId, bonoData).subscribe({
      next: (bono) => {
        this.logger.info('✅ Bono actualizado correctamente', 'EditarBonoComponent', { 
          bonoId: this.bonoId,
          nombre: bono.nombre
        });
        this.router.navigate(['/emisor/bonos']);
      },
      error: (error) => {
        this.error = error.error?.message || 'Error al actualizar el bono';
        this.isLoading = false;
        this.logger.error('❌ Error al actualizar bono', 'EditarBonoComponent', { 
          bonoId: this.bonoId,
          error
        });
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
    // Implementar la carga de monedas (igual que en crear-bono)
    this.monedas = [
      { codigo: 'USD', nombre: 'Dólar Estadounidense', simbolo: '$' },
      { codigo: 'PEN', nombre: 'Sol Peruano', simbolo: 'S/' },
      { codigo: 'EUR', nombre: 'Euro', simbolo: '€' }
    ];
  }

  navigateToMisBonos(): void {
    this.router.navigate(['/emisor/bonos']);
  }
} 