// pdf.component.ts
import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlarmplanComponent } from '../../alarmplan/alarmplan.component';
import { FormDataService } from '../../../../../global-services/form-data-service/form-data.service';
import { AlarmplanFields } from '../../alarmplan/alarmplan.model.interface';
import { Subscription, firstValueFrom } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-pdf',
  standalone: true,
  imports: [CommonModule, AlarmplanComponent],
  templateUrl: './pdf.component.html',
  styleUrl: './pdf.component.css'
})
export class PdfComponent implements OnInit, OnDestroy {
  alarmplanData: AlarmplanFields = {} as AlarmplanFields;
  private subscription?: Subscription;

  constructor(
    private formDataService: FormDataService,
    private elementRef: ElementRef
  ) {}

  ngOnInit() {
    // Optional: keep a local copy (AlarmplanComponent still renders via service)
    this.subscription = this.formDataService.alarmplan$
      .pipe(
        filter(m => !!m) // always true after first mapping
      )
      .subscribe(m => {
        this.alarmplanData = m;
      });
  }

  prepareForPdfGeneration() {
    this.elementRef.nativeElement.classList.add('generating-pdf');
  }

  cleanupAfterPdfGeneration() {
    this.elementRef.nativeElement.classList.remove('generating-pdf');
  }

  // Await until data populated (costCenter or at least one first aider)
  async waitForData(): Promise<void> {
    await firstValueFrom(
      this.formDataService.alarmplan$.pipe(
        filter(m => !!m && (m.costCenter !== '' || (m.firstAiderDict?.length || 0) > 0))
      )
    );
    // Allow fonts/layout settle
    if (document?.fonts) {
      try { await (document.fonts as any).ready; } catch {}
    }
    // Minor reflow delay
    await new Promise(res => setTimeout(res, 50));
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
}
