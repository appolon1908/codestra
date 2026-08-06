export type Candle = { time: number; open: number; high: number; low: number; close: number; volume?: number };
export type Quote = { symbol: string; bid: number; ask: number; last: number; sequence: number; receivedAt: string };
export type MarketStatus = "HEALTHY" | "DELAYED" | "STALE" | "DEGRADED" | "DISCONNECTED" | "UNSUPPORTED";
export type ChartTimeframe = "1m" | "5m" | "15m" | "1h" | "4h" | "1d";
export type ChartTheme = "dark" | "light";
export type ChartOverlay = { id: string; kind: "order" | "position" | "marker"; price: number; label: string };

export interface UnifiedRealtimeClient {
  subscribe(channel: string, handler: (event: unknown) => void): () => void;
  resume?(channel: string, sequence: number): Promise<void>;
}
