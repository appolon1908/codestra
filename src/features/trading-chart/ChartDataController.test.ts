import { describe, expect, it, vi } from "vitest";
import { ChartDataController, type ChartMarketApi } from "./ChartDataController";
import type { MarketEvent, MarketSnapshot, UnifiedRealtimeClient } from "./chartTypes";

const snapshot = (instrument_id = "BTC-USD", interval: MarketSnapshot["interval"] = "1m", sequence = 10): MarketSnapshot => ({
  instrument_id, interval, sequence, server_time: "2026-08-07T00:00:00Z", market_status: "OPEN",
  quote: { bid: "100", ask: "101", mid: "100.5", occurred_at: "2026-08-07T00:00:00Z" },
  candles: [{ time: 1, open: 1, high: 2, low: 1, close: 2 }],
});

class Realtime implements UnifiedRealtimeClient {
  handlers = new Map<string, (event: unknown) => void>();
  subscriptions: string[] = [];
  unsubscriptions: string[] = [];
  subscribe(channel: string, handler: (event: unknown) => void) {
    this.subscriptions.push(channel); this.handlers.set(channel, handler);
    return () => { this.unsubscriptions.push(channel); this.handlers.delete(channel); };
  }
}

describe("ChartDataController", () => {
  it("uses one snapshot and one subscription pair per asset", async () => {
    const api: ChartMarketApi = { snapshot: vi.fn().mockResolvedValue(snapshot()), candles: vi.fn() };
    const realtime = new Realtime();
    const controller = new ChartDataController(api, realtime, vi.fn());
    await controller.start("BTC-USD", "1m");
    expect(api.snapshot).toHaveBeenCalledTimes(1);
    expect(realtime.subscriptions).toEqual(["market.quote:BTC-USD", "market.candle:BTC-USD:1m"]);
  });

  it("timeframe change makes one candle request and replaces only candle subscription", async () => {
    const api: ChartMarketApi = { snapshot: vi.fn().mockResolvedValue(snapshot()), candles: vi.fn().mockResolvedValue({ instrument_id: "BTC-USD", interval: "5m", sequence: 20, candles: [] }) };
    const realtime = new Realtime(); const controller = new ChartDataController(api, realtime, vi.fn());
    await controller.start("BTC-USD", "1m"); await controller.changeTimeframe("5m");
    expect(api.candles).toHaveBeenCalledTimes(1);
    expect(realtime.unsubscriptions).toEqual(["market.candle:BTC-USD:1m"]);
    expect(realtime.subscriptions.at(-1)).toBe("market.candle:BTC-USD:5m");
  });

  it("ignores stale asset responses", async () => {
    let resolveOld!: (value: MarketSnapshot) => void;
    const old = new Promise<MarketSnapshot>((resolve) => { resolveOld = resolve; });
    const api: ChartMarketApi = { snapshot: vi.fn().mockReturnValueOnce(old).mockResolvedValueOnce(snapshot("ETH-USD")), candles: vi.fn() };
    const states: string[] = []; const controller = new ChartDataController(api, new Realtime(), (state) => states.push(state.instrumentId));
    const first = controller.start("BTC-USD", "1m"); const second = controller.changeInstrument("ETH-USD", "1m");
    resolveOld(snapshot("BTC-USD")); await Promise.all([first, second]);
    expect(states.at(-1)).toBe("ETH-USD");
  });

  it("ignores duplicates and recovers one snapshot on a sequence gap", async () => {
    const api: ChartMarketApi = { snapshot: vi.fn().mockResolvedValue(snapshot()), candles: vi.fn() };
    const realtime = new Realtime(); const states: number[] = [];
    const controller = new ChartDataController(api, realtime, (state) => states.push(state.candles.length)); await controller.start("BTC-USD", "1m");
    const handler = realtime.handlers.get("market.candle:BTC-USD:1m")!;
    const event = (sequence: number): MarketEvent => ({ event_id: String(sequence), sequence, channel: "market.candle:BTC-USD:1m", instrument_id: "BTC-USD", occurred_at: "2026-08-07T00:00:00Z", server_time: "2026-08-07T00:00:00Z", data: { candle: { time: sequence, open: 1, high: 2, low: 1, close: 2 } } });
    handler(event(11));
    const emissionsAfterFirstEvent = states.length;
    handler(event(11));
    expect(states).toHaveLength(emissionsAfterFirstEvent);
    handler(event(13)); handler(event(14));
    await vi.waitFor(() => expect(api.snapshot).toHaveBeenCalledTimes(2));
  });
});
