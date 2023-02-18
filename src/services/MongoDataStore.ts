import { Collection, Document, MongoClient } from "mongodb"
import { DataStore, TimeStampedData } from "./DataStore"

export class MongoDataStore implements DataStore {
  private client: MongoClient
  private v2events: Collection<Document>

  constructor(host: string, username?: string | undefined, password?: string | undefined) {
    if (username && password) {
      this.client = new MongoClient(`mongodb://${username}:${password}@${host}`)
    } else {
      this.client = new MongoClient(`mongodb://${host}`)
    }
    const db = this.client.db('hue')
    this.v2events = db.collection('v2events')
  }

  async getMotionData(sensorId: string, start: Date, end: Date): Promise<TimeStampedData<boolean>[]> {
    const cursor = this.v2events
      .find({
        'data.type': 'motion',
        'data.id_v1': `/sensors/${sensorId}`,
        'creationtime': { $gte: start, $lte: end },
      })
      .project({
        _id: 0,
        creationtime: 1,
        "data.motion.motion": 1
      })
    const result: TimeStampedData<boolean>[] = []
    await cursor.forEach((doc) => {
      for (const d of doc.data) {
        if ('motion' in d) {
          result.push({ts: doc.creationtime, value: !!d.motion.motion})
        }
      }
      return true
    })
    return result
  }

  async getLightLevelData(sensorId: string, start: Date, end: Date): Promise<TimeStampedData<number>[]> {
    const cursor = this.v2events
      .find({
        'data.type': 'light_level',
        'data.id_v1': `/sensors/${sensorId}`,
        'creationtime': { $gte: start, $lte: end },
      })
      .project({
        _id: 0,
        creationtime: 1,
        "data.light.light_level": 1
      })
    const result: TimeStampedData<number>[] = []
    await cursor.forEach((doc) => {
      for (const d of doc.data) {
        if ('light' in d) {
          result.push({ts: doc.creationtime, value: d.light.light_level})
        }
      }
      return true
    })
    return result
  }

  async getTemperatureData(sensorId: string, start: Date, end: Date): Promise<TimeStampedData<number>[]> {
    const cursor = this.v2events
      .find({
        'data.type': 'temperature',
        'data.id_v1': `/sensors/${sensorId}`,
        'creationtime': { $gte: start, $lte: end },
      })
      .project({
        _id: 0,
        creationtime: 1,
        "data.temperature.temperature": 1
      })
    const result: TimeStampedData<number>[] = []
    await cursor.forEach((doc) => {
      for (const d of doc.data) {
        if ('temperature' in d) {
          result.push({ts: doc.creationtime, value: d.temperature.temperature})
        }
      }
      return true
    })
    return result
  }
  
}

let ds: DataStore

export function createDataStore(host: string, username?: string | undefined, password?: string | undefined): DataStore {
  ds = new MongoDataStore(host, username, password)
  return ds
}

export function useDataStore(): DataStore {
  return ds
}