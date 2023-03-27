import { DataStore, TimeStampedData } from "./DataStore"
import pg from 'pg'

export class PostgresDataStore implements DataStore {
  private client: pg.Client

  // postgres://huebot:huebotpw@opti:30529/huebot
  // postgres://huebot:huebotpw@postgres-postgresql-hl.postgres:5432/huebot
  constructor(connectionString: string) {
    this.client = new pg.Client({connectionString})
  }

  async connect() {
    await this.client.connect()
  }

  // node-postgres converts DATE and TIMESTAMP columns into the local time of the node process set at process.env.TZ.
  // - times in the DB are stored in UTC so we need to correct any offset introduced by the local time conversion
  protected static tsToUTC(ts: Date): Date {
    const tzOffset = ts.getTimezoneOffset() // minutes
    ts = new Date(ts.getTime() - 60000 * tzOffset)
    return ts
  }

  async getMotionData(sensorId: string, start: Date, end: Date): Promise<TimeStampedData<boolean>[]> {
    const result: TimeStampedData<boolean>[] = []
    const res = await this.client.query('select * from sensor_motion($1, $2, $3)', [sensorId, start, end])
    for (const row of res.rows) {
      result.push({ts: PostgresDataStore.tsToUTC(row.creationtime), value: !!row.motion})
    }
    return result
  }
  async getLightLevelData(sensorId: string, start: Date, end: Date): Promise<TimeStampedData<number>[]> {
    const result: TimeStampedData<number>[] = []
    const res = await this.client.query('select * from sensor_light_level($1, $2, $3)', [sensorId, start, end])
    for (const row of res.rows) {
      result.push({ts: PostgresDataStore.tsToUTC(row.creationtime), value: row.light_level})
    }
    return result
  }
  async getTemperatureData(sensorId: string, start: Date, end: Date): Promise<TimeStampedData<number>[]> {
    const result: TimeStampedData<number>[] = []
    const res = await this.client.query('select * from sensor_temperature($1, $2, $3)', [sensorId, start, end])
    for (const row of res.rows) {
      result.push({ts: PostgresDataStore.tsToUTC(row.creationtime), value: row.temperature})
    }
    return result
  } 
}

let ds: PostgresDataStore

export async function createDataStore(connectionString: string): Promise<DataStore> {
  if (!ds) {
    ds = new PostgresDataStore(connectionString)
    await ds.connect()
  }
  return ds
}

export function useDataStore(): DataStore {
  return ds
}