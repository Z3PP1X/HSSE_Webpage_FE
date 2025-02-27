import { Component } from '@angular/core';
import { AlarmplanComponent } from '../../alarmplan/alarmplan.component';
import { PdfService } from '../../../../../global-services/pdf.generator.service';

import { ALARMPLANFIELDS } from '../../alarmplan/contacts.config.dummy';

@Component({
  selector: 'app-pdf',
  standalone: true,
  imports: [AlarmplanComponent],
  templateUrl: './pdf.component.html',
  styleUrl: './pdf.component.css'
})
export class PdfComponent {

  constructor (private pdfservice: PdfService) {}

  config = ALARMPLANFIELDS

  

  generatePDF(){
    this.pdfservice.generatePDF('alarmplan', 'alarmplan.pdf');
  }



}
