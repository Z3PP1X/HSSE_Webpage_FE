import { Component, signal, input } from '@angular/core';

import { AlarmplanFields } from './alarmplan.model.interface';


@Component({
  selector: 'app-alarmplan',
  standalone: true,
  imports: [],
  templateUrl: './alarmplan.component.html',
  styleUrl: './alarmplan.component.css'
})
export class AlarmplanComponent {

  healthIcon = "ehs-icons/safety.svg"
  employeeIcon = "ehs-icons/health.svg"
  safetyIcon = "ehs-icons/person.svg"
  qrCode = "qr-codes/qr-code-png"
  fireAlarmIcon = "ehs-icons/fireAlarmIcon.svg"
  callFireDepartmentIcon = "ehs-icons/callFireDepartmentIcon.svg"
  escapeRouteIcon = "ehs-icons/escapeRouteIcon.svg"
  fireExtinguisherIcon = "ehs-icons/fireExtinguisherIcon.svg"
  assemblyPointIcon = "ehs-icons/assemblyPointIcon.svg"

  config = input.required<AlarmplanFields>()


}
