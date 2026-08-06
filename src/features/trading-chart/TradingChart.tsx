import { useEffect, useRef } from "react";
import { LightweightChartAdapter } from "./LightweightChartAdapter";
import { CandleSeriesController } from "./CandleSeriesController";
import { VolumeSeriesController } from "./VolumeSeriesController";
import type { Candle, ChartTheme, UnifiedRealtimeClient } from "./chartTypes";

export function TradingChart({ candles, symbol, theme = "dark", realtime }: { candles: Candle[]; symbol: string; theme?: ChartTheme; realtime?: UnifiedRealtimeClient }) {
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!container.current) return;
    const adapter = new LightweightChartAdapter();
    const chart = adapter.mount(container.current, theme);
    const candleSeries = new CandleSeriesController(); candleSeries.mount(chart); candleSeries.setData(candles);
    const volumeSeries = new VolumeSeriesController(); volumeSeries.mount(chart); volumeSeries.setData(candles);
    const unsubscribe = realtime?.subscribe(`market.${symbol}.candle.1h`, (event) => { if (typeof event === "object" && event !== null && "candle" in event) candleSeries.update((event as { candle: Candle }).candle); });
    const observer = new ResizeObserver(() => { if (container.current) adapter.resize(container.current.clientWidth, container.current.clientHeight); }); observer.observe(container.current);
    return () => { unsubscribe?.(); observer.disconnect(); adapter.remove(); };
  }, [candles, symbol, theme, realtime]);
  return <div ref={container} role="img" aria-label={`${symbol} candlestick chart`} style={{ width: "100%", minHeight: 360 }} />;
}
