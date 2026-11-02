import { Component, OnInit, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { environment } from '../../../../environments/environment';
import { ApiResponse, PaginatedResponse } from '../../../core/models/api-response.model';
import { CobrosService } from '../../cobros/services/cobros.service';
import { PropietariosService } from '../../propietarios/services/propietarios.service';

export interface DistribucionPago {
  id: number;
  pagoId: number;
  propietarioId: number;
  nombre: string;
  descripcion?: string;
  monto: number;
  estado: string;
}

@Component({
  selector: 'app-liquidaciones-page',
  imports: [
    DecimalPipe,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    TagModule,

  ],
  templateUrl: './liquidaciones-page.html',
  styleUrl: './liquidaciones-page.css',

})

export class LiquidacionesPage implements OnInit {
  private readonly http = inject(HttpClient);
  protected readonly cobrosService = inject(CobrosService);
  protected readonly propietariosService = inject(PropietariosService);
  private readonly fb = inject(FormBuilder);
  private readonly apiUrl = `${environment.apiUrl}/distribuciones-pago`;
  protected readonly items = signal<DistribucionPago[]>([]);
  protected readonly loading = signal(false);
  protected readonly dialogVisible = signal(false);
  protected readonly saving = signal(false);
  protected readonly errorMsg = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    pagoId: [0, [Validators.required, Validators.min(1)]],
    propietarioId: [0, [Validators.required, Validators.min(1)]],
    nombre: ['Liquidación neta a propietario (90%)', [Validators.required]],
    descripcion: ['Descuento de 10% comisión inmobiliaria'],
    monto: [900000, [Validators.required, Validators.min(1)]],
  });

  ngOnInit(): void {
    this.load();
    this.cobrosService.loadAll();
    this.propietariosService.loadPropietarios();
  }

  protected load(): void {
    this.loading.set(true);

    this.http
      .get<ApiResponse<PaginatedResponse<DistribucionPago>>>(`${this.apiUrl}?limit=100`)

      .subscribe({
        next: (res) => {
          this.items.set(res.data?.items ?? res.data?.rows ?? []);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  protected openNew(): void {
    this.errorMsg.set(null);
    const pago = this.cobrosService.pagos()[0];
    const prop = this.propietariosService.propietarios()[0];

    this.form.reset({
      pagoId: pago?.id ?? 0,
      propietarioId: prop?.id ?? 0,
      nombre: 'Liquidación neta a propietario (90%)',
      descripcion: 'Descuento 10% comisión administración',
      monto: pago ? Math.round(Number(pago.monto) * 0.9) : 900000,
    });
    this.dialogVisible.set(true);
  }

  protected save(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.errorMsg.set(null);

    this.http.post(this.apiUrl, this.form.getRawValue()).subscribe({
      next: () => {
        this.saving.set(false);
        this.dialogVisible.set(false);
        this.load();
      },

      error: (err) => {
        this.saving.set(false);
        this.errorMsg.set(
          err?.error?.message ?? 'Error al liquidar (verifica que el monto no supere el pago).',
        );
      },
    });
  }
}