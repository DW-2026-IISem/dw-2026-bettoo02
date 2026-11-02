import {
  Directive,
  TemplateRef,
  ViewContainerRef,
  effect,
  inject,
  input,
} from '@angular/core';

import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/auth.model';

@Directive({
  selector: '[appHasRole]',
})

export class HasRoleDirective {
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly authService = inject(AuthService);
  readonly appHasRole = input.required<UserRole[]>();
  private isRendered = false;

  constructor() {
    effect(() => {
      const roles = this.appHasRole();
      const currentRole = this.authService.userRole();
      const canShow = roles.includes(currentRole);
      if (canShow && !this.isRendered) {
        this.viewContainer.createEmbeddedView(this.templateRef);
        this.isRendered = true;
      } else if (!canShow && this.isRendered) {
        this.viewContainer.clear();
        this.isRendered = false;
      }
    });
  }
}