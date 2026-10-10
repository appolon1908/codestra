import type { ISeriesApi, SeriesType, SeriesMarker } from "lightweight-charts";
export class MarkerController { setMarkers(series: ISeriesApi<SeriesType>, markers: SeriesMarker<never>[]) { (series as unknown as { setMarkers: (items: SeriesMarker<never>[]) => void }).setMarkers(markers); } }
