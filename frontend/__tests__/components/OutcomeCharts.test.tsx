import React from 'react';
import { render, screen } from '@testing-library/react';
import OutcomeCharts from '@/components/OutcomeCharts';

// Mock recharts components
jest.mock('recharts', () => ({
    PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
    Pie: () => <div data-testid="pie" />,
    Cell: () => <div data-testid="cell" />,
    Tooltip: () => <div data-testid="tooltip" />,
    Legend: () => <div data-testid="legend" />,
    ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
    RadarChart: ({ children }: any) => <div data-testid="radar-chart">{children}</div>,
    PolarGrid: () => <div data-testid="polar-grid" />,
    PolarAngleAxis: () => <div data-testid="polar-angle-axis" />,
    PolarRadiusAxis: () => <div data-testid="polar-radius-axis" />,
    Radar: () => <div data-testid="radar" />,
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    },
}));

describe('OutcomeCharts', () => {
    const mockStats = {
        message_distribution: {
            'User 1': { count: 10, percentage: 50 },
            'User 2': { count: 10, percentage: 50 },
        },
    };

    const mockMetrics = {
        sentiment: { score: 75 },
        empathy: { score: 80 },
        conflict: { score: 20 },
        we_language: { score: 60 },
        communication_balance: { score: 70 },
    };

    it('renders nothing when no stats or metrics provided', () => {
        const { container } = render(<OutcomeCharts />);
        expect(container.firstChild).toBeNull();
    });

    it('renders pie chart when stats are provided', () => {
        render(<OutcomeCharts stats={mockStats} />);

        expect(screen.getByText('Mesaj Dağılımı')).toBeInTheDocument();
        expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    });

    it('renders radar chart when metrics are provided', () => {
        render(<OutcomeCharts metrics={mockMetrics} />);

        expect(screen.getByText('İlişki Dengesi')).toBeInTheDocument();
        expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
    });

    it('renders both charts when both stats and metrics are provided', () => {
        render(<OutcomeCharts stats={mockStats} metrics={mockMetrics} />);

        expect(screen.getByText('Mesaj Dağılımı')).toBeInTheDocument();
        expect(screen.getByText('İlişki Dengesi')).toBeInTheDocument();
    });

    it('transforms message distribution data correctly', () => {
        const { container } = render(<OutcomeCharts stats={mockStats} />);

        // Chart should be rendered with data
        expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    });

    it('transforms metrics data correctly for radar chart', () => {
        const { container } = render(<OutcomeCharts metrics={mockMetrics} />);

        // Radar chart should be rendered
        expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
    });

    it('handles empty stats gracefully', () => {
        const emptyStats = {
            message_distribution: {},
        };

        const { container } = render(<OutcomeCharts stats={emptyStats} />);

        // Should not render pie chart if no data
        expect(screen.queryByText('Mesaj Dağılımı')).not.toBeInTheDocument();
    });

    it('applies correct chart styling classes', () => {
        render(<OutcomeCharts stats={mockStats} metrics={mockMetrics} />);

        // Check for grid layout
        const gridContainer = screen.getByText('Mesaj Dağılımı').closest('.grid');
        expect(gridContainer).toBeInTheDocument();
    });
});
