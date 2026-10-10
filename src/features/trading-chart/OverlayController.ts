import { LineSeries, type IChartApi, type ISeriesApi, type SeriesType } from "lightweight-charts";
import type { ChartOverlay } from "./chartTypes";

export class OverlayController {
  private series?: ISeriesApi<SeriesType>;
  mount(chart: IChartApi) { this.series = chart.addSeries(LineSeries, { color: "#facc15", lineWidth: 1, lastValueVisible: false, priceLineVisible: false }); }
  setOverlays(overlays: ChartOverlay[]) { this.series?.setData(overlays.map((o) => ({ time: Math.floor(Date.now() / 1000) as never, value: o.price }))); }
}
