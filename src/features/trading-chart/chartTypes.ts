export type Candle = { time: number; open: number; high: number; low: number; close: number; volume?: number };
export type Quote = { symbol: string; bid: number; ask: number; last: number; sequence: number; receivedAt: string };
export type MarketStatus = "HEALTHY" | "DELAYED" | "STALE" | "DEGRADED" | "DISCONNECTED" | "UNSUPPORTED";
export type ChartTimeframe = "5s" | "10s" | "15s" | "30s" | "1m" | "5m" | "15m" | "1h" | "4h" | "1d";
export type ChartType = "candlestick" | "heikin-ashi" | "bar" | "line" | "area";
export type ChartTheme = "dark" | "light";
export type ChartOverlay = { id: string; kind: "order" | "position" | "marker"; price: number; label: string };

export interface UnifiedRealtimeClient {
  subscribe(channel: string, handler: (event: unknown) => void): () => void;
  resume?(channel: string, sequence: number): Promise<void>;
}

export type MarketEvent<T = unknown> = {
  event_id: string;
  sequence: number;
  channel: string;
  instrument_id: string;
  occurred_at: string;
  server_time: string;
  data: T;
};

export type MarketSnapshot = {
  instrument_id: string;
  interval: ChartTimeframe;
  sequence: number;
  server_time: string;
  market_status: "OPEN" | "CLOSED" | "UNKNOWN";
  quote: { bid: string; ask: string; mid: string; occurred_at: string };
  candles: Candle[];
};
