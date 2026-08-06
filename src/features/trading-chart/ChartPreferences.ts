import type { ChartTheme, ChartTimeframe } from "./chartTypes";
export type ChartPreferences = { theme: ChartTheme; timeframe: ChartTimeframe; indicators: string[] };
export const defaultChartPreferences: ChartPreferences = { theme: "dark", timeframe: "1h", indicators: [] };
