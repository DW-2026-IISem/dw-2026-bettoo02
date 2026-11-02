import { Component, inject, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, ButtonModule, TagModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})

export class Header {
  protected readonly authService = inject(AuthService);
  readonly sidebarOpen = input<boolean>(true);
  readonly toggleSidebar = output<void>();
}