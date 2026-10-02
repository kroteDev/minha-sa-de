import React, { useEffect, useRef } from 'react';
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Registrar apenas os componentes necessários do Chart.js para máxima performance
Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface HealthChartProps {
  title: string;
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor?: string;
    fill?: boolean;
    tension?: number;
    borderDash?: number[];
  }[];
  yAxisLabel?: string;
  referenceLines?: {
    label: string;
    value: number;
    color: string;
  }[];
}

export const HealthChart: React.FC<HealthChartProps> = ({
  labels,
  datasets,
  yAxisLabel,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Destruir instância anterior para evitar memory leak
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: datasets.map((ds) => ({
          ...ds,
          borderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: ds.tension !== undefined ? ds.tension : 0.3,
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              boxWidth: 12,
              font: {
                family: 'system-ui, -apple-system, sans-serif',
                size: 12,
              },
              color: '#475569',
            },
          },
          tooltip: {
            backgroundColor: '#0f172a',
            padding: 10,
            cornerRadius: 8,
            titleFont: { size: 12, weight: 'bold' },
            bodyFont: { size: 12 },
          },
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(226, 232, 240, 0.6)',
            },
            ticks: {
              color: '#64748b',
              font: { size: 11 },
              maxRotation: 45,
            },
          },
          y: {
            title: {
              display: !!yAxisLabel,
              text: yAxisLabel,
              color: '#64748b',
              font: { size: 11, weight: 'bold' },
            },
            grid: {
              color: 'rgba(226, 232, 240, 0.6)',
            },
            ticks: {
              color: '#64748b',
              font: { size: 11 },
            },
          },
        },
      },
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [labels, datasets, yAxisLabel]);

  if (labels.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center rounded-xl bg-slate-50 border border-dashed border-slate-200 text-sm text-slate-400">
        Nenhum dado registrado para o período selecionado.
      </div>
    );
  }

  return (
    <div className="relative h-64 w-full">
      <canvas ref={canvasRef} />
    </div>
  );
};
