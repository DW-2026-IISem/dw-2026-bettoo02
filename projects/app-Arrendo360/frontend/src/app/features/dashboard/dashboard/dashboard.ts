import { Component, OnInit, computed, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { HealthService } from '../../../core/services/health.service';
import { ClientsService } from '../../business/clients/services/clients.service';
import { InmueblesService } from '../../business/inmuebles/services/inmuebles.service';
import { ContratosService } from '../../business/contratos/services/contratos.service';
import { CobrosService } from '../../business/cobros/services/cobros.service';
import { ProductsService } from '../../business/products/services/products.service';
import { SalesService } from '../../business/sales/services/sales.service';

@Component({
  selector: 'app-dashboard',
  imports: [DecimalPipe, RouterLink, ButtonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})

export class Dashboard implements OnInit {
  protected readonly healthService = inject(HealthService);
  protected readonly clientsService = inject(ClientsService);
  protected readonly inmueblesService = inject(InmueblesService);
  protected readonly contratosService = inject(ContratosService);
  protected readonly cobrosService = inject(CobrosService);
  protected readonly productsService = inject(ProductsService);
  protected readonly salesService = inject(SalesService);
  // KPIs reactivos calculados con computed() Signals (ISS-07)
  protected readonly activeClientsCount = computed(
    () => this.clientsService.clients().filter((c) => c.isActive).length,
  );

  protected readonly activeContratosCount = computed(
    () => this.contratosService.contratos().filter((c) => c.estado === 'ACTIVO').length,
  );

  protected readonly totalRecaudadoPagos = computed(() =>
    this.cobrosService
      .pagos()
      .reduce((acc, p) => acc + Number(p.monto || 0), 0),
  );

  protected readonly totalSalesRevenue = computed(() =>
    this.salesService
      .sales()
      .filter((s) => s.status === 'active')
      .reduce((acc, s) => acc + Number(s.total || 0), 0),
  );

  protected readonly lowStockCount = computed(
    () =>
      this.productsService
        .products()
        .filter((p) => p.status === 'active' && p.quantity <= p.min_stock).length,
  );

  ngOnInit(): void {
    this.refreshAll();
  }

  protected refreshAll(): void {
    this.healthService.checkHealth();
    this.clientsService.loadClients();
    this.inmueblesService.loadInmuebles();
    this.contratosService.loadContratos();
    this.cobrosService.loadAll();
    this.productsService.loadProducts();
    this.salesService.loadSales();
  }
}