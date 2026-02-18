"""Rapor Servisi — PDF & HTML Export

Analiz sonuçlarını profesyonel görünümlü PDF ve HTML olarak dışa aktarır.
Psikolojik profil (Bağlanma Stili, Sevgi Dili) ve Gottman metrikleri dahil.
"""

import io
from datetime import datetime
from typing import Any

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import HRFlowable, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

# Brand colors
ROSE_GOLD = colors.HexColor("#B76E79")
BLUSH = colors.HexColor("#FFB6C1")
CORAL = colors.HexColor("#FF7F7F")
CREAM = colors.HexColor("#FFF5EE")
BURGUNDY = colors.HexColor("#800020")
LIGHT_PINK = colors.HexColor("#FFF0F5")
DARK_TEXT = colors.HexColor("#331A1A")
MUTED_TEXT = colors.HexColor("#6B3F3F")
GREEN = colors.HexColor("#4CAF50")
ORANGE = colors.HexColor("#FF9800")
RED = colors.HexColor("#F44336")


def _score_color(score: float) -> Any:
    if score >= 70:
        return GREEN
    if score >= 45:
        return ORANGE
    return RED


def _score_label(score: float) -> str:
    if score >= 80:
        return "Harika ✨"
    if score >= 60:
        return "İyi 👍"
    if score >= 40:
        return "Orta 📈"
    return "Geliştirilmeli 💪"


class ReportService:
    """PDF ve HTML rapor üretici."""

    # ------------------------------------------------------------------
    # PDF Export
    # ------------------------------------------------------------------

    def generate_pdf_report(
        self, analysis_data: dict[str, Any], user_name: str = "Değerli Kullanıcımız"
    ) -> bytes:
        """
        Kapsamlı PDF raporu oluştur.

        Args:
            analysis_data: Analiz sonuçları (metrics, insights, recommendations,
                           psychology_profile, gottman_report, heatmap vb.)
            user_name: Kişiselleştirme için kullanıcı adı

        Returns:
            PDF dosyası (bytes)
        """
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=20 * mm,
            leftMargin=20 * mm,
            topMargin=20 * mm,
            bottomMargin=20 * mm,
        )
        styles = getSampleStyleSheet()
        elements = []

        # ── Custom styles ──────────────────────────────────────────────
        title_style = ParagraphStyle(
            "AmorTitle",
            parent=styles["Heading1"],
            fontSize=26,
            textColor=ROSE_GOLD,
            spaceAfter=4,
            alignment=1,
            fontName="Helvetica-Bold",
        )
        subtitle_style = ParagraphStyle(
            "AmorSubtitle",
            parent=styles["Normal"],
            fontSize=11,
            textColor=MUTED_TEXT,
            spaceAfter=6,
            alignment=1,
        )
        section_style = ParagraphStyle(
            "AmorSection",
            parent=styles["Heading2"],
            fontSize=14,
            textColor=ROSE_GOLD,
            spaceBefore=14,
            spaceAfter=6,
            fontName="Helvetica-Bold",
        )
        body_style = ParagraphStyle(
            "AmorBody",
            parent=styles["Normal"],
            fontSize=10,
            textColor=DARK_TEXT,
            spaceAfter=4,
            leading=15,
        )
        bullet_style = ParagraphStyle(
            "AmorBullet",
            parent=styles["Normal"],
            fontSize=10,
            textColor=DARK_TEXT,
            spaceAfter=3,
            leftIndent=12,
            leading=14,
        )
        muted_style = ParagraphStyle(
            "AmorMuted",
            parent=styles["Normal"],
            fontSize=9,
            textColor=MUTED_TEXT,
            spaceAfter=3,
            leading=13,
        )

        # ── Header ─────────────────────────────────────────────────────
        elements.append(Paragraph("💗 AMOR AI", title_style))
        elements.append(Paragraph("İlişki Analiz Raporu", subtitle_style))
        elements.append(
            Paragraph(
                f"Hazırlanma Tarihi: {datetime.now().strftime('%d %B %Y')}",
                subtitle_style,
            )
        )
        elements.append(HRFlowable(width="100%", thickness=1.5, color=BLUSH, spaceAfter=10))
        elements.append(Paragraph(f"Sayın {user_name},", body_style))
        elements.append(
            Paragraph(
                "İlişkinizin yapay zeka destekli kapsamlı analizi aşağıda sunulmaktadır. "
                "Bu rapor, iletişim örüntülerinizi, duygusal dinamiklerinizi ve "
                "psikolojik profilinizi içermektedir.",
                body_style,
            )
        )
        elements.append(Spacer(1, 8))

        # ── Overall Score ───────────────────────────────────────────────
        overall = analysis_data.get("score", analysis_data.get("overall_score", 0))
        if overall:
            elements.append(Paragraph("📊 Genel Skor", section_style))
            score_data = [["Genel İlişki Skoru", f"{overall}/100", _score_label(overall)]]
            score_table = Table(score_data, colWidths=[120, 80, 120])
            score_table.setStyle(
                TableStyle(
                    [
                        ("BACKGROUND", (0, 0), (-1, -1), LIGHT_PINK),
                        ("TEXTCOLOR", (0, 0), (-1, -1), DARK_TEXT),
                        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                        ("FONTNAME", (0, 0), (-1, -1), "Helvetica-Bold"),
                        ("FONTSIZE", (0, 0), (-1, -1), 12),
                        ("TOPPADDING", (0, 0), (-1, -1), 10),
                        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
                        ("ROUNDEDCORNERS", [8, 8, 8, 8]),
                        ("BOX", (0, 0), (-1, -1), 1, BLUSH),
                        ("TEXTCOLOR", (1, 0), (1, 0), _score_color(overall)),
                    ]
                )
            )
            elements.append(score_table)
            elements.append(Spacer(1, 8))

        # ── Metrics Table ───────────────────────────────────────────────
        metrics = analysis_data.get("metrics", {})
        if metrics:
            elements.append(Paragraph("📈 İletişim Metrikleri", section_style))

            metric_rows = [["Metrik", "Puan", "Değerlendirme"]]
            metric_map = {
                "sentiment": "Duygu Durumu",
                "empathy": "Empati",
                "conflict": "Çatışma Yönetimi",
                "we_language": "Birliktelik Dili",
                "communication_balance": "İletişim Dengesi",
            }
            for key, label in metric_map.items():
                score = metrics.get(key, {}).get("score", None)
                if score is not None:
                    metric_rows.append([label, f"{score}/100", _score_label(score)])

            if len(metric_rows) > 1:
                table = Table(metric_rows, colWidths=[150, 80, 120])
                table.setStyle(
                    TableStyle(
                        [
                            ("BACKGROUND", (0, 0), (-1, 0), ROSE_GOLD),
                            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                            ("FONTSIZE", (0, 0), (-1, 0), 10),
                            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                            ("BACKGROUND", (0, 1), (-1, -1), colors.white),
                            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, LIGHT_PINK]),
                            ("GRID", (0, 0), (-1, -1), 0.5, BLUSH),
                            ("TOPPADDING", (0, 0), (-1, -1), 7),
                            ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
                        ]
                    )
                )
                elements.append(table)
                elements.append(Spacer(1, 8))

        # ── Psychology Profile ──────────────────────────────────────────
        psych = analysis_data.get("psychology_profile")
        if psych:
            elements.append(Paragraph("🧠 Psikolojik Profil", section_style))

            attachment = psych.get("attachment_style", {})
            love_lang = psych.get("love_language", {})

            psych_data = [["Analiz", "Sonuç", "Güven"]]
            if attachment.get("style"):
                conf_pct = int(attachment.get("confidence", 0) * 100)
                psych_data.append(["Bağlanma Stili", attachment["style"], f"%{conf_pct}"])
            if love_lang.get("primary"):
                conf_pct = int(love_lang.get("confidence", 0) * 100)
                psych_data.append(["Sevgi Dili", love_lang["primary"], f"%{conf_pct}"])

            if len(psych_data) > 1:
                psych_table = Table(psych_data, colWidths=[150, 130, 70])
                psych_table.setStyle(
                    TableStyle(
                        [
                            ("BACKGROUND", (0, 0), (-1, 0), BURGUNDY),
                            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                            ("BACKGROUND", (0, 1), (-1, -1), colors.white),
                            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, LIGHT_PINK]),
                            ("GRID", (0, 0), (-1, -1), 0.5, BLUSH),
                            ("TOPPADDING", (0, 0), (-1, -1), 7),
                            ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
                        ]
                    )
                )
                elements.append(psych_table)

            # Attachment description
            if attachment.get("description"):
                elements.append(Spacer(1, 5))
                elements.append(Paragraph(f"💡 {attachment['description']}", muted_style))

            # Love language secondary
            if love_lang.get("secondary"):
                elements.append(
                    Paragraph(
                        f"İkincil Sevgi Dili: {love_lang['secondary']}",
                        muted_style,
                    )
                )
            elements.append(Spacer(1, 8))

        # ── Insights ────────────────────────────────────────────────────
        insights = analysis_data.get("insights", [])
        if insights:
            elements.append(Paragraph("💡 Öne Çıkan İçgörüler", section_style))
            for insight in insights[:5]:
                title = insight.get("title", "")
                desc = insight.get("description", "")
                if title:
                    elements.append(Paragraph(f"<b>• {title}</b>", bullet_style))
                if desc:
                    elements.append(Paragraph(f"  {desc}", muted_style))
            elements.append(Spacer(1, 6))

        # ── Recommendations ─────────────────────────────────────────────
        recs = analysis_data.get("recommendations", [])
        if recs:
            elements.append(Paragraph("✅ İlişki Koçunun Tavsiyeleri", section_style))
            for rec in recs[:4]:
                title = rec.get("title", "")
                desc = rec.get("description", "")
                exercise = rec.get("exercise", "")
                if title:
                    elements.append(Paragraph(f"<b>▸ {title}</b>", bullet_style))
                if desc:
                    elements.append(Paragraph(f"  {desc}", muted_style))
                if exercise:
                    elements.append(Paragraph(f"  🎯 Egzersiz: {exercise}", muted_style))
            elements.append(Spacer(1, 6))

        # ── Gottman Report Summary ───────────────────────────────────────
        gottman = analysis_data.get("gottman_report")
        if gottman:
            genel = gottman.get("genel_karne", {})
            health = genel.get("iliski_sagligi") or genel.get("iliskki_sagligi")
            if health:
                elements.append(Paragraph("💑 Gottman Analizi", section_style))
                elements.append(
                    Paragraph(
                        f"İlişki Sağlığı: <b>{health}/100</b>",
                        body_style,
                    )
                )
                if genel.get("ozet"):
                    elements.append(Paragraph(genel["ozet"], muted_style))
                elements.append(Spacer(1, 6))

        # ── Footer ──────────────────────────────────────────────────────
        elements.append(Spacer(1, 16))
        elements.append(HRFlowable(width="100%", thickness=0.5, color=BLUSH))
        elements.append(Spacer(1, 6))
        elements.append(
            Paragraph(
                "Bu rapor AMOR Yapay Zeka servisi tarafından oluşturulmuştur. "
                "Profesyonel psikolojik tavsiye niteliği taşımaz. "
                "Ciddi ilişki sorunları için uzman desteği alınız.",
                muted_style,
            )
        )
        elements.append(
            Paragraph(
                f"© {datetime.now().year} AMOR AI · amor.ai",
                ParagraphStyle(
                    "Footer",
                    parent=styles["Normal"],
                    fontSize=8,
                    textColor=ROSE_GOLD,
                    alignment=1,
                ),
            )
        )

        doc.build(elements)
        buffer.seek(0)
        return buffer.getvalue()

    # ------------------------------------------------------------------
    # HTML Export
    # ------------------------------------------------------------------

    def generate_html_report(
        self, analysis_data: dict[str, Any], user_name: str = "Değerli Kullanıcımız"
    ) -> str:
        """
        Profesyonel görünümlü HTML raporu oluştur.
        Tarayıcıda açılabilir veya e-posta ile gönderilebilir.

        Returns:
            HTML string
        """
        overall = analysis_data.get("score", analysis_data.get("overall_score", 0)) or 0
        metrics = analysis_data.get("metrics", {})
        psych = analysis_data.get("psychology_profile") or {}
        attachment = psych.get("attachment_style", {})
        love_lang = psych.get("love_language", {})
        insights = analysis_data.get("insights", [])[:5]
        recs = analysis_data.get("recommendations", [])[:4]
        gottman = analysis_data.get("gottman_report") or {}
        genel = gottman.get("genel_karne", {})
        gottman_health = genel.get("iliski_sagligi") or genel.get("iliskki_sagligi") or 0

        date_str = datetime.now().strftime("%d %B %Y")

        def score_bar(score: float, color: str = "#B76E79") -> str:
            return (
                f'<div style="background:#f5e6ea;border-radius:8px;height:8px;width:100%;margin-top:4px;">'
                f'<div style="background:{color};border-radius:8px;height:8px;width:{min(score,100)}%;"></div>'
                f"</div>"
            )

        def score_badge(score: float) -> str:
            label = _score_label(score)
            if score >= 70:
                bg, fg = "#e8f5e9", "#2e7d32"
            elif score >= 45:
                bg, fg = "#fff3e0", "#e65100"
            else:
                bg, fg = "#fce4ec", "#c62828"
            return (
                f'<span style="background:{bg};color:{fg};padding:2px 10px;'
                f'border-radius:20px;font-size:12px;font-weight:600;">{label}</span>'
            )

        # Metrics rows
        metric_map = {
            "sentiment": "💬 Duygu Durumu",
            "empathy": "🤝 Empati",
            "conflict": "⚡ Çatışma Yönetimi",
            "we_language": "💑 Birliktelik Dili",
            "communication_balance": "⚖️ İletişim Dengesi",
        }
        metrics_html = ""
        for key, label in metric_map.items():
            score = metrics.get(key, {}).get("score")
            if score is not None:
                metrics_html += f"""
                <div style="margin-bottom:14px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                        <span style="font-weight:600;color:#331A1A;">{label}</span>
                        <div style="display:flex;align-items:center;gap:8px;">
                            <span style="font-weight:700;color:#B76E79;font-size:16px;">{score}</span>
                            {score_badge(score)}
                        </div>
                    </div>
                    {score_bar(score)}
                </div>"""

        # Insights HTML
        insights_html = ""
        for ins in insights:
            insights_html += f"""
            <div style="background:#FFF0F5;border-left:3px solid #B76E79;padding:10px 14px;border-radius:0 8px 8px 0;margin-bottom:10px;">
                <div style="font-weight:600;color:#331A1A;margin-bottom:3px;">{ins.get('title','')}</div>
                <div style="color:#6B3F3F;font-size:13px;">{ins.get('description','')}</div>
            </div>"""

        # Recommendations HTML
        recs_html = ""
        for rec in recs:
            recs_html += f"""
            <div style="background:#f0fff4;border-left:3px solid #4CAF50;padding:10px 14px;border-radius:0 8px 8px 0;margin-bottom:10px;">
                <div style="font-weight:600;color:#1b5e20;margin-bottom:3px;">✅ {rec.get('title','')}</div>
                <div style="color:#2e7d32;font-size:13px;">{rec.get('description','')}</div>
                {f'<div style="color:#388e3c;font-size:12px;margin-top:4px;">🎯 {rec.get("exercise","")}</div>' if rec.get("exercise") else ""}
            </div>"""

        # Psychology HTML
        psych_html = ""
        if attachment.get("style"):
            conf = int(attachment.get("confidence", 0) * 100)
            psych_html += f"""
            <div style="background:#FFF0F5;border-radius:12px;padding:14px;margin-bottom:10px;">
                <div style="font-weight:700;color:#800020;margin-bottom:4px;">🔗 Bağlanma Stili</div>
                <div style="font-size:20px;font-weight:700;color:#B76E79;">{attachment['style']}</div>
                <div style="font-size:12px;color:#6B3F3F;">Güven: %{conf}</div>
                <div style="font-size:13px;color:#6B3F3F;margin-top:6px;">{attachment.get('description','')}</div>
            </div>"""
        if love_lang.get("primary"):
            conf = int(love_lang.get("confidence", 0) * 100)
            secondary = love_lang.get("secondary", "")
            psych_html += f"""
            <div style="background:#FFF0F5;border-radius:12px;padding:14px;margin-bottom:10px;">
                <div style="font-weight:700;color:#800020;margin-bottom:4px;">💝 Sevgi Dili</div>
                <div style="font-size:20px;font-weight:700;color:#B76E79;">{love_lang['primary']}</div>
                <div style="font-size:12px;color:#6B3F3F;">Güven: %{conf}{f' · İkincil: {secondary}' if secondary else ''}</div>
            </div>"""

        html = f"""<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AMOR AI — İlişki Analiz Raporu</title>
<style>
  body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #FFF5EE; margin: 0; padding: 20px; color: #331A1A; }}
  .container {{ max-width: 680px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 32px rgba(183,110,121,0.15); }}
  .header {{ background: linear-gradient(135deg, #B76E79 0%, #FF7F7F 100%); padding: 36px 32px; text-align: center; color: white; }}
  .header h1 {{ margin: 0; font-size: 32px; letter-spacing: -0.5px; }}
  .header p {{ margin: 6px 0 0; opacity: 0.85; font-size: 14px; }}
  .section {{ padding: 24px 32px; border-bottom: 1px solid #FFB6C1; }}
  .section:last-child {{ border-bottom: none; }}
  .section-title {{ font-size: 16px; font-weight: 700; color: #B76E79; margin-bottom: 16px; }}
  .score-big {{ text-align: center; padding: 20px; background: #FFF0F5; border-radius: 16px; }}
  .score-big .num {{ font-size: 56px; font-weight: 800; color: #B76E79; line-height: 1; }}
  .score-big .label {{ font-size: 14px; color: #6B3F3F; margin-top: 4px; }}
  .footer {{ background: #FFF0F5; padding: 20px 32px; text-align: center; font-size: 12px; color: #6B3F3F; }}
  .footer a {{ color: #B76E79; text-decoration: none; }}
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <h1>💗 AMOR AI</h1>
    <p>İlişki Analiz Raporu · {date_str}</p>
    <p style="margin-top:8px;font-size:16px;">Sayın {user_name}</p>
  </div>

  {'<div class="section"><div class="section-title">📊 Genel Skor</div><div class="score-big"><div class="num">' + str(overall) + '</div><div class="label">/100 · ' + _score_label(overall) + '</div>' + score_bar(overall) + '</div></div>' if overall else ''}

  {'<div class="section"><div class="section-title">📈 İletişim Metrikleri</div>' + metrics_html + '</div>' if metrics_html else ''}

  {'<div class="section"><div class="section-title">🧠 Psikolojik Profil</div>' + psych_html + '</div>' if psych_html else ''}

  {'<div class="section"><div class="section-title">💡 Öne Çıkan İçgörüler</div>' + insights_html + '</div>' if insights_html else ''}

  {'<div class="section"><div class="section-title">✅ Tavsiyeler</div>' + recs_html + '</div>' if recs_html else ''}

  {'<div class="section"><div class="section-title">💑 Gottman Analizi</div><div style="font-size:18px;font-weight:700;color:#B76E79;">İlişki Sağlığı: ' + str(gottman_health) + '/100</div>' + (f'<div style="color:#6B3F3F;font-size:13px;margin-top:6px;">{genel.get("ozet","")}</div>' if genel.get("ozet") else "") + '</div>' if gottman_health else ''}

  <div class="footer">
    Bu rapor <a href="https://amor.ai">AMOR AI</a> tarafından oluşturulmuştur.<br>
    Profesyonel psikolojik tavsiye niteliği taşımaz. © {datetime.now().year} AMOR AI
  </div>
</div>
</body>
</html>"""

        return html


# Singleton
_report_service = None


def get_report_service():
    global _report_service
    if _report_service is None:
        _report_service = ReportService()
    return _report_service
