import { Component, input, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModuleConfigurationItem } from '../interfaces/module-content.config.model';
import { ExpandableAccordionCardComponent } from "../expandable-accordion-card/expandable-accordion-card/expandable-accordion-card.component";

@Component({
  selector: 'app-module-navigation',
  standalone: true,
  imports: [ExpandableAccordionCardComponent, CommonModule],
  templateUrl: './module-navigation.component.html',
  styleUrl: './module-navigation.component.css'
})
export class ModuleNavigationComponent implements OnInit {
  configurationItem = input.required<ModuleConfigurationItem[]>();
  iconPath = input.required<string>();
  activeMenuId = signal('');
  
  ngOnInit() {
    
    const config = this.configurationItem()[0];
  
  if (config) {
    // Provide a default value using nullish coalescing operator
    const menuId = config.defaultMenu ?? 
                  (config.menus?.length > 0 ? config.menus[0].menuId : '');
    
    this.activeMenuId.set(menuId);
  }
  }
  
  get activeMenu() {
    return this.configurationItem()[0]?.menus?.find(
      menu => menu.menuId === this.activeMenuId()
    );
  }
  
  setActiveMenu(menuId: string) {
    this.activeMenuId.set(menuId);
  }
}