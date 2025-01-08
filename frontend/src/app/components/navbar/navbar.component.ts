import { Component, OnInit } from '@angular/core';
import { NavbarIconComponent } from './navbar-icon/navbar-icon.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [NavbarIconComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit{

  icons = [
    {path: "branding/SIXT_Logo_Neg.svg", tooltip: "SIXT-LOGO", category: "branding", iconName: "", enabled: true, order: 0},

    {path: "ehs-icons/health-white.svg", tooltip: "Health", category: "module", iconName: "", enabled: true, order: 100},

    {path: "ehs-icons/safety-white.svg", tooltip: "Safety", category: "module", iconName: "", enabled: true, order: 200},

    {path: "ehs-icons/person-white.svg", tooltip: "Account", category: "module", iconName: "", enabled: true, order: 300},

    {path: "ehs-icons/phone.svg", tooltip: "Emergency Contacts", category: "module", iconName: "", enabled: true, order: 400},

    {path: "", tooltip: "Home", category: "menu", iconName: "home", enabled: true, order: 1200},

    {path: "", tooltip: "Task", category: "menu", iconName: "task", enabled: true, order: 1100},

    {path: "", tooltip: "Settings", category: "menu", iconName: "settings", enabled: true, order: 1000},
  ]

sorted_icons() {
  this.icons.sort((a, b) => a.order - b.order);
}

ngOnInit(): void {
    this.sorted_icons();
}

}
