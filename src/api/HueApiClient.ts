import { v3, model } from "node-hue-api"
import { Api } from "node-hue-api/dist/esm/api/Api"
import { HueLight } from "./Light.js"
import { HueLightSensor, HueMotionSensor, HueTemperatureSensor, isLightSensorType, isMotionSensorType, isTemperatureSensorType } from "./Sensor.js"
import { Light, LightSensor, MotionSensor, Sensor, TemperatureSensor } from "./Types.js"

function isLight(arg: model.Light | model.Luminaire | model.Lightsource): arg is model.Light {
  return arg instanceof model.Light
}

function modelToSensor(s: model.Sensor): MotionSensor | LightSensor | TemperatureSensor {
  if (isMotionSensorType(s)) {
    return new HueMotionSensor(s)
  } else if (isLightSensorType(s)) {
    return new HueLightSensor(s)
  } else if (isTemperatureSensorType(s)) {
    return new HueTemperatureSensor(s)
  } else {
    throw new Error('unknown model type')
  }
}

export class HueApiClient {
  nodeHueApi!: Api

  constructor() {
  }

  async setup(hueIP: string, hueUsername: string) {
    this.nodeHueApi = await v3.api.createLocal(hueIP).connect(hueUsername)
  }

  public async getLights(): Promise<Light[]> {
    const allLights = await this.nodeHueApi.lights.getAll()
    return allLights.filter(isLight).map((l) => new HueLight(l))
  }

  public async getSensors(): Promise<Sensor[]> {
    const sensors = await this.nodeHueApi.sensors.getAll()
    const result = []
    for (const s of sensors) {
      if (isMotionSensorType(s) || isLightSensorType(s) || isTemperatureSensorType(s)) {
        // This is a sensor we are interested in
        result.push(modelToSensor(s))
      }
    }
    return result
  }

  public async getSensor(id: string): Promise<Sensor> {
    const sensor = await this.nodeHueApi.sensors.getSensor(id)
    return modelToSensor(sensor)
  }

  public async configureSensor(id: string, config: Record<string, any>) {
    const apiConfig = this.nodeHueApi._getConfig()
    // TODO yuck
    const baseUrl = apiConfig.baseUrl.replace('https://', 'http://')
    const response = await fetch(`${baseUrl}/${apiConfig.username}/sensors/${id}/config`, {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(config)
    })
    if (!response.ok) {
      throw new Error(await response.text())
    }
  }

}

/*
HueApiConfig {
  _config: {
    remote: false,
    baseUrl: 'https://192.168.1.107/api',
    bridgeName: '192.168.1.107',
    clientKey: undefined,
    username: '<username>'
  },
  _remoteApi: undefined,
  _transport: Transport {
    _username: '<username>',
    _client: HttpClientFetch { _config: [Object] },
    _limiter: HueRateLimiter {
      id: 2,
      limiterName: 'node-hue-api:transport',
      bottleneck: [Bottleneck]
    }
  },
  _isRemote: false
}
*/

const client = new HueApiClient()

export function useHueApiClient() {
  return client
}