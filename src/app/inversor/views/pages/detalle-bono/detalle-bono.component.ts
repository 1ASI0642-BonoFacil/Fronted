import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-detalle-bono',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container">
      <h1>Detalle del Bono</h1>
      <p>InformaciÃ³n detallada - En construcciÃ³n</p>
      <a routerLink="/inversor/catalogo">Volver al CatÃ¡logo</a>
    </div>
  `,
  styles: [`
    .container {
      padding: 20px;
    }
  `]
})
export class DetalleBonoComponent {}
