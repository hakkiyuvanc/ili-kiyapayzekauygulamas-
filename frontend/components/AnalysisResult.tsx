'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type AnalysisResponse } from '@/lib/api';
import { Heart, AlertTriangle, Users, Scale, Download, Sparkles, MessageCircleHeart } from 'lucide-react';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';
import OutcomeCharts from './OutcomeCharts';
import { generatePDF } from '@/lib/pdfGenerator';
import { useState } from 'react';

interface AnalysisResultProps {
  result: AnalysisResponse;
}

export default function AnalysisResult({ result }: AnalysisResultProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await generatePDF(result);
    } catch (error) {
      console.error('PDF generation failed', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 7) return 'text-[#22C55E]'; // Green for high
    if (score >= 5) return 'text-[#FF7F7F]'; // Coral for medium
    return 'text-[#B76E79]'; // Rose gold for needs work
  };

  const getMetricIcon = (metricName: string) => {
    switch (metricName) {
      case 'sentiment':
        return <Heart className="w-5 h-5" />;
      case 'empathy':
        return <Users className="w-5 h-5" />;
      case 'conflict':
        return <AlertTriangle className="w-5 h-5" />;
      case 'we_language':
        return <Sparkles className="w-5 h-5" />;
      case 'communication_balance':
        return <Scale className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const getMetricTitle = (metricName: string) => {
    const titles: Record<string, string> = {
      sentiment: 'Duygu Durumu 💕',
      empathy: 'Empati 🤗',
      conflict: 'Çatışma ⚡',
      we_language: 'Biz-dili 💬',
      communication_balance: 'İletişim Dengesi ⚖️',
    };
    return titles[metricName] || metricName;
  };

  const chartData = [
    {
      name: 'Genel Skor',
      score: result.overall_score * 10,
      fill: result.overall_score >= 7 ? '#22c55e' : result.overall_score >= 5 ? '#FF7F7F' : '#B76E79',
    },
  ];

  const chartFillColor = chartData[0]?.fill ?? '#B76E79';

  return (
    <div className="space-y-6 safe-bottom px-4 bg-romantic-gradient-soft min-h-screen py-8">
      {/* AMOR AI Header */}
      <div className="text-center mb-6 animate-fadeIn">
        <h1 className="amor-logo text-2xl mb-1">AMOR AI</h1>
        <p className="text-[#6B3F3F] text-sm">İlişki Analiz Raporu</p>
      </div>

      {/* Overall Score */}
      <div className="ios-card-elevated animate-slideUp">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#331A1A]">Genel İlişki Skoru 💗</h2>
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="p-2 bg-[#FFF0F5] hover:bg-[#FFB6C1]/30 rounded-xl transition-colors disabled:opacity-50 active:scale-95"
              title="Raporu İndir (PDF)"
            >
              <Download className={`w-5 h-5 text-[#B76E79] ${isDownloading ? 'animate-pulse' : ''}`} />
            </button>
          </div>
          <div className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={200}>
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="60%"
                outerRadius="80%"
                data={chartData}
                startAngle={180}
                endAngle={0}
              >
                <RadialBar
                  dataKey="score"
                  cornerRadius={10}
                  fill={chartFillColor}
                />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="text-center -mt-12">
              <div className={`text-6xl font-bold ${getScoreColor(result.overall_score)}`}>
                {result.overall_score.toFixed(1)}
              </div>
              <div className="text-[#6B3F3F] text-sm mt-1">/ 10</div>
            </div>
          </div>
          <p className="text-center text-[#331A1A] mt-6 leading-relaxed">{result.summary}</p>
        </div>
      </div>

      {/* Outcome Charts */}
      <div className="animate-fadeIn" style={{ animationDelay: '0.1s' }}>
        <OutcomeCharts
          stats={result.conversation_stats}
          metrics={{
            sentiment: result.metrics.sentiment,
            empathy: result.metrics.empathy,
            conflict: result.metrics.conflict,
            we_language: result.metrics.we_language,
            communication_balance: result.metrics.communication_balance,
          }}
        />
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
        {Object.entries(result.metrics).map(([key, metric], index) => (
          <div key={key} className="ios-card p-4 animate-slideUp" style={{ animationDelay: `${0.3 + index * 0.05}s` }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#FFF0F5] rounded-xl text-[#B76E79]">
                  {getMetricIcon(key)}
                </div>
                <span className="font-semibold text-[#331A1A]">{getMetricTitle(key)}</span>
              </div>
              <span className="text-xl font-bold text-[#B76E79]">{metric.score.toFixed(0)}</span>
            </div>
            <div className="w-full bg-[#FFF0F5] rounded-full h-2.5 mb-2">
              <div
                className={`h-2.5 rounded-full transition-all duration-500 ${metric.score >= 70
                  ? 'bg-gradient-to-r from-[#22C55E] to-[#10B981]'
                  : metric.score >= 40
                    ? 'bg-gradient-to-r from-[#FF7F7F] to-[#FFB6C1]'
                    : 'bg-gradient-to-r from-[#B76E79] to-[#FFB6C1]'
                  }`}
                style={{ width: `${metric.score}%` }}
              />
            </div>
            <span className="text-sm text-[#6B3F3F]">{metric.label}</span>
          </div>
        ))}
      </div>

      {/* Insights */}
      <div className="ios-card-elevated animate-fadeIn" style={{ animationDelay: '0.4s' }}>
        <div className="p-6">
          <h3 className="text-xl font-bold text-[#331A1A] mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#FFB6C1]" />
            İçgörüler
          </h3>
          <div className="space-y-3">
            {result.insights.map((insight, index) => (
              <div key={index} className="flex gap-3 p-4 bg-[#FFF0F5] rounded-xl border border-[#FFB6C1]/20">
                <div className="text-2xl">{insight.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-semibold text-[#331A1A]">{insight.title}</span>
                    <span className="text-xs px-2 py-1 bg-white text-[#B76E79] rounded-lg border border-[#FFB6C1]/30">
                      {insight.category}
                    </span>
                  </div>
                  <p className="text-sm text-[#6B3F3F] leading-relaxed">{insight.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="ios-card-elevated animate-fadeIn" style={{ animationDelay: '0.5s' }}>
        <div className="p-6">
          <h3 className="text-xl font-bold text-[#331A1A] mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-[#FFB6C1] fill-[#FFB6C1]" />
            Öneriler
          </h3>
          <div className="space-y-4">
            {result.recommendations.map((rec, index) => (
              <div key={index} className="p-4 border-2 border-[#FFB6C1]/30 rounded-xl bg-white">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-[#331A1A]">{rec.title}</h4>
                  <span
                    className={`text-xs px-2 py-1 rounded-lg ${rec.priority === 'high'
                      ? 'bg-[#FFB6C1] text-white'
                      : rec.priority === 'medium'
                        ? 'bg-[#FFF0F5] text-[#B76E79]'
                        : 'bg-white text-[#6B3F3F] border border-[#FFB6C1]/30'
                      }`}
                  >
                    {rec.priority === 'high'
                      ? '🌹 Yüksek'
                      : rec.priority === 'medium'
                        ? '💗 Orta'
                        : '💕 Düşük'}
                  </span>
                </div>
                <p className="text-sm text-[#6B3F3F] mb-3 leading-relaxed">{rec.description}</p>
                <div className="bg-[#FFF0F5] p-3 rounded-xl text-sm border border-[#FFB6C1]/20">
                  <strong className="text-[#B76E79]">Egzersiz:</strong>{' '}
                  <span className="text-[#331A1A]">{rec.exercise}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Coach CTA */}
      <div className="ios-card-elevated bg-gradient-to-br from-[#B76E79] to-[#FF7F7F] text-white border-none animate-fadeIn" style={{ animationDelay: '0.6s' }}>
        <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <MessageCircleHeart className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-1 flex items-center gap-2">
                <span className="amor-logo">AMOR AI</span> Koçuna Danış
              </h3>
              <p className="text-white/90 text-sm">
                Bu analiz hakkında detaylı sorular sor ve kişisel tavsiyeler al 💬
              </p>
            </div>
          </div>
          <a
            href={`/chat?analysis_id=${result.analysis_id || ''}`}
            className="ios-button bg-white text-[#B76E79] hover:bg-white/90 px-6 py-3 font-semibold shadow-xl whitespace-nowrap"
          >
            Koç ile Konuş 💗
          </a>
        </div>
      </div>
    </div>
  );
}
