import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar-icon',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar-icon.component.html',
  styleUrl: './navbar-icon.component.css'
})
export class NavbarIconComponent {

  iconPath = input.required<string>();
  iconTooltip = input.required<string>();
  id = input.required<string>();
  isActive = input(false);

  menuSelected = output<string>();

  constructor() { }

  onIconClick() {
    this.menuSelected.emit(this.id());
  }
}
