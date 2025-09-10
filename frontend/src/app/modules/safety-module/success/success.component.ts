import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-success',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './success.component.html',
  styleUrl: './success.component.css'
})
export class SuccessComponent implements OnInit {
  @Input() autoRedirect = true;
  @Input() redirectDelayMs = 4000;

  countdown = Math.floor(this.redirectDelayMs / 1000);

  private intervalId: any;

  constructor(private router: Router) {}

  ngOnInit(): void {
    if (this.autoRedirect) {
      this.intervalId = setInterval(() => {
        this.countdown--;
        if (this.countdown <= 0) {
          this.navigateHome();
        }
      }, 1000);
    }
  }

  navigateHome() {
    if (this.intervalId) clearInterval(this.intervalId);
    this.router.navigate(['/']);
  }

  openAnother() {
    if (this.intervalId) clearInterval(this.intervalId);
    this.router.navigate(['/safety']); // adjust route if different
  }
}