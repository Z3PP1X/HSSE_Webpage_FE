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
            console.error(`Element with ID "${elementId}" not found`);
            return;
        }

        // Get the computed dimensions of the element
        const computedStyle = window.getComputedStyle(element);
        const width = parseInt(computedStyle.width);
        const height = parseInt(computedStyle.height);

        // Configure html2canvas with proper dimensions and scaling
        html2canvas(element, {
            scale: 2,
            width: width,
            height: height,
            useCORS: true,
            allowTaint: true,
            logging: false,
            backgroundColor: null, // Transparent background
            // Remove any extra space/margin around the element
            x: 0,
            y: 0
        }).then(canvas => {
            // Create PDF with the proper dimensions
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'px',
                format: [canvas.width, canvas.height]
            });
            
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(fileName);
        }).catch(error => console.error('PDF Generation Error:', error))
    }
}