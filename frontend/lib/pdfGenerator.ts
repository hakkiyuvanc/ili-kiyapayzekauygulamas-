import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { AnalysisResponse } from './api';

export const generatePDF = async (result: AnalysisResponse) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let yPos = margin;

    // Helper to add text
    const addText = (text: string, size: number, style: 'normal' | 'bold' | 'italic' = 'normal', color = '#000000', align: 'left' | 'center' | 'right' = 'left') => {
        doc.setFontSize(size);
        doc.setFont('helvetica', style); // Turkish characters might need a custom font, but helvetica is standard
        doc.setTextColor(color);

        // Simple word wrap
        const textWidth = pageWidth - (margin * 2);
        const lines = doc.splitTextToSize(text, textWidth);

        // Check page break
        if (yPos + (lines.length * size * 0.5) > pageHeight - margin) {
            doc.addPage();
            yPos = margin;
        }

        doc.text(lines, align === 'center' ? pageWidth / 2 : margin, yPos, { align });
        yPos += (lines.length * size * 0.45) + 5;
    };

    // --- HEADER ---
    addText('İLİŞKİ ANALİZ AI', 24, 'bold', '#4F46E5', 'center'); // Indigo-600
    yPos += 5;
    addText('Analiz Raporu', 16, 'normal', '#666666', 'center');
    yPos += 15;

    addText(`Tarih: ${new Date().toLocaleDateString('tr-TR')}`, 10, 'normal', '#999999', 'right');
    yPos += 10;

    // --- OVERALL SCORE ---
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 10;

    addText('GENEL SKOR', 14, 'bold', '#000000');

    let scoreColor = '#ef4444'; // Red
    if (result.overall_score >= 7) scoreColor = '#22c55e'; // Green
    else if (result.overall_score >= 5) scoreColor = '#eab308'; // Yellow

    addText(`${result.overall_score.toFixed(1)} / 10`, 32, 'bold', scoreColor, 'center');
    addText(result.summary, 12, 'italic', '#4b5563');
    yPos += 10;

    // --- METRICS ---
    addText('METRİKLER', 14, 'bold', '#000000');

    const metrics = [
        { label: 'Duygu Durumu', value: result.metrics.sentiment },
        { label: 'Empati', value: result.metrics.empathy },
        { label: 'Çatışma', value: result.metrics.conflict },
        { label: 'Biz-dili', value: result.metrics.we_language },
        { label: 'İletişim Dengesi', value: result.metrics.communication_balance },
    ];

    metrics.forEach(m => {
        const score = m.value.score;
        // Simple bar representation
        addText(`${m.label}: ${score.toFixed(0)} - ${m.value.label}`, 11);

        // Draw bar
        const barWidth = 100;
        const filledWidth = (score / 100) * barWidth;

        doc.setFillColor(230, 230, 230);
        doc.rect(margin, yPos - 3, barWidth, 4, 'F'); // Background

        // Foreground color based on score
        if (score >= 70) doc.setFillColor(34, 197, 94); // Green
        else if (score >= 40) doc.setFillColor(234, 179, 8); // Yellow
        else doc.setFillColor(239, 68, 68); // Red

        doc.rect(margin, yPos - 3, filledWidth, 4, 'F');
        yPos += 8;
    });
    yPos += 10;

    // --- CHARTS (CAPTURE FROM DOM) ---
    // Try to capture charts if they exist on screen
    try {
        const chartsContainer = document.querySelector('.recharts-wrapper') as HTMLElement; // Simple selector
        if (chartsContainer) {
            // Ideally we would capture specific IDs, but for MVP we capture visible charts or just skip if mostly text
            // Let's rely on text for now, capturing HTML is slow and buggy without specific containment.
            // We'll skip complex html2canvas for this first version to ensure reliability and speed.
        }
    } catch (e) {
        console.warn("Chart capture failed", e);
    }

    // --- INSIGHTS ---
    if (yPos > pageHeight - 60) { doc.addPage(); yPos = margin; }
    addText('İÇGÖRÜLER', 14, 'bold', '#000000');

    result.insights.forEach(insight => {
        addText(`• ${insight.title} (${insight.category})`, 12, 'bold', '#1f2937');
        addText(insight.description, 10, 'normal', '#4b5563');
        yPos += 5;
    });
    yPos += 10;

    // --- RECOMMENDATIONS ---
    if (yPos > pageHeight - 60) { doc.addPage(); yPos = margin; }
    addText('ÖNERİLER', 14, 'bold', '#000000');

    result.recommendations.forEach(rec => {
        const priorityLabel = rec.priority === 'high' ? '[YÜKSEK]' : rec.priority === 'medium' ? '[ORTA]' : '[DÜŞÜK]';
        addText(`${priorityLabel} ${rec.title}`, 11, 'bold', '#1f2937');
        addText(rec.description, 10, 'normal', '#4b5563');
        addText(`Egzersiz: ${rec.exercise}`, 10, 'italic', '#4F46E5'); // Blueish
        yPos += 8;
    });

    // Save
    doc.save('iliski-analiz-raporu.pdf');
};
