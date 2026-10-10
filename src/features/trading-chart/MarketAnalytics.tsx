import { useEffect, useRef } from "react";
import * as echarts from "echarts";

export type AnalyticsPoint = { label: string; value: number };

export function MarketAnalytics({ title, points, theme = "dark" }: { title: string; points: AnalyticsPoint[]; theme?: "dark" | "light" }) {
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!container.current) return;
    const chart = echarts.init(container.current, theme === "dark" ? "dark" : undefined, { renderer: "canvas" });
    chart.setOption({ title: { text: title, textStyle: { color: theme === "dark" ? "#f5f5f5" : "#171717" } }, tooltip: { trigger: "axis" }, xAxis: { type: "category", data: points.map((point) => point.label) }, yAxis: { type: "value" }, series: [{ type: "line", data: points.map((point) => point.value), smooth: true }] });
    const resize = () => chart.resize(); window.addEventListener("resize", resize);
    return () => { window.removeEventListener("resize", resize); chart.dispose(); };
  }, [points, theme, title]);
  return <div ref={container} role="img" aria-label={title} style={{ width: "100%", minHeight: 280 }} />;
}
