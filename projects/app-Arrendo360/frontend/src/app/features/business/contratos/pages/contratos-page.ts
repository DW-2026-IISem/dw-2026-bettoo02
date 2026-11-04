import { Component, OnInit, inject, signal } from '@angular/core';

import { DecimalPipe } from '@angular/common';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { TableModule } from 'primeng/table';

import { ButtonModule } from 'primeng/button';

import { DialogModule } from 'primeng/dialog';

import { InputTextModule } from 'primeng/inputtext';

import { InputNumberModule } from 'primeng/inputnumber';

import { SelectModule } from 'primeng/select';

import { TagModule } from 'primeng/tag';

import { ContratosService } from '../services/contratos.service';

import { InmueblesService } from '../../inmuebles/services/inmuebles.service';

import { ClientsService } from '../../clients/services/clients.service';

import { Contrato } from '../models/contrato.model';

@Component({

  selector: 'app-contratos-page',

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

  templateUrl: './contratos-page.html',

  styleUrl: './contratos-page.css',

})

export class ContratosPage implements OnInit {

  protected readonly contratosService = inject(ContratosService);

  protected readonly inmueblesService = inject(InmueblesService);

  protected readonly clientsService = inject(ClientsService);

  private readonly fb = inject(FormBuilder);

  protected readonly dialogVisible = signal(false);

  protected readonly editingItem = signal<Contrato | null>(null);

  protected readonly saving = signal(false);

  protected readonly errorMsg = signal<string | null>(null);

  protected readonly estadosContrato = [

    { label: 'ACTIVO', value: 'ACTIVO' },

    { label: 'FINALIZADO', value: 'FINALIZADO' },

    { label: 'CANCELADO', value: 'CANCELADO' },

  ];

  protected readonly form = this.fb.nonNullable.group({

    numero: ['', [Validators.required]],

    inmuebleId: [0, [Validators.required, Validators.min(1)]],

    clienteId: [0, [Validators.required, Validators.min(1)]],

    fechaInicio: ['2026-01-01', [Validators.required]],

    fechaFin: ['2026-12-31', [Validators.required]],

    valor: [1500000, [Validators.required, Validators.min(1)]],

    estado: ['ACTIVO', [Validators.required]],

  });

  ngOnInit(): void {

    this.contratosService.loadContratos();

    this.inmueblesService.loadInmuebles();

    this.clientsService.loadClients();

  }

  protected getInmuebleNombre(id: number): string {

    return (

      this.inmueblesService.inmuebles().find((i) => i.id === id)?.nombre ??

      `Inmueble #${id}`

    );

  }

  protected getClienteNombre(id: number): string {

    return (

      this.clientsService.clients().find((c) => c.id === id)?.nombre ??

      `Cliente #${id}`

    );

  }

  protected openNew(): void {

    this.editingItem.set(null);

    this.errorMsg.set(null);

    const nextNum = `CTR-2026-00${this.contratosService.contratos().length + 1}`;

    this.form.reset({

      numero: nextNum,

      inmuebleId: this.inmueblesService.inmuebles()[0]?.id ?? 0,

      clienteId: this.clientsService.clients()[0]?.id ?? 0,

      fechaInicio: '2026-01-01',

      fechaFin: '2026-12-31',

      valor: 1500000,

      estado: 'ACTIVO',

    });

    this.dialogVisible.set(true);

  }

  protected openEdit(item: Contrato): void {

    this.editingItem.set(item);

    this.errorMsg.set(null);

    this.form.reset({

      numero: item.numero,

      inmuebleId: item.inmuebleId,

      clienteId: item.clienteId,

      fechaInicio: item.fechaInicio?.slice(0, 10) ?? '2026-01-01',

      fechaFin: item.fechaFin?.slice(0, 10) ?? '2026-12-31',

      valor: Number(item.valor),

      estado: item.estado,

    });

    this.dialogVisible.set(true);

  }

  protected save(): void {

    if (this.form.invalid) {

      this.form.markAllAsTouched();

      return;

    }

    this.saving.set(true);

    this.errorMsg.set(null);

    const payload = this.form.getRawValue();

    const current = this.editingItem();

    const request$ = current

      ? this.contratosService.update(current.id, payload)

      : this.contratosService.create(payload);

    request$.subscribe({

      next: () => {

        this.saving.set(false);

        this.dialogVisible.set(false);

      },

      error: (err) => {

        this.saving.set(false);

        this.errorMsg.set(err?.error?.message ?? 'Error al guardar el contrato.');

      },

    });

  }

}

