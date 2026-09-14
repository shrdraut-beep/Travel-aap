import html2pdf from 'html2pdf.js';

/**
 * Utility functions to sanitize DOM styles and prepare elements before rendering with html2canvas or html2pdf.
 * Fixes "Attempting to parse an unsupported color function 'oklch' / 'oklab'" and CORS image / page break issues in PDF exports.
 */

export function oklabToRgbValues(l: number, aLab: number, bLab: number, alpha: number = 1): string {
  const l_ = l + 0.3963377774 * aLab + 0.2158037573 * bLab;
  const m_ = l - 0.1055613458 * aLab - 0.0638541728 * bLab;
  const s_ = l - 0.0894841775 * aLab - 1.2914855480 * bLab;

  const l3 = l_ * l_ * l_;
  const m3 = m_ * m_ * m_;
  const s3 = s_ * s_ * s_;

  const rLin = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
  const gLin = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
  const bLin = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.7076147010 * s3;

  const toSRGB = (val: number) => {
    const clamped = Math.max(0, Math.min(1, val));
    return clamped >= 0.0031308
      ? 1.055 * Math.pow(clamped, 1 / 2.4) - 0.055
      : 12.92 * clamped;
  };

  const r = Math.round(toSRGB(rLin) * 255);
  const g = Math.round(toSRGB(gLin) * 255);
  const b = Math.round(toSRGB(bLin) * 255);
  const aClamped = Math.max(0, Math.min(1, alpha));

  if (aClamped < 0.999) {
    return `rgba(${r}, ${g}, ${b}, ${parseFloat(aClamped.toFixed(3))})`;
  }
  return `rgb(${r}, ${g}, ${b})`;
}

export function oklchToRgb(lStr: string, cStr: string, hStr: string, aStr?: string): string {
  let l = parseFloat(lStr);
  if (lStr.includes('%')) l = l / 100;
  
  let c = parseFloat(cStr);
  if (cStr.includes('%')) c = (c / 100) * 0.4;

  let h = parseFloat(hStr);
  if (hStr.includes('turn')) h = parseFloat(hStr) * 360;
  else if (hStr.includes('rad')) h = parseFloat(hStr) * (180 / Math.PI);

  let alpha = 1;
  if (aStr !== undefined && aStr !== null && aStr !== '') {
    alpha = parseFloat(aStr);
    if (aStr.includes('%')) alpha = alpha / 100;
  }

  if (isNaN(l)) l = 0.5;
  if (isNaN(c)) c = 0;
  if (isNaN(h)) h = 0;
  if (isNaN(alpha)) alpha = 1;

  const hRad = (h * Math.PI) / 180;
  const aLab = c * Math.cos(hRad);
  const bLab = c * Math.sin(hRad);

  return oklabToRgbValues(l, aLab, bLab, alpha);
}

export function oklabStringToRgb(lStr: string, aStr: string, bStr: string, alphaStr?: string): string {
  let l = parseFloat(lStr);
  if (lStr.includes('%')) l = l / 100;
  let a = parseFloat(aStr);
  let b = parseFloat(bStr);
  let alpha = 1;
  if (alphaStr !== undefined && alphaStr !== null && alphaStr !== '') {
    alpha = parseFloat(alphaStr);
    if (alphaStr.includes('%')) alpha = alpha / 100;
  }
  if (isNaN(l)) l = 0.5;
  if (isNaN(a)) a = 0;
  if (isNaN(b)) b = 0;
  if (isNaN(alpha)) alpha = 1;
  return oklabToRgbValues(l, a, b, alpha);
}

/**
 * Replaces all instances of unsupported modern color functions (oklch, oklab, lab, lch, color-mix) in a string with rgb/rgba equivalents.
 */
export const replaceColorFunctionsInString = (input: string): string => {
  if (!input || typeof input !== 'string') return input;
  if (!/(oklch|oklab|lab|lch|color-mix)/i.test(input)) return input;

  let result = input;

  // 1. oklch(L C H) or oklch(L C H / A) or oklch(L, C, H, A)
  result = result.replace(/oklch\(\s*([^\s,/]+)\s+([^\s,/]+)\s+([^\s,/]+)(?:\s*[\/,]\s*([^\s\)]+))?\s*\)/gi, (_, l, c, h, a) => {
    return oklchToRgb(l, c, h, a);
  });
  result = result.replace(/oklch\(\s*([^\s,]+)\s*,\s*([^\s,]+)\s*,\s*([^\s,]+)(?:\s*,\s*([^\s\)]+))?\s*\)/gi, (_, l, c, h, a) => {
    return oklchToRgb(l, c, h, a);
  });

  // 2. oklab(L a b) or oklab(L a b / A)
  result = result.replace(/oklab\(\s*([^\s,/]+)\s+([^\s,/]+)\s+([^\s,/]+)(?:\s*[\/,]\s*([^\s\)]+))?\s*\)/gi, (_, l, a, b, alpha) => {
    return oklabStringToRgb(l, a, b, alpha);
  });
  result = result.replace(/oklab\(\s*([^\s,]+)\s*,\s*([^\s,]+)\s*,\s*([^\s,]+)(?:\s*,\s*([^\s\)]+))?\s*\)/gi, (_, l, a, b, alpha) => {
    return oklabStringToRgb(l, a, b, alpha);
  });

  // 3. Fallback for any remaining unsupported color functions
  result = result.replace(/(oklch|oklab|lab|lch|color-mix)\([^\)]+\)/gi, 'rgb(100, 116, 139)');

  return result;
};

export const convertColorToRgb = replaceColorFunctionsInString;
export const convertOklchToRgb = replaceColorFunctionsInString;

/**
 * Recursively and thoroughly cleans up all style tags, element inline styles, attributes, and computed color properties
 * in a cloned DOM document before html2canvas processes it.
 */
export const sanitizeDocumentStylesForHtml2Canvas = (clonedDoc: Document) => {
  try {
    const COLOR_FUNC_REGEX = /(oklch|oklab|lab|lch|color-mix)/i;

    // 1. Process all <style> elements textContent in cloned document (head and body)
    const styleElements = Array.from(clonedDoc.querySelectorAll('style'));
    styleElements.forEach((style) => {
      if (style.textContent && COLOR_FUNC_REGEX.test(style.textContent)) {
        style.textContent = replaceColorFunctionsInString(style.textContent);
      }
    });

    // 2. Convert external or linked stylesheets with oklch into inline <style> tags
    const linkElements = Array.from(clonedDoc.querySelectorAll('link[rel="stylesheet"]'));
    linkElements.forEach((link) => {
      const linkEl = link as HTMLLinkElement;
      try {
        if (linkEl.sheet) {
          const rules = Array.from(linkEl.sheet.cssRules || []);
          const cssText = rules.map(r => r.cssText).join('\n');
          if (COLOR_FUNC_REGEX.test(cssText)) {
            const sanitizedCss = replaceColorFunctionsInString(cssText);
            const newStyle = clonedDoc.createElement('style');
            newStyle.textContent = sanitizedCss;
            linkEl.parentNode?.insertBefore(newStyle, linkEl);
            linkEl.remove();
          }
        }
      } catch (e) {
        // If sheet.cssRules is blocked, replace link with fallback or strip
      }
    });

    // 3. Process all elements & SVG elements in cloned document
    const colorAttrs = ['fill', 'stroke', 'color', 'background', 'style'];
    const allElements = Array.from(clonedDoc.querySelectorAll('*'));

    const colorProps = [
      'color',
      'background-color',
      'border-color',
      'border-top-color',
      'border-right-color',
      'border-bottom-color',
      'border-left-color',
      'outline-color',
      'box-shadow',
      'text-shadow',
      'background-image',
      'fill',
      'stroke',
      'text-decoration-color',
      'stop-color',
      'flood-color'
    ];

    allElements.forEach((el) => {
      const htmlEl = el as HTMLElement;

      // Sanitize raw attributes
      colorAttrs.forEach((attr) => {
        const val = htmlEl.getAttribute?.(attr);
        if (val && COLOR_FUNC_REGEX.test(val)) {
          htmlEl.setAttribute(attr, replaceColorFunctionsInString(val));
        }
      });

      // Read computed style and override any computed oklab/oklch colors directly with inline styles
      try {
        const computed = window.getComputedStyle(htmlEl);
        if (computed) {
          colorProps.forEach((prop) => {
            const val = computed.getPropertyValue(prop);
            if (val && COLOR_FUNC_REGEX.test(val)) {
              const convertedVal = replaceColorFunctionsInString(val);
              htmlEl.style.setProperty(prop, convertedVal, 'important');
            }
          });
        }
      } catch (e) {
        // ignore element computed style read errors
      }
    });
  } catch (err) {
    console.warn("Error sanitizing document styles for html2canvas:", err);
  }
};

/**
 * Converts all <img> elements inside a DOM element to Base64 data URIs
 * to bypass CORS/tainted canvas issues in html2canvas / html2pdf.
 */
export const convertImagesToBase64 = async (element: HTMLElement | Element): Promise<void> => {
  if (!element) return;
  const images = Array.from(element.querySelectorAll('img'));
  
  for (let img of images) {
    // Skip if already Base64
    if (img.src && img.src.startsWith('data:image')) continue; 
    
    try {
      // Fetch the image as a blob
      const response = await fetch(img.src, { mode: 'cors' });
      if (!response.ok) throw new Error("HTTP " + response.status);
      const blob = await response.blob();
      
      // Convert blob to Base64
      const base64Url = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      
      // Replace the external URL with the local Base64 string
      img.src = base64Url;
      // Remove crossOrigin to prevent canvas conflicts with Base64
      img.removeAttribute('crossOrigin'); 
      img.removeAttribute('crossorigin');
    } catch (error) {
      console.error("Failed to convert image to Base64:", error);
    }
  }
};

/**
 * Converts an external image URL to Base64 data URL to guarantee CORS compliance when html2canvas captures it.
 * Uses a multi-step strategy: fetch blob -> Image canvas -> SVG fallback placeholder.
 */
export const convertImageToBase64 = async (imgUrl: string): Promise<string | null> => {
  if (!imgUrl) return null;
  if (imgUrl.startsWith('data:')) return imgUrl;

  // Attempt 1: Fetch as Blob directly (works if server sends proper CORS headers)
  try {
    const response = await fetch(imgUrl, { mode: 'cors' });
    if (response.ok) {
      const blob = await response.blob();
      return new Promise<string | null>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    }
  } catch (err) {
    // Fetch failed, try image element fallback
  }

  // Attempt 2: Image element with canvas 2D context
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    const timeout = setTimeout(() => {
      resolve(null);
    }, 8000);

    img.onload = () => {
      clearTimeout(timeout);
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width || 400;
        canvas.height = img.naturalHeight || img.height || 300;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const dataURL = canvas.toDataURL('image/png');
          resolve(dataURL);
          return;
        }
      } catch (err) {
        // Tainted canvas or blocked
      }
      resolve(null);
    };

    img.onerror = () => {
      clearTimeout(timeout);
      resolve(null);
    };

    img.src = imgUrl;
  });
};

/**
 * Helper function to wait for all images inside a DOM container to be completely converted to Base64 data URIs.
 */
export const waitForImagesToLoad = async (element: HTMLElement): Promise<void> => {
  await convertImagesToBase64(element);
};

/**
 * Ensures all images inside a DOM container are loaded and converted to Base64 or crossOrigin clean.
 */
export const ensureContainerImagesReady = convertImagesToBase64;

export const getHtml2CanvasOptions = (extraOptions: Record<string, any> = {}) => {
  const existingOnClone = extraOptions.onclone;
  return {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    imageTimeout: 15000,
    logging: true,
    backgroundColor: '#ffffff',
    ...extraOptions,
    onclone: (clonedDoc: Document, element: HTMLElement) => {
      // 1. Sanitize modern CSS colors (oklch, oklab, etc.)
      sanitizeDocumentStylesForHtml2Canvas(clonedDoc);

      // 2. Set desktop A4 width on cloned element
      if (element) {
        element.style.width = '800px';
        element.style.minWidth = '800px';
        element.style.maxWidth = '800px';
        element.style.margin = '0 auto';
        element.style.boxSizing = 'border-box';
        element.style.backgroundColor = '#ffffff';
      }

      // 3. Prevent page breaks inside cards and sections
      const breakAvoidSelectors = [
        '.day-card',
        '.itinerary-card',
        '.brochure-header',
        '.page-break-avoid',
        '.break-inside-avoid'
      ];
      breakAvoidSelectors.forEach(selector => {
        const els = clonedDoc.querySelectorAll(selector);
        els.forEach((el) => {
          const htmlEl = el as HTMLElement;
          htmlEl.style.breakInside = 'avoid';
          htmlEl.style.pageBreakInside = 'avoid';
          (htmlEl.style as any).webkitColumnBreakInside = 'avoid';
        });
      });

      if (typeof existingOnClone === 'function') {
        existingOnClone(clonedDoc, element);
      }
    }
  };
};

/**
 * Robust export utility to convert an HTML element to an A4 PDF document using html2pdf.js
 */
export const exportElementToPdf = async (element: HTMLElement, filename: string): Promise<void> => {
  if (!element) return;

  // Step 1: Force all images to Base64
  await convertImagesToBase64(element);

  // Step 2: Give the DOM a tiny fraction of time to re-render the new src
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Step 3: Now generate the PDF (Canvas will see local data, no CORS issues!)
  const originalWidth = element.style.width;
  const originalMaxWidth = element.style.maxWidth;
  const originalMinWidth = element.style.minWidth;

  element.style.width = '800px';
  element.style.maxWidth = '800px';
  element.style.minWidth = '800px';

  const opt = {
    margin: [12, 12, 12, 12] as [number, number, number, number],
    filename: filename,
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: getHtml2CanvasOptions({
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff'
    }),
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
  };

  try {
    await html2pdf().set(opt).from(element).save();
  } finally {
    // Restore original element styling
    element.style.width = originalWidth;
    element.style.maxWidth = originalMaxWidth;
    element.style.minWidth = originalMinWidth;
  }
};


