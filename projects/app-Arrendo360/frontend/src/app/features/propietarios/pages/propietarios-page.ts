import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { PropietariosService } from '../services/propietarios.service';
import { Propietario } from '../models/propietario.model';

@Component({
  selector: 'app-propietarios-page',
  imports: [
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    SelectModule,
    TagModule,
  ],
  templateUrl: './propietarios-page.html',
  styleUrl: './propietarios-page.css',
})

export class PropietariosPage implements OnInit {
  protected readonly propietariosService = inject(PropietariosService);
  private readonly fb = inject(FormBuilder);
  protected readonly dialogVisible = signal(false);
  protected readonly editingItem = signal<Propietario | null>(null);
  protected readonly saving = signal(false);
  protected readonly errorMsg = signal<string | null>(null);
  protected readonly documentTypes = [
    { label: 'Cédula de Ciudadanía (CC)', value: 'CC' },
    { label: 'Cédula de Extranjería (CE)', value: 'CE' },
    { label: 'NIT', value: 'NIT' },
  ];

  protected readonly form = this.fb.nonNullable.group({
    tipoDocumento: ['CC', [Validators.required]],
    numeroDocumento: ['', [Validators.required, Validators.minLength(5)]],
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    telefono: [''],
    email: ['', [Validators.email]],
  });

  ngOnInit(): void {
    this.propietariosService.loadPropietarios();
  }

  protected openNew(): void {
    this.editingItem.set(null);
    this.errorMsg.set(null);
    this.form.reset({
      tipoDocumento: 'CC',
      numeroDocumento: '',
      nombre: '',
      telefono: '',
      email: '',
    });

    this.dialogVisible.set(true);

  }

  protected openEdit(item: Propietario): void {

    this.editingItem.set(item);

    this.errorMsg.set(null);

    this.form.reset({

      tipoDocumento: item.tipoDocumento,

      numeroDocumento: item.numeroDocumento,

      nombre: item.nombre,

      telefono: item.telefono ?? '',

      email: item.email ?? '',

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

      ? this.propietariosService.update(current.id, payload)

      : this.propietariosService.create(payload);

    request$.subscribe({

      next: () => {

        this.saving.set(false);

        this.dialogVisible.set(false);

      },

      error: (err) => {

        this.saving.set(false);

        this.errorMsg.set(err?.error?.message ?? 'Error al guardar el propietario.');

      },

    });

  }

}