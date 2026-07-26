export interface GaugeReading {
  title: string;
  value: number;
  previousValue: number;
  zones: [string, string, string, string, string];
}
