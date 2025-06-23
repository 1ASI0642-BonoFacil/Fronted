import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../application/services/auth.service';
import { LoggerService } from '../../../../shared/services/logger.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm!: FormGroup;
  loading = false;
  error = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private logger: LoggerService
  ) {}

  ngOnInit(): void {
    this.logger.logComponentInit('LoginComponent', {
      url: this.router.url,
      isAuthenticated: this.authService.isAuthenticated()
    });
    
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnDestroy(): void {
    this.logger.logComponentDestroy('LoginComponent');
  }

  onSubmit(): void {
    this.logger.logUserAction('LOGIN_FORM_SUBMIT', 'LoginComponent', {
      formValid: this.loginForm.valid,
      username: this.loginForm.get('username')?.value
    });

    if (this.loginForm.invalid) {
      this.logger.warn('❌ Login form invalid', 'LoginComponent', {
        errors: this.getFormErrors()
      });
      return;
    }

    this.loading = true;
    this.error = '';
    this.logger.info('⏳ Starting login process...', 'LoginComponent');

    this.authService.signIn(this.loginForm.value).subscribe({
      next: (user) => {
        this.logger.info('✅ Login successful, checking roles...', 'LoginComponent', { 
          user: user.username,
          roles: user.roles?.map(r => {
            if (typeof r === 'string') {
              return r;
            } else if (r && typeof r === 'object' && 'name' in r) {
              return (r as any).name;
            }
            return r;
          }) || []
        });
        
        // Esperar un tick para asegurar que el usuario esté establecido en el servicio
        setTimeout(() => {
          // Determinar ruta de redirección basándose en el rol
          let targetRoute = '/home'; // Ruta por defecto
          
          if (this.authService.isEmisor()) {
            targetRoute = '/emisor/dashboard';
            this.logger.info('🎯 Usuario identificado como EMISOR', 'LoginComponent');
          } else if (this.authService.isInversor()) {
            targetRoute = '/inversor/dashboard';
            this.logger.info('🎯 Usuario identificado como INVERSOR', 'LoginComponent');
          } else {
            this.logger.warn('⚠️ Usuario sin rol específico, enviando a /home', 'LoginComponent', {
              roles: user.roles?.map(r => {
                if (typeof r === 'string') {
                  return r;
                } else if (r && typeof r === 'object' && 'name' in r) {
                  return (r as any).name;
                }
                return r;
              }) || []
            });
          }
          
          this.logger.logNavigation('/login', targetRoute, 'LoginComponent');
          this.router.navigate([targetRoute]);
        }, 100);
      },
      error: (error) => {
        this.error = error.error?.message || 'Error al iniciar sesión';
        this.loading = false;
        this.logger.error('❌ Login failed', 'LoginComponent', {
          error: this.error,
          status: error.status,
          username: this.loginForm.get('username')?.value
        });
      }
    });
  }

  private getFormErrors(): any {
    const errors: any = {};
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      if (control && control.errors) {
        errors[key] = control.errors;
      }
    });
    return errors;
  }
} 