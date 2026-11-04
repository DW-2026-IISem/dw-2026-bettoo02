import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { TagModule } from 'primeng/tag';
import { ProductTypesService } from '../services/product-types.service';
import { ProductType } from '../models/product-type.model';

@Component({
  selector: 'app-product-types-page',
  imports: [
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    TextareaModule,
    TagModule,
  ],

  templateUrl: './product-types-page.html',
  styleUrl: './product-types-page.css',

})
export class ProductTypesPage implements OnInit {
  protected readonly productTypesService = inject(ProductTypesService);
  private readonly fb = inject(FormBuilder);
  protected readonly dialogVisible = signal(false);
  protected readonly editingItem = signal<ProductType | null>(null);
  protected readonly saving = signal(false);
  protected readonly errorMsg = signal<string | null>(null);
  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
  });

  ngOnInit(): void {
    this.productTypesService.loadProductTypes();
  }

  protected openNew(): void {

    this.editingItem.set(null);

    this.errorMsg.set(null);

    this.form.reset({ name: '', description: '' });

    this.dialogVisible.set(true);

  }

  protected openEdit(item: ProductType): void {

    this.editingItem.set(item);

    this.errorMsg.set(null);

    this.form.reset({

      name: item.name,

      description: item.description ?? '',

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

      ? this.productTypesService.update(current.id, payload)

      : this.productTypesService.create(payload);

    request$.subscribe({

      next: () => {

        this.saving.set(false);

        this.dialogVisible.set(false);

      },

      error: (err) => {

        this.saving.set(false);

        this.errorMsg.set(

          err?.error?.message ?? 'Error al guardar el tipo de producto/inmueble.',

        );

      },

    });

  }

  protected onToggleStatus(item: ProductType): void {

    this.productTypesService.toggleStatus(item).subscribe();

  }

}