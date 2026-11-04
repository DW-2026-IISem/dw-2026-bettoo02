import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './core/layout/header/header';
import { Aside } from './core/layout/aside/aside';
import { Footer } from './core/layout/footer/footer';
import { AuthService } from './core/auth/services/auth.service';

@Component({
  imports: [RouterOutlet, Header, Aside, Footer],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly authService = inject(AuthService);
  protected readonly title = signal('Arrendo360');
  protected readonly sidebarOpen = signal(true);

  protected onToggleSidebar(): void {
    this.sidebarOpen.update((open) => !open);
  }
}
