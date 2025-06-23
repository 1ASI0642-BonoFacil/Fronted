import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../application/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  error = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.signIn(this.loginForm.value).subscribe({
      next: (user) => {
        // Redirigir según el rol del usuario
        if (this.authService.isEmisor()) {
          this.router.navigate(['/emisor/dashboard']);
        } else if (this.authService.isInversor()) {
          this.router.navigate(['/inversor/dashboard']);
        } else {
          this.router.navigate(['/home']);
        }
      },
      error: (error) => {
        this.error = error.error?.message || 'Error al iniciar sesión';
        this.loading = false;
      }
    });
  }
} 