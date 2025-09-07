import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModuleManagementService } from '../../global-services/module-management/module-management.service';
import { ModuleStatus, GlobalModuleConfig } from '../../config/modules.config';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-module-debug',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="!environment.production" class="module-debug-panel">
      <h3>Module Debug Panel</h3>
      
      <div class="debug-info">
        <h4>Environment Info:</h4>
        <pre>{{ debugInfo | json }}</pre>
      </div>

      <div class="available-modules">
        <h4>Available Modules:</h4>
        <div *ngFor="let module of availableModules" class="module-item">
          <span [class]="'status-' + module.status">{{ module.name }}</span>
          <span class="status-badge">{{ module.status }}</span>
          <button (click)="toggleModuleStatus(module)" class="toggle-btn">
            Toggle Status
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .module-debug-panel {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: white;
      border: 2px solid #ccc;
      padding: 15px;
      border-radius: 5px;
      max-width: 400px;
      font-size: 12px;
      z-index: 9999;
    }
    .status-production { color: green; }
    .status-staging { color: orange; }
    .status-development { color: blue; }
    .status-disabled { color: red; }
    .module-item {
      display: flex;
      justify-content: space-between;
      margin: 5px 0;
      padding: 5px;
      border: 1px solid #eee;
    }
  `]
})
export class ModuleDebugComponent implements OnInit {
  environment = environment;
  availableModules: GlobalModuleConfig[] = [];
  debugInfo: any = {};

  constructor(private moduleManagementService: ModuleManagementService) {}

  ngOnInit(): void {
    if (environment.features?.enableModuleDebugging) {
      this.loadDebugInfo();
    }
  }

  private loadDebugInfo(): void {
    this.debugInfo = this.moduleManagementService.getModuleDebugInfo();
    this.moduleManagementService.getAvailableModules().subscribe(modules => {
      this.availableModules = modules;
    });
  }

  toggleModuleStatus(module: GlobalModuleConfig): void {
    const statuses = Object.values(ModuleStatus);
    const currentIndex = statuses.indexOf(module.status);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];
    
    this.moduleManagementService.overrideModuleStatus(module.id, nextStatus);
    this.loadDebugInfo();
  }
}