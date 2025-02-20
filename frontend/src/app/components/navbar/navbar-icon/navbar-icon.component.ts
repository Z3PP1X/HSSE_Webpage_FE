import { Component, input, signal, output, OnInit } from '@angular/core';
import { ActiveModuleService } from '../services/selected-module.service';
import { ParseSourceFile } from '@angular/compiler';

@Component({
  selector: 'app-navbar-icon',
  standalone: true,
  imports: [],
  templateUrl: './navbar-icon.component.html',
  styleUrl: './navbar-icon.component.css',
})
export class NavbarIconComponent implements OnInit {
  iconPath = input.required<string>();
  iconTooltip = input.required<string>();
  id = input.required<string>();

  isActive = signal(false);
  menuSelected = output<string>();

  constructor(private activeModuleService: ActiveModuleService) {}

  ngOnInit(): void {
    this.activeModuleService.selectedModule$.subscribe((activeId) => {
      if (activeId === this.id()) {
        this.isActive.set(!this.isActive());
      } else {
        switch (this.isActive()) {
          case true: {
            this.isActive.set(false);
            break;
          }
          case false: {
            break;
          }
        }
      }
    });
  }

  onIconClick() {
    this.activeModuleService.setActiveModule(this.id());
  }
}
