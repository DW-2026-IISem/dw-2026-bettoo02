import { Component, OnInit, computed, inject, signal } from '@angular/core';

import { DatePipe, DecimalPipe } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { TableModule } from 'primeng/table';

import { ButtonModule } from 'primeng/button';

import { DialogModule } from 'primeng/dialog';

import { InputNumberModule } from 'primeng/inputnumber';

import { SelectModule } from 'primeng/select';

import { TagModule } from 'primeng/tag';

import { SalesService } from '../services/sales.service';

import { ClientsService } from '../../clients/services/clients.service';

import { ProductsService } from '../../products/services/products.service';

import { Sale } from '../models/sale.model';

interface DraftLine {

  product_id: number;

  name: string;

  price: number;

  quantity: number;

}

@Component({

  selector: 'app-sales-page',

  imports: [

    DatePipe,

    DecimalPipe,

    FormsModule,

    TableModule,

    ButtonModule,

    DialogModule,

    InputNumberModule,

    SelectModule,

    TagModule,

  ],

  templateUrl: './sales-page.html',

  styleUrl: './sales-page.css',

})

export class SalesPage implements OnInit {

  protected readonly salesService = inject(SalesService);

  protected readonly clientsService = inject(ClientsService);

  protected readonly productsService = inject(ProductsService);

  protected readonly createDialogVisible = signal(false);

  protected readonly detailDialogVisible = signal(false);

  protected readonly saving = signal(false);

  protected readonly errorMsg = signal<string | null>(null);

  // Estado del formulario Maestro-Detalle con Signals

  protected readonly selectedClientId = signal<number>(0);

  protected readonly selectedProductId = signal<number>(0);

  protected readonly selectedQty = signal<number>(1);

  protected readonly tax = signal<number>(0);

  protected readonly discounts = signal<number>(0);

  protected readonly draftLines = signal<DraftLine[]>([]);

  protected readonly activeClients = computed(() =>

    this.clientsService.clients().filter((c) => c.isActive),

  );

  protected readonly activeProducts = computed(() =>

    this.productsService

      .products()

      .filter((p) => p.status === 'active' && p.quantity > 0),

  );

  protected readonly draftSubtotal = computed(() =>

    this.draftLines().reduce((acc, l) => acc + l.price * l.quantity, 0),

  );

  protected readonly draftTotal = computed(() =>

    Math.max(0, this.draftSubtotal() + (this.tax() || 0) - (this.discounts() || 0)),

  );

  ngOnInit(): void {

    this.salesService.loadSales();

    this.clientsService.loadClients();

    this.productsService.loadProducts();

  }

  protected getClientName(clientId: number): string {

    return (

      this.clientsService.clients().find((c) => c.id === clientId)?.nombre ??

      `Cliente #${clientId}`

    );

  }

  protected openNewSale(): void {

    this.errorMsg.set(null);

    this.selectedClientId.set(this.activeClients()[0]?.id ?? 0);

    this.selectedProductId.set(this.activeProducts()[0]?.id ?? 0);

    this.selectedQty.set(1);

    this.tax.set(0);

    this.discounts.set(0);

    this.draftLines.set([]);

    this.createDialogVisible.set(true);

  }

  protected addLine(): void {

    const prod = this.activeProducts().find(

      (p) => p.id === this.selectedProductId(),

    );

    if (!prod || this.selectedQty() < 1) return;

    const existing = this.draftLines().find((l) => l.product_id === prod.id);

    if (existing) {

      this.draftLines.update((lines) =>

        lines.map((l) =>

          l.product_id === prod.id

            ? { ...l, quantity: l.quantity + this.selectedQty() }

            : l,

        ),

      );

    } else {

      this.draftLines.update((lines) => [

        ...lines,

        {

          product_id: prod.id,

          name: prod.name,

          price: Number(prod.price),

          quantity: this.selectedQty(),

        },

      ]);

    }

  }

  protected removeLine(productId: number): void {

    this.draftLines.update((lines) =>

      lines.filter((l) => l.product_id !== productId),

    );

  }

  protected submitSale(): void {

    if (!this.selectedClientId() || this.draftLines().length === 0) {

      this.errorMsg.set('Seleccione un cliente y agregue al menos un producto.');

      return;

    }

    this.saving.set(true);

    this.errorMsg.set(null);

    this.salesService

      .create({

        client_id: this.selectedClientId(),

        tax: this.tax() || 0,

        discounts: this.discounts() || 0,

        items: this.draftLines().map((l) => ({

          product_id: l.product_id,

          quantity: l.quantity,

        })),

      })

      .subscribe({

        next: () => {

          this.saving.set(false);

          this.createDialogVisible.set(false);

          this.productsService.loadProducts(); // Recarga el stock actualizado

        },

        error: (err) => {

          this.saving.set(false);

          this.errorMsg.set(err?.error?.message ?? 'Error al registrar la venta.');

        },

      });

  }

  protected viewDetail(sale: Sale): void {

    this.salesService.getById(sale.id).subscribe({

      next: () => this.detailDialogVisible.set(true),

    });

  }

  protected onToggleStatus(sale: Sale): void {

    this.salesService.toggleStatus(sale).subscribe({

      next: () => this.productsService.loadProducts(),

    });

  }

}