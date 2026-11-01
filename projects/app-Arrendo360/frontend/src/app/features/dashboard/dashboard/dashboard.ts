import { Component, OnInit, inject } from '@angular/core';

import { ButtonModule } from 'primeng/button';

import { HealthService } from '../../../core/services/health.service'; // Ajusta ../ según la profundidad de carpeta

@Component({

  selector: 'app-dashboard',

  imports: [ButtonModule],

  templateUrl: './dashboard.html',

  styleUrl: './dashboard.css',

})

export class Dashboard implements OnInit {

  protected readonly healthService = inject(HealthService);

  ngOnInit(): void {

    this.healthService.checkHealth();

  }

}
