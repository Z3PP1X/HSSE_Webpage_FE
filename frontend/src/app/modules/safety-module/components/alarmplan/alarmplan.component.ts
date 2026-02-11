import { Component, signal, OnInit, OnDestroy, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AlarmplanFields, AddedContact } from './alarmplan.model.interface';
import { FormDataService } from '../../../../global-services/form-data-service/form-data.service';
import { BranchRegionService } from '../../../../global-services/branch-region-service/branch-region.service';

@Component({
  selector: 'app-alarmplan',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alarmplan.component.html',
  styleUrl: './alarmplan.component.css'
})
export class AlarmplanComponent implements OnInit, OnDestroy {
  healthIcon = 'ehs-icons/safety.svg';
  employeeIcon = 'ehs-icons/health.svg';
  safetyIcon = 'ehs-icons/person.svg';
  qrCode = 'qr-codes/first_aid_book_qr.png';
  fireAlarmIcon = 'ehs-icons/fireAlarmIcon.svg';
  callFireDepartmentIcon = 'ehs-icons/callFireDepartmentIcon.svg';
  escapeRouteIcon = 'ehs-icons/escapeRouteIcon.svg';
  fireExtinguisherIcon = 'ehs-icons/fireExtinguisherIcon.svg';
  assemblyPointIcon = 'ehs-icons/assemblyPointIcon.svg';
  titleFirstAid = 'ehs-icons/firstaidcross.svg';
  titleFireAlarm = 'ehs-icons/fireExtinguisherIcon.svg';
  titleImportantNumbers = 'ehs-icons/phone.svg';

  timestamp = '';
  config = signal<AlarmplanFields>({} as AlarmplanFields);
  companyNumber = signal<string>('');

  private formDataService = inject(FormDataService);
  private branchRegionService = inject(BranchRegionService);
  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.formDataService.alarmplan$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(model => {
        console.log('✅ AlarmplanComponent Received Data:', model);
        this.config.set(model);
        this.timestamp = this.currentTime();

        // Fetch Company_Number when costCenter is available
        if (model.costCenter) {
          this.branchRegionService.getCompanyNumber(model.costCenter.toString())
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(num => {
              console.log('✅ AlarmplanComponent Received Company_Number:', num);
              this.companyNumber.set(num);
            });
        }
      });
  }

  ngOnDestroy(): void {
    // nothing needed when using takeUntilDestroyed
  }

  private currentTime(): string {
    return new Date().toLocaleDateString();
  }

  getUniqueContactTypes(): string[] {
    return [...new Set((this.config()?.addedContact || []).map(c => c.contactClass))];
  }

  getContactsByType(contactType: string): AddedContact[] {
    return (this.config()?.addedContact || []).filter(c => c.contactClass === contactType);
  }

  getContactTypeLabel(contactType: string): string {
    const labels: Record<string, string> = {
      BranchManager: 'Branch Manager',
      Management: 'Geschäftsleitung',
      SafetyAdvisor: 'Safety',
      EnvironmentalAdvisor: 'Beauftragte für Umweltschutz',
      CompanyDoctor: 'Betriebsarzt',
      QualityManagement: 'QM DE Operation'
    };
    return labels[contactType] || contactType;
  }

  hasFirstAiders(): boolean {
    return (this.config()?.firstAiderDict || []).length > 0;
  }

  hasContacts(): boolean {
    return (this.config()?.addedContact || []).length > 0;
  }
}