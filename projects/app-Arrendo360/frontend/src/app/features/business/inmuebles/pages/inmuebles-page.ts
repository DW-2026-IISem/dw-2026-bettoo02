import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag'
import { InmueblesService } from '../services/inmuebles.service';
import { PropietariosService } from '../../propietarios/services/propietarios.service';
import { Inmueble } from '../models/inmueble.model';

@Component({
  selector: 'app-inmuebles-page',
  imports: [
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    TagModule,
  ],
  templateUrl: './inmuebles-page.html',
  styleUrl: './inmuebles-page.css',
})

export class InmueblesPage implements OnInit {
  protected readonly inmueblesService = inject(InmueblesService);
  protected readonly propietariosService = inject(PropietariosService);
  private readonly fb = inject(FormBuilder);
  protected readonly dialogVisible = signal(false);
  protected readonly editingItem = signal<Inmueble | null>(null);
  protected readonly saving = signal(false);
  protected readonly errorMsg = signal<string | null>(null);
  protected readonly form = this.fb.nonNullable.group({
    propietarioId: [0, [Validators.required, Validators.min(1)]],
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    descripcion: [''],
  });

  ngOnInit(): void {

    this.inmueblesService.loadInmuebles();

    this.propietariosService.loadPropietarios();

  }

  protected getPropietarioNombre(propietarioId: number): string {

    const found = this.propietariosService

      .propietarios()

      .find((p) => p.id === propietarioId);

    return found ? `${found.nombre} (${found.numeroDocumento})` : `ID #${propietarioId}`;

  }

  protected openNew(): void {

    this.editingItem.set(null);

    this.errorMsg.set(null);

    const firstOwner = this.propietariosService.propietarios()[0]?.id ?? 0;

    this.form.reset({

      propietarioId: firstOwner,

      nombre: '',

      descripcion: '',

    });

    this.dialogVisible.set(true);

  }

  protected openEdit(item: Inmueble): void {

    this.editingItem.set(item);

    this.errorMsg.set(null);

    this.form.reset({

      propietarioId: item.propietarioId,

      nombre: item.nombre,

      descripcion: item.descripcion ?? '',

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

      ? this.inmueblesService.update(current.id, payload)

      : this.inmueblesService.create(payload);

    request$.subscribe({

      next: () => {

        this.saving.set(false);

        this.dialogVisible.set(false);

      },

      error: (err) => {

        this.saving.set(false);

        this.errorMsg.set(err?.error?.message ?? 'Error al guardar el inmueble.');

      },

    });

  }

}