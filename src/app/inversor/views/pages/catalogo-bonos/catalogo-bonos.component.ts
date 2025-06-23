import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-catalogo-bonos',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container">
      <h1>CatÃ¡logo de Bonos</h1>
      <p>Lista de bonos disponibles - En construcciÃ³n</p>
      <a routerLink="/inversor/dashboard">Volver al Dashboard</a>
    </div>
  `,
  styles: [`
    .container {
      padding: 20px;
    }
  `]
})
export class CatalogoBonosComponent {}
