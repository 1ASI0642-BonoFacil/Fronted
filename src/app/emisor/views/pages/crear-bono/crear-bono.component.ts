import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BonoService } from '../../../../bonos/application/services/bono.service';
import { CreateBonoDto } from '../../../../bonos/domain/models/bono.model';

@Component({
  selector: 'app-crear-bono',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ReactiveFormsModule],
  templateUrl: './crear-bono.component.html',
  styleUrls: ['./crear-bono.component.css']
})
export class CrearBonoComponent implements OnInit {
  bonoForm!: FormGroup;
  loading = false;
  error = '';

  // Opciones para selects
  monedas = [
    { codigo: 'USD', nombre: 'Dólar Americano' },
    { codigo: 'EUR', nombre: 'Euro' },
    { codigo: 'PEN', nombre: 'Sol Peruano' }
  ];

  frecuenciaOpciones = [
    { valor: 1, texto: 'Anual' },
    { valor: 2, texto: 'Semestral' },
    { valor: 4, texto: 'Trimestral' },
    { valor: 12, texto: 'Mensual' }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private bonoService: BonoService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.bonoForm = this.formBuilder.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['', [Validators.required, Validators.minLength(10)]],
      valorNominal: [1000, [Validators.required, Validators.min(100)]],
      tasaCupon: [8, [Validators.required, Validators.min(0.1), Validators.max(50)]],
      plazoAnios: [5, [Validators.required, Validators.min(1), Validators.max(30)]],
      frecuenciaPagos: [2, [Validators.required]],
      moneda: ['USD', [Validators.required]],
      fechaEmision: [this.getCurrentDate(), [Validators.required]],
      plazosGraciaTotal: [0, [Validators.min(0)]],
      plazosGraciaParcial: [0, [Validators.min(0)]],
      tasaDescuento: [8, [Validators.required, Validators.min(0.1), Validators.max(50)]],
      metodoAmortizacion: ['AMERICANO', [Validators.required]]
    });
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

    this.loading = true;
    this.error = '';

    const bonoData: CreateBonoDto = this.bonoForm.value;

    this.bonoService.createBono(bonoData).subscribe({
      next: (bono) => {
        console.log('Bono creado:', bono);
        this.router.navigate(['/emisor/bonos']);
      },
      error: (error) => {
        this.error = error.error?.message || 'Error al crear el bono';
        this.loading = false;
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
} 