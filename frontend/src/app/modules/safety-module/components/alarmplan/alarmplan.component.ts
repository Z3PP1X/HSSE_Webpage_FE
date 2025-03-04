import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, } from '@angular/common';
import { Subscription } from 'rxjs';
import { AlarmplanFields } from './alarmplan.model.interface';
import { AlarmplanDataService } from '../../services/alarmplan-data.service';



@Component({
  selector: 'app-alarmplan',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alarmplan.component.html',
  styleUrl: './alarmplan.component.css'
})
export class AlarmplanComponent implements OnInit, OnDestroy {
  healthIcon = "ehs-icons/safety.svg";
  employeeIcon = "ehs-icons/health.svg";
  safetyIcon = "ehs-icons/person.svg";
  qrCode = "qr-codes/qr-code-png";
  fireAlarmIcon = "ehs-icons/fireAlarmIcon.svg";
  callFireDepartmentIcon = "ehs-icons/callFireDepartmentIcon.svg";
  escapeRouteIcon = "ehs-icons/escapeRouteIcon.svg";
  fireExtinguisherIcon = "ehs-icons/fireExtinguisherIcon.svg";
  assemblyPointIcon = "ehs-icons/assemblyPointIcon.svg";
  titleFirstAid = "ehs-icons/firstaidcross.svg"
  titleFireAlarm = "ehs-icons/fireExtinguisherIcon.svg"
  titleImportantNumbers = "ehs-icons/phone.svg"
  timestamp = ""

  config = signal<AlarmplanFields>({} as AlarmplanFields);

  private subscription: Subscription = new Subscription();


  constructor(private alarmplanDataService: AlarmplanDataService,) {}

  ngOnInit() {
    this.subscription = this.alarmplanDataService.formData$.subscribe(data => {
      this.config.set(data);
      this.timestamp = this.currentTime();
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  currentTime() {
    const dateTime = new Date().toLocaleDateString();
    return dateTime;
  }
}
