import { Component, input } from '@angular/core';

@Component({
  selector: 'app-navbar-icon',
  standalone: true,
  imports: [],
  templateUrl: './navbar-icon.component.html',
  styleUrl: './navbar-icon.component.css'
})
export class NavbarIconComponent {

  iconPath = input.required<string>();
  iconTooltip = input.required<string>();
  iconCategory = input();
  modulLink = input();


}
