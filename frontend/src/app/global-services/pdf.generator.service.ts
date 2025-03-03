import { Injectable } from "@angular/core";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

@Injectable({
    providedIn: 'root'
})
export class PdfService {
    constructor() {}

    async generatePDF(elementId: string, fileName: string = 'document.pdf') {
        const element = document.getElementById(elementId);
        if (!element) {
            console.error(`Element with ID "${elementId}" not found`);
            return;
        }

        try {
            // Ensure all fonts and resources are loaded
            await document.fonts.ready;

            // Clone the element to avoid modifying the original
            const clonedElement = element.cloneNode(true) as HTMLElement;
            const tempContainer = document.createElement('div');
            tempContainer.style.position = 'absolute';
            tempContainer.style.left = '-9999px';
            tempContainer.style.top = '0';
            tempContainer.appendChild(clonedElement);
            document.body.appendChild(tempContainer);

            // Process SVGs in the cloned element
            await this.preprocessAllImages(clonedElement);

            // Give extra time for rendering after preprocessing
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Capture the processed element
            const canvas = await html2canvas(clonedElement, {
                scale: 3,
                useCORS: true,
                allowTaint: true,
                logging: true, // Enable logging to debug issues
                backgroundColor: '#FFFFFF',
                scrollX: 0,
                scrollY: 0,
                imageTimeout: 200,
                windowWidth: clonedElement.scrollWidth,
                windowHeight: clonedElement.scrollHeight,
                foreignObjectRendering: false,
                onclone: (clonedDoc, element) => {
                    console.log('Element cloned by html2canvas');
                }
            });

            // Remove the temp container
            document.body.removeChild(tempContainer);

            // Create PDF with proper dimensions
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'px',
                format: [canvas.width, canvas.height]
            });

            // Add the canvas to the PDF
            const imgData = canvas.toDataURL('image/png');
            pdf.addImage(imgData, 'PNG', 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight());
            pdf.save(fileName);
        } catch (error) {
            console.error('PDF Generation Error:', error);
        }
    }

    private async preprocessAllImages(element: HTMLElement): Promise<void> {
        console.log('Processing all images and SVGs');

        // Handle all images, not just SVGs
        const images = element.querySelectorAll('img');

        await Promise.all(Array.from(images).map(async (element: Element) => {
            const img = element as HTMLImageElement;
            try {
                if (img.complete && img.naturalWidth > 0) {
                    console.log(`Image already loaded: ${img.src}`);
                    // Already loaded successfully
                    if (img.src.endsWith('.svg')) {
                        await this.convertToDataUrl(img);
                    }
                    return;
                }

                // Set crossOrigin for all images
                img.crossOrigin = 'anonymous';

                // Wait for the image to load
                await new Promise<void>((resolve) => {
                    const originalSrc = img.src;

                    img.onload = async () => {
                        console.log(`Image loaded: ${originalSrc}`);
                        if (originalSrc.endsWith('.svg')) {
                            await this.convertToDataUrl(img);
                        }
                        resolve();
                    };

                    img.onerror = () => {
                        console.warn(`Failed to load image: ${originalSrc}`);
                        // Try to load without crossOrigin as fallback
                        img.crossOrigin = '';
                        // If that fails too, just resolve and continue
                        img.onerror = () => {
                            console.warn(`Second attempt failed: ${originalSrc}`);
                            resolve();
                        };
                        // Force reload
                        img.src = originalSrc;
                    };
                });
            } catch (error) {
                console.warn('Failed to process image:', error);
            }
        }));

        // Handle inline SVG elements
        const svgElements = element.querySelectorAll('svg');
        console.log(`Found ${svgElements.length} inline SVG elements`);

        await Promise.all(Array.from(svgElements).map(async (element: Element) => {
            const svg = element as SVGElement;
            try {
                // Get computed dimensions
                const rect = svg.getBoundingClientRect();
                const width = rect.width || 200;
                const height = rect.height || 200;

                // Convert SVG to image
                const imgElement = await this.svgToImage(svg, width, height);

                // Replace SVG with image
                if (svg.parentNode) {
                    svg.parentNode.replaceChild(imgElement, svg);
                    console.log('Replaced SVG with image');
                }
            } catch (error) {
                console.warn('Failed to process inline SVG:', error);
            }
        }));
    }

    private async convertToDataUrl(img: HTMLImageElement): Promise<void> {
        try {
            // Create canvas to convert to data URL
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth || img.width || 200;
            canvas.height = img.naturalHeight || img.height || 200;

            const ctx = canvas.getContext('2d');
            if (ctx) {
                // Draw image to canvas
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                // Convert to data URL
                const dataUrl = canvas.toDataURL('image/png');
                console.log(`Converted to data URL: ${dataUrl.substring(0, 30)}...`);

                // Update image source
                img.src = dataUrl;
            }
        } catch (error) {
            console.warn('Error converting image to data URL:', error);
        }
    }

    private async svgToImage(svg: SVGElement, width: number, height: number): Promise<HTMLImageElement> {
        // Get SVG as XML string
        const svgData = new XMLSerializer().serializeToString(svg);

        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            throw new Error('Could not get canvas context');
        }

        // Create image with SVG data
        const img = new Image();

        // Convert SVG to data URL
        const svgBlob = new Blob([svgData], {type: 'image/svg+xml;charset=utf-8'});
        const url = URL.createObjectURL(svgBlob);

        // Wait for image to load
        await new Promise<void>((resolve, reject) => {
            img.onload = () => {
                // Draw to canvas
                ctx.drawImage(img, 0, 0, width, height);
                URL.revokeObjectURL(url);
                resolve();
            };

            img.onerror = (e) => {
                console.error('Error loading SVG in image:', e);
                URL.revokeObjectURL(url);
                reject(new Error('Failed to load SVG in image'));
            };

            img.src = url;
        });

        // Create result image from canvas
        const resultImg = new Image();
        resultImg.src = canvas.toDataURL('image/png');
        resultImg.width = width;
        resultImg.height = height;
        resultImg.style.width = `${width}px`;
        resultImg.style.height = `${height}px`;

        // Copy classes from original SVG
        if (svg.className && svg.className.baseVal) {
            resultImg.className = svg.className.baseVal;
        }

        return resultImg;
    }
}
