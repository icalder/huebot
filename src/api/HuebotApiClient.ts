import { TimeStampedData } from "../services/DataStore.js"
import { HueLight } from "./Light.js"
import { hydrateSensor } from "./Sensor.js"
import { Light, Sensor } from "./Types.js"

export class HuebotApiClient {
  constructor(private url: string) {
  }

  // https://developers.refinitiv.com/en/article-catalog/article/testing-node-native-fetch-api-with-rdp-tyepscript
  public async getLights(): Promise<Light[]> {
    const response = await fetch(`${this.url}/api/lights`, {
      headers: {'accept': 'application/json',}
    })
    const data: Light[] = await response.json()
    if (response.ok) {
      return data.map((l) => Object.setPrototypeOf(l, HueLight.prototype))
    }
    throw new Error(await response.text())
  }

  public async getSensors(): Promise<Sensor[]> {
    const response = await fetch(`${this.url}/api/sensors`, {
      headers: {'accept': 'application/json',}
    })
    const data: Sensor[] = await response.json()
    if (response.ok) {
      return data.map((s) => hydrateSensor(s))
    }
    throw new Error(await response.text())
  }

  /**
   * 
   * @param id a number (42) or an id_v1 (/sensors/42)
   * @returns Sensor
   */
  public async getSensor(id: string): Promise<Sensor> {
    id = normaliseSensorId(id)
    const response = await fetch(`${this.url}/api/sensors/${id}`, {
      headers: {'accept': 'application/json',}
    })
    const data: Sensor = await response.json()
    if (response.ok) {
      return hydrateSensor(data)
    }
    throw new Error(await response.text())
  }

  /**
   * 
   * @param id 
   * @param config e.g. {on: true}
   */
  public async configureSensor(id: string, config: Record<string, any>) {
    id = normaliseSensorId(id)
    const response = await fetch(`${this.url}/api/sensors/${id}/config`, {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(config)
    })
    if (!response.ok) {
      throw new Error(await response.text())
    }
  }

  public async getMotions(sensorId: string, start?: Date, end?: Date): Promise<TimeStampedData<boolean>[]> {
    sensorId = normaliseSensorId(sensorId)
    const params = new URLSearchParams()
    if (start) {
      params.append('start', start.toISOString())
    }
    if (end) {
      params.append('end', end.toISOString())
    }
    const response = await fetch(`${this.url}/api/datastore/sensors/${sensorId}/motions` + params, {
      headers: {'accept': 'application/json',}
    })
    if (response.ok) {
      return (await response.json()).map((s: TimeStampedData<boolean>) => ({ts: new Date(s.ts), value: s.value}))
    }
    throw new Error(await response.text())
  }

  public async getLightLevels(sensorId: string, start?: Date, end?: Date): Promise<TimeStampedData<number>[]> {
    sensorId = normaliseSensorId(sensorId)
    const params = new URLSearchParams()
    if (start) {
      params.append('start', start.toISOString())
    }
    if (end) {
      params.append('end', end.toISOString())
    }
    const response = await fetch(`${this.url}/api/datastore/sensors/${sensorId}/lightlevels` + params, {
      headers: {'accept': 'application/json',}
    })
    if (response.ok) {
      return (await response.json()).map((s: TimeStampedData<number>) => ({ts: new Date(s.ts), value: s.value}))
    }
    throw new Error(await response.text())
  }

  public async getTemperatures(sensorId: string, start?: Date, end?: Date): Promise<TimeStampedData<number>[]> {
    sensorId = normaliseSensorId(sensorId)
    const params = new URLSearchParams()
    if (start) {
      params.append('start', start.toISOString())
    }
    if (end) {
      params.append('end', end.toISOString())
    }
    const response = await fetch(`${this.url}/api/datastore/sensors/${sensorId}/temperatures` + params, {
      headers: {'accept': 'application/json',}
    })
    if (response.ok) {
      return (await response.json()).map((s: TimeStampedData<number>) => ({ts: new Date(s.ts), value: s.value}))
    }
    throw new Error(await response.text())
  }
}

function normaliseSensorId(id: string): string {
  if (id.startsWith('/sensors/')) {
    return id.substring(9)
  }
  return id
}

export function useHuebotApiClient(url: string) {
  return new HuebotApiClient(url)
}