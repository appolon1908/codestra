import { CandlestickSeries, type IChartApi, type ISeriesApi, type CandlestickData, type SeriesType } from "lightweight-charts";
import type { Candle } from "./chartTypes";

export class CandleSeriesController {
  private series?: ISeriesApi<SeriesType>;
  mount(chart: IChartApi) {
    this.series = chart.addSeries(CandlestickSeries, { upColor: "#22c55e", downColor: "#ef4444", borderVisible: false, wickUpColor: "#22c55e", wickDownColor: "#ef4444" });
  }
  setData(candles: Candle[]) { this.series?.setData(candles.map((c): CandlestickData => ({ time: c.time as CandlestickData["time"], open: c.open, high: c.high, low: c.low, close: c.close }))); }
  update(candle: Candle) { this.series?.update({ time: candle.time as CandlestickData["time"], open: candle.open, high: candle.high, low: candle.low, close: candle.close }); }
}
