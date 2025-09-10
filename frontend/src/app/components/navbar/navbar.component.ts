import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NavbarIconComponent } from './navbar-icon/navbar-icon.component';
import { ModuleManagementService } from '../../global-services/module-management/module-management.service';
import { GlobalModuleConfig } from '../../config/modules.config';

interface NavbarIcon {
  path: string;
  tooltip: string;
  category: string;
  route: string;
  id: string;
  iconName: string;
  enabled: boolean;
  order: number;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [NavbarIconComponent, RouterLink, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  icons: NavbarIcon[] = [
    // Static branding/menu items
    {path: "branding/SIXT_Logo_Neg.svg", tooltip: "SIXT", category: "branding", route: "", id: "", iconName: "", enabled: true, order: 0},
    {path: "", tooltip: "Home", category: "menu", iconName: "home", route: "hsse", id: "", enabled: true, order: 1200},
    {path: "", tooltip: "Task", category: "menu", iconName: "task", route: "task", id: "", enabled: true, order: 1100},
    {path: "", tooltip: "Settings", category: "menu", iconName: "settings", route: "settings", id:"", enabled: true, order: 1000},
  ];

  constructor(private moduleManagementService: ModuleManagementService) {}

  ngOnInit(): void {
    this.loadAvailableModules();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadAvailableModules(): void {
    this.moduleManagementService.getAvailableModules()
      .pipe(takeUntil(this.destroy$))
      .subscribe(modules => {
        // Convert module configs to navbar icons
        const moduleIcons: NavbarIcon[] = modules.map(module => ({
          path: module.iconPath,
          tooltip: module.tooltip,
          category: "module",
          route: module.route,
          id: module.id,
          iconName: "",
          enabled: true,
          order: module.order
        }));

        // Combine with static icons and sort
        this.icons = [
          ...this.icons.filter(icon => icon.category !== "module"), // Keep non-module icons
          ...moduleIcons // Add available modules
        ];
        
        this.sorted_icons();
      });
  }

  sorted_icons(): void {
    this.icons.sort((a, b) => a.order - b.order);
  }
}