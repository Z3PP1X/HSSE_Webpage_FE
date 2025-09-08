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
                format: [canvas.width, canvas.height],
                compress: true
            });

            // Add the canvas to the PDF
            const imgData = canvas.toDataURL('image/png');
            pdf.addImage(imgData, 'PNG', 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight(), undefined, 'FAST');
            pdf.save(fileName);
        } catch (error) {
            console.error('PDF Generation Error:', error);
        }
    }

    private async preprocessAllImages(root: HTMLElement): Promise<void> {
        const images = Array.from(root.querySelectorAll('img'));

        await Promise.all(images.map(img => this.prepareImage(img)));
        
        // Inline <svg> elements → rasterize once
        const inlineSvgs = Array.from(root.querySelectorAll('svg'));
        await Promise.all(inlineSvgs.map(svg => this.rasterizeInlineSvg(svg as SVGElement)));
    }

    private async prepareImage(img: HTMLImageElement): Promise<void> {
        // Already processed?
        if (img.dataset['processed'] === '1') return;

        // Data URL -> nothing to do
        if (img.src.startsWith('data:')) {
            img.dataset['processed'] = '1';
            return;
        }

        // Ensure load (once)
        if (!img.complete || img.naturalWidth === 0) {
            await new Promise<void>(resolve => {
                const onLoad = () => {
                    img.removeEventListener('load', onLoad);
                    img.removeEventListener('error', onError);
                    resolve();
                };
                const onError = () => {
                    img.removeEventListener('load', onLoad);
                    img.removeEventListener('error', onError);
                    console.warn('Image failed to load (continuing):', img.src);
                    resolve();
                };
                img.addEventListener('load', onLoad, { once: true });
                img.addEventListener('error', onError, { once: true });
            });
        }

        // Rasterize external SVG (src endsWith .svg)
        if (img.src.toLowerCase().endsWith('.svg')) {
            await this.rasterizeSvgImage(img);
        }

        img.dataset['processed'] = '1';
    }

    private async rasterizeSvgImage(img: HTMLImageElement): Promise<void> {
        // Guard to prevent loops
        if (img.dataset['rasterized'] === '1') return;
        img.dataset['rasterized'] = '1';

        try {
            // Fetch original SVG (safer than relying on current onload event)
            const resp = await fetch(img.src, { cache: 'force-cache' });
            if (!resp.ok) {
                console.warn('Failed to fetch SVG:', img.src);
                return;
            }
            const svgText = await resp.text();

            // Create blob URL
            const blob = new Blob([svgText], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);

            // Load into an Image for dimensions
            const rasterImg = await new Promise<HTMLImageElement>((resolve, reject) => {
                const i = new Image();
                i.onload = () => resolve(i);
                i.onerror = e => reject(e);
                i.src = url;
            });

            const width = rasterImg.naturalWidth || 200;
            const height = rasterImg.naturalHeight || 200;

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                URL.revokeObjectURL(url);
                return;
            }
            ctx.drawImage(rasterImg, 0, 0, width, height);
            URL.revokeObjectURL(url);

            const dataUrl = canvas.toDataURL('image/png');
            img.src = dataUrl; // This will fire load again, but we blocked recursion with dataset flags
        } catch (e) {
            console.warn('Rasterizing SVG failed:', img.src, e);
        }
    }

    private async rasterizeInlineSvg(svg: SVGElement): Promise<void> {
        if ((svg as any)._rasterized) return;
        (svg as any)._rasterized = true;

        try {
            const rect = svg.getBoundingClientRect();
            const width = rect.width || 200;
            const height = rect.height || 200;

            const xml = new XMLSerializer().serializeToString(svg);
            const blob = new Blob([xml], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);

            const img = await new Promise<HTMLImageElement>((resolve, reject) => {
                const i = new Image();
                i.onload = () => resolve(i);
                i.onerror = e => reject(e);
                i.src = url;
            });

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                URL.revokeObjectURL(url);
                return;
            }
            ctx.drawImage(img, 0, 0, width, height);
            URL.revokeObjectURL(url);

            const rasterImg = new Image();
            rasterImg.src = canvas.toDataURL('image/png');
            rasterImg.width = width;
            rasterImg.height = height;
            rasterImg.style.width = `${width}px`;
            rasterImg.style.height = `${height}px`;

            if (svg.parentNode) {
                svg.parentNode.replaceChild(rasterImg, svg);
            }
        } catch (e) {
            console.warn('Failed to rasterize inline SVG:', e);
        }
    }
}
