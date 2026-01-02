import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ModuleManagementService } from '../../../global-services/module-management/module-management.service';
import { GlobalModuleConfig } from '../../../config/modules.config';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  availableModules: GlobalModuleConfig[] = [];

  constructor(
    private moduleManagementService: ModuleManagementService,
    private router: Router
  ) { }

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
        this.availableModules = modules;
      });
  }

  /**
   * Handle Get Started button click
   */
  getStarted(): void {
    // Navigate to the first available module or show onboarding
    if (this.availableModules.length > 0) {
      const firstModule = this.availableModules[0];
      this.router.navigate(['/', firstModule.route]);
    } else {
      // Navigate to support if no modules are available
      this.router.navigate(['/support']);
    }
  }

  /**
   * Handle Learn More button click
   */
  learnMore(): void {
    // Navigate to support/documentation
    this.router.navigate(['/support']);
  }

  getModuleIcon(moduleId: string): string {
    const baseClass = "w-6 h-6";
    switch (moduleId) {
      case 'safety-module':
        return `<svg class="${baseClass}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>`;
      case 'health-module':
        return `<svg class="${baseClass}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>`;
      case 'emergency-contacts':
        return `<svg class="${baseClass}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>`;
      case 'account-module':
        return `<svg class="${baseClass}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>`;
      case 'reporting-module':
        return `<svg class="${baseClass}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>`;
      default:
        return `<svg class="${baseClass}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>`;
    }
  }

  getModuleColorClasses(moduleId: string): { bg: string, icon: string } {
    // Return dark theme compatible classes
    // Utilizing sixt-orange for brand consistecy or specific colors muted for dark mode
    switch (moduleId) {
      case 'safety-module':
        return { bg: 'bg-green-900/30', icon: 'text-green-400' };
      case 'health-module':
        return { bg: 'bg-red-900/30', icon: 'text-red-400' };
      case 'emergency-contacts':
        return { bg: 'bg-yellow-900/30', icon: 'text-yellow-400' };
      case 'account-module':
        return { bg: 'bg-blue-900/30', icon: 'text-blue-400' };
      case 'reporting-module':
        return { bg: 'bg-purple-900/30', icon: 'text-purple-400' };
      default:
        return { bg: 'bg-zinc-800', icon: 'text-zinc-400' };
    }
  }

  getModuleDescription(moduleId: string): string {
    switch (moduleId) {
      case 'safety-module':
        return 'Manage emergency plans, incident reports, and safety protocols';
      case 'health-module':
        return 'Track health metrics, wellness programs, and medical records';
      case 'emergency-contacts':
        return 'Quick access to emergency contacts and response procedures';
      case 'account-module':
        return 'Manage user accounts, preferences, and access controls';
      case 'reporting-module':
        return 'Generate reports, analytics, and compliance documentation';
      default:
        return 'Module functionality and features';
    }
  }
}