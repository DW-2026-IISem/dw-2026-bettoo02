import { Component, input, output } from '@angular/core';

import { ButtonModule } from 'primeng/button';

@Component({

  selector: 'app-header',

  imports: [ButtonModule],

  templateUrl: './header.html',

  styleUrl: './header.css',

})

export class Header {

  // Recibe del padre si el sidebar está abierto (para cambiar el ícono si queremos)

  readonly sidebarOpen = input<boolean>(true);

  // Emite al padre cuando el usuario presiona el botón de menú

  readonly toggleSidebar = output<void>();

}