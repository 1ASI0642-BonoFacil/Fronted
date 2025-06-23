import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-mis-calculos',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container">
      <h1>Mis CÃ¡lculos</h1>
      <p>Historial de cÃ¡lculos - En construcciÃ³n</p>
      <a routerLink="/inversor/dashboard">Volver al Dashboard</a>
    </div>
  `,
  styles: [`
    .container {
      padding: 20px;
    }
  `]
})
export class MisCalculosComponent {}
