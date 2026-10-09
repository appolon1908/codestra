import type { Candle, ChartTimeframe, MarketEvent, MarketSnapshot, UnifiedRealtimeClient } from "./chartTypes";

export interface ChartMarketApi {
  snapshot(instrumentId: string, interval: ChartTimeframe, limit: number, signal: AbortSignal): Promise<MarketSnapshot>;
  candles(instrumentId: string, interval: ChartTimeframe, limit: number, signal: AbortSignal): Promise<Pick<MarketSnapshot, "instrument_id" | "interval" | "sequence" | "candles">>;
}

export type ChartDataState = {
  instrumentId: string;
  interval: ChartTimeframe;
  sequence: number;
  candles: Candle[];
  quote?: MarketSnapshot["quote"];
  marketStatus: MarketSnapshot["market_status"];
  connection: "CONNECTING" | "LIVE" | "RECOVERING" | "DISCONNECTED";
};

type Listener = (state: ChartDataState) => void;

export class ChartDataController {
  private state?: ChartDataState;
  private generation = 0;
  private request?: AbortController;
  private candleRequest?: AbortController;
  private unsubscribers: Array<() => void> = [];
  private channelSequences = new Map<string, number>();
  private recovery?: Promise<void>;

  constructor(private api: ChartMarketApi, private realtime: UnifiedRealtimeClient, private listener: Listener) {}

  async start(instrumentId: string, interval: ChartTimeframe): Promise<void> {
    return this.changeInstrument(instrumentId, interval);
  }

  async changeInstrument(instrumentId: string, interval = this.state?.interval ?? "1m"): Promise<void> {
    const generation = ++this.generation;
    this.request?.abort();
    this.candleRequest?.abort();
    this.unsubscribeAll();
    this.channelSequences.clear();
    const request = new AbortController();
    this.request = request;
    this.emit({ instrumentId, interval, sequence: 0, candles: [], marketStatus: "UNKNOWN", connection: "CONNECTING" });
    const snapshot = await this.api.snapshot(instrumentId, interval, 500, request.signal);
    if (request.signal.aborted || generation !== this.generation || snapshot.instrument_id !== instrumentId) return;
    this.applySnapshot(snapshot);
    this.subscribe(instrumentId, interval);
  }

  async changeTimeframe(interval: ChartTimeframe): Promise<void> {
    if (!this.state || this.state.interval === interval) return;
    const generation = this.generation;
    const instrumentId = this.state.instrumentId;
    this.candleRequest?.abort();
    this.unsubscribeCandle();
    const request = new AbortController();
    this.candleRequest = request;
    const response = await this.api.candles(instrumentId, interval, 500, request.signal);
    if (request.signal.aborted || generation !== this.generation || response.instrument_id !== instrumentId) return;
    this.emit({ ...this.state, interval, sequence: response.sequence, candles: this.normalize(response.candles) });
    this.subscribeCandle(instrumentId, interval);
  }

  stop(): void {
    ++this.generation;
    this.request?.abort();
    this.candleRequest?.abort();
    this.unsubscribeAll();
    if (this.state) this.emit({ ...this.state, connection: "DISCONNECTED" });
  }

  private subscribe(instrumentId: string, interval: ChartTimeframe): void {
    this.unsubscribers.push(this.realtime.subscribe(`market.quote:${instrumentId}`, (event) => this.onEvent(event)));
    this.subscribeCandle(instrumentId, interval);
    if (this.state) this.emit({ ...this.state, connection: "LIVE" });
  }

  private subscribeCandle(instrumentId: string, interval: ChartTimeframe): void {
    const channel = `market.candle:${instrumentId}:${interval}`;
    this.unsubscribers.push(this.realtime.subscribe(channel, (event) => this.onEvent(event)));
  }

  private unsubscribeCandle(): void {
    const unsubscribe = this.unsubscribers.pop();
    unsubscribe?.();
  }

  private unsubscribeAll(): void {
    for (const unsubscribe of this.unsubscribers.splice(0)) unsubscribe();
  }

  private onEvent(value: unknown): void {
    if (!this.state || !this.isEvent(value) || value.instrument_id !== this.state.instrumentId) return;
    const previous = this.channelSequences.get(value.channel);
    if (previous !== undefined && value.sequence <= previous) return;
    if (previous !== undefined && value.sequence !== previous + 1) {
      void this.recover();
      return;
    }
    this.channelSequences.set(value.channel, value.sequence);
    if (value.channel.startsWith("market.candle:")) {
      const candle = (value.data as { candle?: Candle }).candle;
      if (!candle) return;
      this.emit({ ...this.state, sequence: value.sequence, candles: this.normalize([...this.state.candles, candle]) });
    } else if (value.channel.startsWith("market.quote:")) {
      const quote = value.data as MarketSnapshot["quote"];
      this.emit({ ...this.state, sequence: value.sequence, quote });
    }
  }

  private recover(): Promise<void> {
    if (this.recovery || !this.state) return this.recovery ?? Promise.resolve();
    const generation = this.generation;
    const { instrumentId, interval } = this.state;
    this.emit({ ...this.state, connection: "RECOVERING" });
    const request = new AbortController();
    this.recovery = this.api.snapshot(instrumentId, interval, 500, request.signal).then((snapshot) => {
      if (generation === this.generation && snapshot.instrument_id === instrumentId) this.applySnapshot(snapshot);
    }).finally(() => { this.recovery = undefined; });
    return this.recovery;
  }

  private applySnapshot(snapshot: MarketSnapshot): void {
    this.channelSequences.set(`market.quote:${snapshot.instrument_id}`, snapshot.sequence);
    this.channelSequences.set(`market.candle:${snapshot.instrument_id}:${snapshot.interval}`, snapshot.sequence);
    this.emit({ instrumentId: snapshot.instrument_id, interval: snapshot.interval, sequence: snapshot.sequence, candles: this.normalize(snapshot.candles), quote: snapshot.quote, marketStatus: snapshot.market_status, connection: "LIVE" });
  }

  private normalize(candles: Candle[]): Candle[] {
    return [...new Map(candles.map((candle) => [candle.time, candle])).values()].sort((a, b) => a.time - b.time);
  }

  private emit(state: ChartDataState): void {
    this.state = state;
    this.listener(state);
  }

  private isEvent(value: unknown): value is MarketEvent {
    if (!value || typeof value !== "object") return false;
    const event = value as Partial<MarketEvent>;
    return typeof event.event_id === "string" && typeof event.sequence === "number" && typeof event.channel === "string" && typeof event.instrument_id === "string" && typeof event.occurred_at === "string" && typeof event.server_time === "string" && "data" in event;
  }
}
