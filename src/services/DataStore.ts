export interface TimeStampedData<T> {
  ts: Date
  value: T
}

export interface DataStore {
  getMotionData(sensorId: string, start: Date, end: Date): Promise<TimeStampedData<boolean>[]>
  getLightLevelData(sensorId: string, start: Date, end: Date): Promise<TimeStampedData<number>[]>
  getTemperatureData(sensorId: string, start: Date, end: Date): Promise<TimeStampedData<number>[]>
}