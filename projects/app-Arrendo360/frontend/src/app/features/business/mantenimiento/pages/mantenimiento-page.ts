import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { environment } from '../../../../../environments/environment';
import { ApiResponse, PaginatedResponse } from '../../../../core/models/api-response.model';
import { InmueblesService } from '../../inmuebles/services/inmuebles.service';

export interface TicketMantenimiento {
  id: number;
  inmuebleId: number;
  nombre: string;
  descripcion: string;
  estado: string;
}

@Component({
  selector: 'app-mantenimiento-page',
  imports: [
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    SelectModule,
    TagModule,
  ],

  templateUrl: './mantenimiento-page.html',
  styleUrl: './mantenimiento-page.css',

})

export class MantenimientoPage implements OnInit {
  private readonly http = inject(HttpClient);
  protected readonly inmueblesService = inject(InmueblesService);
  private readonly fb = inject(FormBuilder);
  private readonly apiUrl = `${environment.apiUrl}/tickets-mantenimiento`;
  protected readonly tickets = signal<TicketMantenimiento[]>([]);
  protected readonly loading = signal(false);
  protected readonly dialogVisible = signal(false);
  protected readonly saving = signal(false);
  protected readonly form = this.fb.nonNullable.group({

    inmuebleId: [0, [Validators.required, Validators.min(1)]],

    nombre: ['', [Validators.required]],

    descripcion: ['', [Validators.required]],

  });

  ngOnInit(): void {

    this.load();

    this.inmueblesService.loadInmuebles();

  }

  protected load(): void {

    this.loading.set(true);

    this.http

      .get<ApiResponse<PaginatedResponse<TicketMantenimiento>>>(`${this.apiUrl}?limit=100`)

      .subscribe({

        next: (res) => {

          this.tickets.set(res.data?.items ?? res.data?.rows ?? []);

          this.loading.set(false);

        },

        error: () => this.loading.set(false),

      });

  }

  protected openNew(): void {

    this.form.reset({

      inmuebleId: this.inmueblesService.inmuebles()[0]?.id ?? 0,

      nombre: '',

      descripcion: '',

    });

    this.dialogVisible.set(true);

  }

  protected save(): void {

    if (this.form.invalid) return;

    this.saving.set(true);

    this.http.post(this.apiUrl, this.form.getRawValue()).subscribe({

      next: () => {

        this.saving.set(false);

        this.dialogVisible.set(false);

        this.load();

      },

      error: () => this.saving.set(false),

    });

  }

}