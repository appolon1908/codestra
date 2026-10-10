import { createChart, type IChartApi, type DeepPartial, type ChartOptions, type Time } from "lightweight-charts";
import type { ChartTheme } from "./chartTypes";

export class LightweightChartAdapter {
  private chart?: IChartApi;

  mount(container: HTMLElement, theme: ChartTheme): IChartApi {
    this.chart?.remove();
    const options: DeepPartial<ChartOptions> = {
      layout: { background: { color: theme === "dark" ? "#050505" : "#ffffff" }, textColor: theme === "dark" ? "#f5f5f5" : "#171717" },
      grid: { vertLines: { color: theme === "dark" ? "#1f1f1f" : "#e5e7eb" }, horzLines: { color: theme === "dark" ? "#1f1f1f" : "#e5e7eb" } },
      width: container.clientWidth, height: container.clientHeight || 420,
      crosshair: { mode: 0 },
    };
    this.chart = createChart(container, options);
    return this.chart;
  }

  resize(width: number, height: number) { this.chart?.resize(width, height); }
  remove() { this.chart?.remove(); this.chart = undefined; }
  static toTime(epochSeconds: number): Time { return epochSeconds as Time; }
}
