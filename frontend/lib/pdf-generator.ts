import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Generate a PDF from the rendered scrapbook container.
 * Expects child elements with the class "scrapbook-page".
 * Returns PDF as Blob for upload or download.
 */
export async function generateScrapbookPDFBlob(
  container: HTMLElement
): Promise<Blob> {
  const pages = Array.from(container.querySelectorAll<HTMLElement>('.scrapbook-page'));
  const targets = pages.length ? pages : [container];

  const pdf = new jsPDF('p', 'pt', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  for (let i = 0; i < targets.length; i++) {
    const canvas = await html2canvas(targets[i], {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
    });

    const imgData = canvas.toDataURL('image/png');
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    if (i > 0) pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight, undefined, 'FAST');
  }

  // Return PDF as Blob
  return pdf.output('blob');
}

/**
 * Generate and download a PDF from the rendered scrapbook container.
 * Expects child elements with the class "scrapbook-page".
 */
export async function generateScrapbookPDF(
  container: HTMLElement,
  filename = 'scrapbook.pdf'
): Promise<void> {
  const blob = await generateScrapbookPDFBlob(container);
  
  // Create download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
