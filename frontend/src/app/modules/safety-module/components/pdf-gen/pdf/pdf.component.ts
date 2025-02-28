// pdf.component.ts
import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlarmplanComponent } from '../../alarmplan/alarmplan.component';
import { AlarmplanDataService } from '../../../services/alarmplan-data.service';
import { AlarmplanFields } from '../../alarmplan/alarmplan.model.interface';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-pdf',
  standalone: true,
  imports: [CommonModule, AlarmplanComponent],
  templateUrl: './pdf.component.html',
  styleUrl: './pdf.component.css'
})
export class PdfComponent implements OnInit, OnDestroy {
  alarmplanData: AlarmplanFields = {} as AlarmplanFields;
  private subscription: Subscription = new Subscription();
  
  constructor(
    private alarmplanDataService: AlarmplanDataService,
    private elementRef: ElementRef
  ) {}
  
  ngOnInit() {
    this.subscription = this.alarmplanDataService.formData$.subscribe(data => {
      this.alarmplanData = data;
    });
  }
  
  // Method to call before generating PDF
  prepareForPdfGeneration() {
    this.elementRef.nativeElement.classList.add('generating-pdf');
  }
  
  // Method to call after generating PDF
  cleanupAfterPdfGeneration() {
    this.elementRef.nativeElement.classList.remove('generating-pdf');
  }
  
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}