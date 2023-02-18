export interface Light {
  readonly id: string
  readonly name: string
}

export interface Sensor {
  readonly id: string
  readonly name: string
  readonly type: string
  readonly modelId: string // SML002 == outdoor, SML003 == indoor
  readonly uniqueId: string
  readonly mac: string
  readonly lastUpdated: Date
  isPrimary(): boolean
  isOutdoor(): boolean
  isIndoor(): boolean
}

export interface LightSensor extends Sensor {
  readonly lightLevel: number
  readonly dark: boolean
  readonly daylight: boolean
  hydrate(): LightSensor
}

export interface TemperatureSensor extends Sensor {
  readonly temperature: number
  hydrate(): TemperatureSensor
}

export interface MotionSensor extends Sensor {
  isOn(): boolean
  readonly presence: boolean
  hydrate(): MotionSensor
}

export interface CompositeSensor {
  readonly mac: string
  readonly name: string
  readonly shortName: string
  motionSensor: MotionSensor
  lightSensor: LightSensor
  temperatureSensor: TemperatureSensor
}
