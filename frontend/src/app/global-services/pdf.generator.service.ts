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
            await document.fonts.ready;

            const clone = element.cloneNode(true) as HTMLElement;
            const temp = document.createElement('div');
            temp.style.position = 'fixed';
            temp.style.left = '-10000px';
            temp.style.top = '0';
            temp.appendChild(clone);
            document.body.appendChild(temp);

            await this.preprocessAllImages(clone);

            // Höhere Auflösung
            const scale = Math.min(4, window.devicePixelRatio * 2);

            const canvas = await html2canvas(clone, {
                scale,
                useCORS: true,
                allowTaint: false,
                logging: false,
                backgroundColor: '#FFFFFF'
            });

            document.body.removeChild(temp);

            const imgData = canvas.toDataURL('image/png');

            // Dynamische Orientierung
            const isLandscape = canvas.width >= canvas.height;
            const pdf = new jsPDF({
                orientation: isLandscape ? 'landscape' : 'portrait',
                unit: 'px',
                format: [canvas.width, canvas.height],
                compress: false
            });

            // Bilddimensionen berechnen (Seite proportional füllen, ohne Stretch)
            const pageW = pdf.internal.pageSize.getWidth();
            const pageH = pdf.internal.pageSize.getHeight();

            const imgW = canvas.width;
            const imgH = canvas.height;
            const ratio = Math.min(pageW / imgW, pageH / imgH);

            const renderW = imgW * ratio;
            const renderH = imgH * ratio;
            const offsetX = (pageW - renderW) / 2;
            const offsetY = (pageH - renderH) / 2;

            pdf.addImage(imgData, 'PNG', offsetX, offsetY, renderW, renderH, undefined, 'FAST');
            pdf.save(fileName);
        } catch (e) {
            console.error('PDF Generation Error:', e);
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
        if (img.dataset['rasterized'] === '1') return;
        img.dataset['rasterized'] = '1';
        try {
            const resp = await fetch(img.src, { cache: 'force-cache' });
            if (!resp.ok) return;

            const svgText = await resp.text();
            const blob = new Blob([svgText], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);

            const loaded = await new Promise<HTMLImageElement>((res, rej) => {
                const i = new Image();
                i.onload = () => res(i);
                i.onerror = e => rej(e);
                i.src = url;
            });

            const displayRect = img.getBoundingClientRect();

            // Zielgröße: bevorzugt sichtbare Größe, fallback natural, dann Default
            const targetW = (displayRect.width && displayRect.width > 0) ? displayRect.width : (loaded.naturalWidth || 200);
            const targetH = (displayRect.height && displayRect.height > 0) ? displayRect.height : (loaded.naturalHeight || 80);

            // Upscale nur für Qualität im Canvas, nicht für Anzeige
            const upscale = 3;
            const canvas = document.createElement('canvas');
            canvas.width = targetW * upscale;
            canvas.height = targetH * upscale;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            ctx.drawImage(loaded, 0, 0, canvas.width, canvas.height);
            URL.revokeObjectURL(url);

            const png = canvas.toDataURL('image/png');
            img.src = png;

            // Kleine Icons (≤ 96px) sollen weiter durch Tailwind-Klassen (w-6 h-6 / w-8 h-8 etc.) gesteuert werden:
            if (targetW <= 96 && targetH <= 96) {
                // Entferne evtl. alte Inline-Styles
                img.style.removeProperty('width');
                img.style.removeProperty('height');
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'contain';
            } else {
                // Größere (Logo / Header) behalten feste Breite, Höhe automatisch
                img.style.width = `${targetW}px`;
                img.style.height = 'auto';
            }
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
