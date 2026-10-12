import React, { useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist-min';
import { Candle } from '../types';

interface CandleChartProps {
  candles: Candle[];
  title?: string;
  showVolume?: boolean;
}

export const CandleChart: React.FC<CandleChartProps> = ({
  candles,
  title = 'Fiyat Grafiği & İndikatör Katmanları',
  showVolume = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !candles || candles.length === 0) return;

    const dates = candles.map((c) => c.date);
    const opens = candles.map((c) => c.open);
    const highs = candles.map((c) => c.high);
    const lows = candles.map((c) => c.low);
    const closes = candles.map((c) => c.close);
    const volumes = candles.map((c) => c.volume);

    // Calculate EMA 20 & EMA 50
    const calcEMA = (data: number[], span: number) => {
      const k = 2 / (span + 1);
      const ema = [data[0]];
      for (let i = 1; i < data.length; i++) {
        ema.push(data[i] * k + ema[i - 1] * (1 - k));
      }
      return ema;
    };
    const ema20 = calcEMA(closes, 20);
    const ema50 = calcEMA(closes, 50);

    const candleTrace: Plotly.Data = {
      type: 'candlestick',
      x: dates,
      open: opens,
      high: highs,
      low: lows,
      close: closes,
      name: 'OHLC',
      increasing: { line: { color: '#00ff88', width: 1.2 }, fillcolor: '#00ff88' },
      decreasing: { line: { color: '#ff3366', width: 1.2 }, fillcolor: '#ff3366' },
      xaxis: 'x',
      yaxis: 'y',
    };

    const ema20Trace: Plotly.Data = {
      type: 'scatter',
      mode: 'lines',
      x: dates,
      y: ema20,
      name: 'EMA 20',
      line: { color: '#00e5ff', width: 1.5 },
      xaxis: 'x',
      yaxis: 'y',
    };

    const ema50Trace: Plotly.Data = {
      type: 'scatter',
      mode: 'lines',
      x: dates,
      y: ema50,
      name: 'EMA 50',
      line: { color: '#ffb800', width: 1.5 },
      xaxis: 'x',
      yaxis: 'y',
    };

    const volumeColors = closes.map((c, i) =>
      i === 0 || c >= opens[i] ? 'rgba(0, 255, 136, 0.4)' : 'rgba(255, 51, 102, 0.4)'
    );

    const volumeTrace: Plotly.Data = {
      type: 'bar',
      x: dates,
      y: volumes,
      name: 'Hacim',
      marker: { color: volumeColors },
      xaxis: 'x',
      yaxis: 'y2',
    };

    const data: Plotly.Data[] = [candleTrace, ema20Trace, ema50Trace];
    if (showVolume) {
      data.push(volumeTrace);
    }

    const layout: Partial<Plotly.Layout> = {
      title: {
        text: title,
        font: { color: '#94a3b8', size: 13, family: 'JetBrains Mono, monospace' },
        x: 0.02,
        y: 0.96,
      },
      dragmode: 'zoom',
      showlegend: true,
      legend: {
        orientation: 'h',
        x: 0.02,
        y: 1.05,
        font: { color: '#cbd5e1', size: 11, family: 'JetBrains Mono, monospace' },
      },
      margin: { l: 45, r: 25, t: 35, b: 35 },
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      xaxis: {
        autorange: true,
        rangeslider: { visible: false },
        type: 'date',
        gridcolor: 'rgba(255, 255, 255, 0.05)',
        tickfont: { color: '#64748b', size: 10, family: 'JetBrains Mono, monospace' },
        zerolinecolor: 'rgba(255, 255, 255, 0.08)',
      },
      yaxis: {
        autorange: true,
        type: 'linear',
        domain: showVolume ? [0.22, 1] : [0, 1],
        gridcolor: 'rgba(255, 255, 255, 0.05)',
        tickfont: { color: '#64748b', size: 10, family: 'JetBrains Mono, monospace' },
        zerolinecolor: 'rgba(255, 255, 255, 0.08)',
      },
      yaxis2: showVolume
        ? {
            domain: [0, 0.18],
            showgrid: false,
            zeroline: false,
            tickfont: { color: '#475569', size: 9 },
          }
        : undefined,
    };

    const config: Partial<Plotly.Config> = {
      responsive: true,
      displayModeBar: false,
    };

    Plotly.newPlot(containerRef.current, data, layout, config);

    const handleResize = () => {
      if (containerRef.current) {
        Plotly.Plots.resize(containerRef.current);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [candles, title, showVolume]);

  return (
    <div className="w-full h-[400px] relative rounded-lg overflow-hidden bg-[#090d14]/70 border border-slate-800/80">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
};
