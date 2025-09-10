// form-frame.component.ts
import { Component, ViewChild } from '@angular/core';
import { FormComponent } from '../Form/form/form.component';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-form-frame',
  standalone: true,
  imports: [
    FormComponent,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    CommonModule
  ],
  templateUrl: './form-frame.component.html',
  styleUrl: './form-frame.component.css'
})
export class FormFrameComponent {
  @ViewChild(FormComponent) formComponent?: FormComponent;

  constructor(
    private location: Location,
    private router: Router
  ) {}

  // Directly navigate home (replace '/' if you have a named route)
  closeForm() {
    this.router.navigate(['/']);
  }
}