import io
from datetime import datetime
from typing import Any

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


class ReportService:
    """Service to generate PDF reports for analyses."""

    def generate_pdf_report(
        self, analysis_data: dict[str, Any], user_name: str = "Değerli Kullanıcımız"
    ) -> bytes:
        """
        Generate a PDF report from analysis data.

        Args:
            analysis_data: The JSON analysis result.
            user_name: Name of the user for personalization.

        Returns:
            PDF file bytes.
        """
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        elements = []
        styles = getSampleStyleSheet()

        # Custom Styles
        title_style = ParagraphStyle(
            "CustomTitle",
            parent=styles["Heading1"],
            fontSize=24,
            spaceAfter=30,
            alignment=1,  # Center
        )
        subtitle_style = ParagraphStyle(
            "CustomSubtitle",
            parent=styles["Heading2"],
            fontSize=16,
            textColor=colors.gray,
            spaceAfter=20,
        )
        normal_style = styles["Normal"]

        # Header
        elements.append(Paragraph("AMOR - İlişki Analiz Raporu", title_style))
        elements.append(
            Paragraph(
                f"Hazırlayan: AMOR AI | Tarih: {datetime.now().strftime('%d.%m.%Y')}",
                subtitle_style,
            )
        )
        elements.append(Paragraph(f"Sayın {user_name},", normal_style))
        elements.append(Spacer(1, 12))
        elements.append(
            Paragraph(
                "İlişkinizin dijital röntgenini çektik ve yapay zeka destekli analiz sonuçlarınız aşağıdadır.",
                normal_style,
            )
        )
        elements.append(Spacer(1, 20))

        # Metrics Table
        metrics = analysis_data.get("metrics", {})
        data = [
            ["Metrik", "Puan", "Değerlendirme"],
            [
                "Genel Skor",
                f"{analysis_data.get('score', 0)}/100",
                self._get_score_label(analysis_data.get("score", 0)),
            ],
            ["Duygu Durumu", f"{metrics.get('sentiment', {}).get('score', 0)}/100", "Duygusal Ton"],
            ["Empati", f"{metrics.get('empathy', {}).get('score', 0)}/100", "Anlayiş Seviyesi"],
            [
                "Birliktelik Dili",
                f"{metrics.get('we_language', {}).get('score', 0)}/100",
                "Biz Odaklılık",
            ],
        ]

        table = Table(data, colWidths=[150, 100, 150])
        table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#e0e7ff")),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.midnightblue),
                    ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("BOTTOMPADDING", (0, 0), (-1, 0), 12),
                    ("BACKGROUND", (0, 1), (-1, -1), colors.white),
                    ("GRID", (0, 0), (-1, -1), 1, colors.lightgrey),
                ]
            )
        )
        elements.append(table)
        elements.append(Spacer(1, 25))

        # Insights Section
        elements.append(Paragraph("Öne Çıkan İçgörüler", styles["Heading2"]))
        for insight in analysis_data.get("insights", [])[:4]:
            elements.append(Paragraph(f"• {insight.get('title', 'İçgörü')}", styles["Heading3"]))
            elements.append(Paragraph(insight.get("description", ""), normal_style))
            elements.append(Spacer(1, 10))

        # Recommendations Section
        elements.append(Spacer(1, 10))
        elements.append(Paragraph("İlişki Koçunun Tavsiyeleri", styles["Heading2"]))
        for rec in analysis_data.get("recommendations", [])[:3]:
            elements.append(Paragraph(f"✅ {rec.get('title', 'Tavsiye')}", styles["Heading3"]))
            elements.append(Paragraph(rec.get("description", ""), normal_style))
            elements.append(Spacer(1, 10))

        # Footer
        elements.append(Spacer(1, 40))
        elements.append(
            Paragraph(
                "Bu rapor AMOR Yapay Zeka servisi tarafından oluşturulmuştur. Profesyonel psikolojik tavsiye niteliği taşımaz.",
                styles["Italic"],
            )
        )

        # Build PDF
        doc.build(elements)
        buffer.seek(0)
        return buffer.getvalue()

    def _get_score_label(self, score):
        if score >= 80:
            return "Harika"
        if score >= 60:
            return "İyi"
        if score >= 40:
            return "Orta"
        return "Geliştirilmeli"


# Singleton
_report_service = None


def get_report_service():
    global _report_service
    if _report_service is None:
        _report_service = ReportService()
    return _report_service
