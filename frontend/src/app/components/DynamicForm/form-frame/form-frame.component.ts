// form-frame.component.ts
import { Component, ViewChild } from '@angular/core';
import { FormComponent } from '../Form/form/form.component';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormGroup } from '@angular/forms';
import { Location } from '@angular/common';

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
  test = "Test";
  
  @ViewChild(FormComponent) formComponent?: FormComponent;
  
  constructor(
    private dialog: MatDialog,
    private location: Location
  ) {}
  
  closeForm() {
    // Check if form has changes
    const hasChanges = this.formComponent?.form?.dirty;
    
    if (hasChanges) {
      // Open confirmation dialog
      const dialogRef = this.dialog.open(ConfirmDialogComponent);
      
      dialogRef.afterClosed().subscribe(result => {
        if (result === 'discard') {
          this.navigateBack();
        }
      });
    } else {
      this.navigateBack();
    }
  }
  
  navigateBack() {
    this.location.back();
  }
}

// Confirmation dialog component
@Component({
  selector: 'confirm-dialog',
  template: `
    <h2 mat-dialog-title>Änderungen verwerfen?</h2>
    <mat-dialog-content>
      Es gibt ungespeicherte Änderungen. Möchten Sie diese verwerfen?
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Abbrechen</button>
      <button mat-button [mat-dialog-close]="'discard'" color="warn">Verwerfen</button>
    </mat-dialog-actions>
  `,
  standalone: true,
  imports: [MatDialogModule, MatButtonModule]
})
export class ConfirmDialogComponent {}