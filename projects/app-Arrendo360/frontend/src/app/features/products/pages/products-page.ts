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
import { ProductsService } from '../services/products.service';
import { ProductTypesService } from '../../product-types/services/product-types.service';
import { Product } from '../models/product.model';

@Component({
  selector: 'app-products-page',
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
  templateUrl: './products-page.html',
  styleUrl: './products-page.css',
})

export class ProductsPage implements OnInit {
  protected readonly productsService = inject(ProductsService);
  protected readonly productTypesService = inject(ProductTypesService);
  private readonly fb = inject(FormBuilder);
  // Signal computado: solo permite elegir tipos de producto activos al crear/editar
  protected readonly activeProductTypes = computed(() =>
    this.productTypesService.productTypes().filter((t) => t.status === 'active'),
  );

  protected readonly dialogVisible = signal(false);

  protected readonly editingItem = signal<Product | null>(null);

  protected readonly saving = signal(false);

  protected readonly errorMsg = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({

    name: ['', [Validators.required, Validators.minLength(2)]],

    brand: ['', [Validators.required, Validators.minLength(2)]],

    price: [0, [Validators.required, Validators.min(0.01)]],

    quantity: [0, [Validators.required, Validators.min(0)]],

    min_stock: [5, [Validators.required, Validators.min(0)]],

    product_type_id: [0, [Validators.required, Validators.min(1)]],

  });

  ngOnInit(): void {

    this.productsService.loadProducts();

    this.productTypesService.loadProductTypes();

  }

  protected getTypeName(item: Product): string {

    if (item.product_type?.name) return item.product_type.name;

    const found = this.productTypesService

      .productTypes()

      .find((t) => t.id === item.product_type_id);

    return found ? found.name : `Tipo #${item.product_type_id}`;

  }

  protected openNew(): void {

    this.editingItem.set(null);

    this.errorMsg.set(null);

    const firstType = this.activeProductTypes()[0]?.id ?? 0;

    this.form.reset({

      name: '',

      brand: '',

      price: 100000,

      quantity: 10,

      min_stock: 2,

      product_type_id: firstType,

    });

    this.dialogVisible.set(true);

  }

  protected openEdit(item: Product): void {

    this.editingItem.set(item);

    this.errorMsg.set(null);

    this.form.reset({

      name: item.name,

      brand: item.brand,

      price: Number(item.price),

      quantity: Number(item.quantity),

      min_stock: Number(item.min_stock),

      product_type_id: item.product_type_id,

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

      ? this.productsService.update(current.id, payload)

      : this.productsService.create(payload);

    request$.subscribe({

      next: () => {

        this.saving.set(false);

        this.dialogVisible.set(false);

      },

      error: (err) => {

        this.saving.set(false);

        this.errorMsg.set(err?.error?.message ?? 'Error al guardar el producto.');

      },

    });

  }

  protected onToggleStatus(item: Product): void {

    this.productsService.toggleStatus(item).subscribe();

  }

}