import { Component, OnInit, computed, inject, signal } from '@angular/core';

import { DecimalPipe } from '@angular/common';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { TableModule } from 'primeng/table';

import { ButtonModule } from 'primeng/button';

import { DialogModule } from 'primeng/dialog';

import { InputTextModule } from 'primeng/inputtext';

import { InputNumberModule } from 'primeng/inputnumber';

import { SelectModule } from 'primeng/select';

import { TagModule } from 'primeng/tag';

import { CobrosService } from '../services/cobros.service';

import { ContratosService } from '../../contratos/services/contratos.service';

import { Cobro } from '../models/cobro.model';

@Component({

  selector: 'app-cobros-page',

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

  templateUrl: './cobros-page.html',

  styleUrl: './cobros-page.css',

})

export class CobrosPage implements OnInit {

  protected readonly cobrosService = inject(CobrosService);

  protected readonly contratosService = inject(ContratosService);

  private readonly fb = inject(FormBuilder);

  protected readonly cobroDialog = signal(false);

  protected readonly pagoDialog = signal(false);

  protected readonly selectedCobro = signal<Cobro | null>(null);

  protected readonly saving = signal(false);

  protected readonly errorMsg = signal<string | null>(null);

  protected readonly contratosActivos = computed(() =>

    this.contratosService.contratos().filter((c) => c.estado === 'ACTIVO'),

  );

  protected readonly metodosPago = [

    { label: 'Transferencia Bancaria', value: 'TRANSFERENCIA' },

    { label: 'PSE', value: 'PSE' },

    { label: 'Efectivo', value: 'EFECTIVO' },

    { label: 'Tarjeta', value: 'TARJETA' },

  ];

  protected readonly cobroForm = this.fb.nonNullable.group({

    referenciaId: [0, [Validators.required, Validators.min(1)]],

    fecha: ['2026-11-05', [Validators.required]],

    valor: [1500000, [Validators.required, Validators.min(1)]],

    observaciones: ['Canon mensual de arrendamiento'],

  });

  protected readonly pagoForm = this.fb.nonNullable.group({

    referenciaId: [0, [Validators.required]],

    metodo: ['TRANSFERENCIA', [Validators.required]],

    monto: [0, [Validators.required, Validators.min(1)]],

    fecha: ['2026-11-05', [Validators.required]],

  });

  ngOnInit(): void {

    this.cobrosService.loadAll();

    this.contratosService.loadContratos();

  }

  protected getContratoNumero(id: number): string {

    return (

      this.contratosService.contratos().find((c) => c.id === id)?.numero ??

      `Contrato #${id}`

    );

  }

  protected openNewCobro(): void {

    this.errorMsg.set(null);

    const first = this.contratosActivos()[0];

    this.cobroForm.reset({

      referenciaId: first?.id ?? 0,

      fecha: new Date().toISOString().slice(0, 10),

      valor: first ? Number(first.valor) : 1500000,

      observaciones: 'Canon mensual de arrendamiento',

    });

    this.cobroDialog.set(true);

  }

  protected openPayModal(cobro: Cobro): void {

    this.errorMsg.set(null);

    this.selectedCobro.set(cobro);

    this.pagoForm.reset({

      referenciaId: cobro.id,

      metodo: 'TRANSFERENCIA',

      monto: Number(cobro.valor),

      fecha: new Date().toISOString().slice(0, 10),

    });

    this.pagoDialog.set(true);

  }

  protected saveCobro(): void {

    if (this.cobroForm.invalid) return;

    this.saving.set(true);

    this.errorMsg.set(null);

    this.cobrosService.createCobro(this.cobroForm.getRawValue()).subscribe({

      next: () => {

        this.saving.set(false);

        this.cobroDialog.set(false);

      },

      error: (err) => {

        this.saving.set(false);

        this.errorMsg.set(err?.error?.message ?? 'Error al emitir el cobro.');

      },

    });

  }

  protected savePago(): void {

    if (this.pagoForm.invalid) return;

    this.saving.set(true);

    this.errorMsg.set(null);

    this.cobrosService.registrarPago(this.pagoForm.getRawValue()).subscribe({

      next: () => {

        this.saving.set(false);

        this.pagoDialog.set(false);

      },

      error: (err) => {

        this.saving.set(false);

        this.errorMsg.set(err?.error?.message ?? 'Error al registrar el pago.');

      },

    });

  }

}