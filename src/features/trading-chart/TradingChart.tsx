import { useEffect, useRef } from "react";
import { LightweightChartAdapter } from "./LightweightChartAdapter";
import { CandleSeriesController } from "./CandleSeriesController";
import { VolumeSeriesController } from "./VolumeSeriesController";
import type { Candle, ChartTheme } from "./chartTypes";

export function TradingChart({ candles, symbol, theme = "dark" }: { candles: Candle[]; symbol: string; theme?: ChartTheme }) {
  const container = useRef<HTMLDivElement>(null);
  const candleSeries = useRef<CandleSeriesController | undefined>(undefined);
  const volumeSeries = useRef<VolumeSeriesController | undefined>(undefined);
  useEffect(() => {
    if (!container.current) return;
    const adapter = new LightweightChartAdapter();
    const chart = adapter.mount(container.current, theme);
    candleSeries.current = new CandleSeriesController(); candleSeries.current.mount(chart);
    volumeSeries.current = new VolumeSeriesController(); volumeSeries.current.mount(chart);
    const observer = new ResizeObserver(() => { if (container.current) adapter.resize(container.current.clientWidth, container.current.clientHeight); }); observer.observe(container.current);
    return () => { observer.disconnect(); candleSeries.current = undefined; volumeSeries.current = undefined; adapter.remove(); };
  }, [theme]);
  useEffect(() => {
    candleSeries.current?.setData(candles);
    volumeSeries.current?.setData(candles);
  }, [candles]);
  return <div ref={container} role="img" aria-label={`${symbol} candlestick chart`} style={{ width: "100%", minHeight: 360 }} />;
}
