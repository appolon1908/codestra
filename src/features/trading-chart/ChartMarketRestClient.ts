import { base_url } from "@/APIs/base";
import type { ChartMarketApi } from "./ChartDataController";
import type { ChartTimeframe, MarketSnapshot } from "./chartTypes";

type CandleResponse = Pick<MarketSnapshot, "instrument_id" | "interval" | "sequence" | "candles">;

export class ChartMarketRestClient implements ChartMarketApi {
  async snapshot(instrumentId: string, interval: ChartTimeframe, limit: number, signal: AbortSignal): Promise<MarketSnapshot> {
    const response = await base_url.get<MarketSnapshot>("/api/v1/market-data/snapshot", {
      params: { instrument_id: instrumentId, interval, limit },
      signal,
    });
    return response.data;
  }

  async candles(instrumentId: string, interval: ChartTimeframe, limit: number, signal: AbortSignal): Promise<CandleResponse> {
    const response = await base_url.get<CandleResponse>("/api/v1/market-data/candles", {
      params: { instrument_id: instrumentId, interval, limit },
      signal,
    });
    return response.data;
  }
}
