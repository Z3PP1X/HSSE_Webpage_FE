import { Injectable } from "@angular/core";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

@Injectable({
    providedIn: 'root'
})
export class PdfService {
    constructor(){}

    generatePDF(elementId: string, fileName: string = 'document.pdf'){
        const element = document.getElementById(elementId);
        if(!element) {
            console.error('Element with ID "${elementID}" not found.')
            return;
        }

        html2canvas(element, {scale: 2}).then(canvas => {
            const imgData = canvas.toDataURL('image/png', 0.5)
            const pdf = new jsPDF('l', 'mm', 'a4');
            let imgWidth = 210;
            let imgHeight = (canvas.height * imgWidth) / canvas.width; 

            if (imgHeight > 210) {
                const scaleFactor = 210 / imgHeight;
                imgHeight = 210; 
                imgWidth *= scaleFactor;
            }

            pdf.addImage(imgData, 'PNG', 0, 10, imgWidth, imgHeight);
            pdf.save(fileName);
        }).catch(error => console.error('PDF Generation Error:', error))
    }
}