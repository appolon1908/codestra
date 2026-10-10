import { HistogramSeries, type IChartApi, type ISeriesApi, type SeriesType } from "lightweight-charts";
import type { Candle } from "./chartTypes";

export class VolumeSeriesController {
  private series?: ISeriesApi<SeriesType>;
  mount(chart: IChartApi) { this.series = chart.addSeries(HistogramSeries, { priceFormat: { type: "volume" }, priceScaleId: "" }); this.series?.priceScale().applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } }); }
  setData(candles: Candle[]) { this.series?.setData(candles.filter((c) => c.volume != null).map((c) => ({ time: c.time as never, value: c.volume as number, color: c.close >= c.open ? "#22c55e88" : "#ef444488" }))); }
}
