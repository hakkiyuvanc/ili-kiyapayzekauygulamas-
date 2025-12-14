'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type AnalysisResponse } from '@/lib/api';
import { Heart, Zap, AlertTriangle, Users, Scale } from 'lucide-react';
import { RadialBarChart, RadialBar, Legend, ResponsiveContainer } from 'recharts';

interface AnalysisResultProps {
  result: AnalysisResponse;
}

export default function AnalysisResult({ result }: AnalysisResultProps) {
  const getScoreColor = (score: number) => {
    if (score >= 7) return 'text-green-600';
    if (score >= 5) return 'text-yellow-600';
    return 'text-red-600';
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
        return <Zap className="w-5 h-5" />;
      case 'communication_balance':
        return <Scale className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const getMetricTitle = (metricName: string) => {
    const titles: Record<string, string> = {
      sentiment: 'Duygu Durumu',
      empathy: 'Empati',
      conflict: 'Çatışma',
      we_language: 'Biz-dili',
      communication_balance: 'İletişim Dengesi',
    };
    return titles[metricName] || metricName;
  };

  const chartData = [
    {
      name: 'Genel Skor',
      score: result.overall_score * 10,
      fill: result.overall_score >= 7 ? '#22c55e' : result.overall_score >= 5 ? '#eab308' : '#ef4444',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Genel İlişki Skoru</CardTitle>
        </CardHeader>
        <CardContent>
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
                  fill={chartData[0].fill}
                />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="text-center -mt-12">
              <div className={`text-5xl font-bold ${getScoreColor(result.overall_score)}`}>
                {result.overall_score.toFixed(1)}
              </div>
              <div className="text-gray-500 text-sm">/ 10</div>
            </div>
          </div>
          <p className="text-center text-gray-600 mt-4">{result.summary}</p>
        </CardContent>
      </Card>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(result.metrics).map(([key, metric]) => (
          <Card key={key}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                    {getMetricIcon(key)}
                  </div>
                  <span className="font-semibold">{getMetricTitle(key)}</span>
                </div>
                <span className="text-lg font-bold">{metric.score.toFixed(0)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className={`h-2 rounded-full ${
                    metric.score >= 70
                      ? 'bg-green-500'
                      : metric.score >= 40
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${metric.score}%` }}
                />
              </div>
              <span className="text-sm text-gray-600">{metric.label}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle>İçgörüler</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {result.insights.map((insight, index) => (
            <div key={index} className="flex gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl">{insight.icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold">{insight.title}</span>
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                    {insight.category}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{insight.description}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Öneriler</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {result.recommendations.map((rec, index) => (
            <div key={index} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">{rec.title}</h4>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    rec.priority === 'high'
                      ? 'bg-red-100 text-red-700'
                      : rec.priority === 'medium'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {rec.priority === 'high'
                    ? 'Yüksek'
                    : rec.priority === 'medium'
                    ? 'Orta'
                    : 'Düşük'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
              <div className="bg-blue-50 p-3 rounded text-sm">
                <strong>Egzersiz:</strong> {rec.exercise}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
