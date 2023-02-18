import { model } from "node-hue-api"
import { CompositeSensor, LightSensor, MotionSensor, Sensor, TemperatureSensor } from "./Types"

const macRegex = /^(?:[A-Fa-f0-9]{2}:)(?:[A-Fa-f0-9]{2}:){6}[A-Fa-f0-9]{2}/

export function isLightSensorType(s: model.Sensor) {
  return s.type == 'ZLLLightLevel'
}

export function isTemperatureSensorType(s: model.Sensor) {
  return s.type == 'ZLLTemperature'
}

export function isMotionSensorType(s: model.Sensor) {
  return s.type == 'ZLLPresence'
}

export function hydrateSensor(o: any): HueLightSensor | HueTemperatureSensor | HueMotionSensor {
  if (HueLightSensor.canHydrate(o)) {
    return Object.setPrototypeOf(o, HueLightSensor.prototype).hydrate()
  } else if (HueTemperatureSensor.canHydrate(o)) {
    return Object.setPrototypeOf(o, HueTemperatureSensor.prototype).hydrate()
  } else if (HueMotionSensor.canHydrate(o)) {
    return Object.setPrototypeOf(o, HueMotionSensor.prototype).hydrate()
  } else {
    throw new Error('Cannot hydrate sensor')
  }
}

export abstract class HueSensor implements Sensor {
  private _id: string
  private _name: string
  private _type: string
  private _modelId: string
  private _uniqueId: string
  private _primary: boolean
  private _lastUpdated: Date
  
  constructor(s: model.Sensor) {
    this._id = s.id.toString()
    this._name = s.name
    this._type = s.type
    this._modelId = s.modelid
    this._uniqueId = s.uniqueid
    this._primary = s.capabilities && s.capabilities.primary
    this._lastUpdated = new Date(s.getStateAttributeValue('lastupdated'))
  }

  public hydrate() {
    this._lastUpdated = new Date(this._lastUpdated)
    return this
  }

  public get id() {
    return this._id
  }

  public get name() {
    return this._name
  }

  public get type() {
    return this._type
  }

  public get modelId() {
    return this._modelId
  }

  public get uniqueId() {
    return this._uniqueId
  }

  public get mac() {
    if (!this.uniqueId) {
      return ''
    }
    const matches = this.uniqueId.match(macRegex)
    return matches ? matches[0] : ''
  }

  public get lastUpdated() {
    return this._lastUpdated
  }

  public isPrimary() {
    return !!this._primary
  }

  public isOutdoor() {
    return this.modelId == 'SML002'
  }

  public isIndoor() {
    return !this.isOutdoor()
  }
}

export class HueLightSensor extends HueSensor implements LightSensor {
  private _lightLevel: number
  private _dark: boolean
  private _daylight: boolean

  public static canHydrate(o: any) {
    return '_lightLevel' in o
  }

  public static isLightSensor(s: Sensor): s is LightSensor {
    return (s as LightSensor).lightLevel !== undefined
  }

  constructor(s: model.Sensor) {
    super(s)
    this._lightLevel = s.getStateAttributeValue('lightlevel')
    this._dark = !!s.getStateAttributeValue('dark')
    this._daylight = !!s.getStateAttributeValue('daylight')
  }

  public hydrate() {
    super.hydrate()
    return this
  }

  public get lightLevel() {
    return this._lightLevel
  }

  public get dark() {
    return this._dark
  }

  public get daylight() {
    return this._daylight
  }
}

export class HueTemperatureSensor extends HueSensor implements TemperatureSensor {
  private _temperature: number

  public static canHydrate(o: any) {
    return '_temperature' in o
  }

  public static isTemperatureSensor(s: Sensor): s is TemperatureSensor {
    return (s as TemperatureSensor).temperature !== undefined
  }
 
  constructor(s: model.Sensor) {
    super(s)
    this._temperature = s.getStateAttributeValue('temperature')
  }

  public hydrate() {
    super.hydrate()
    return this
  }

  public get temperature() {
    return this._temperature
  }
}

export class HueMotionSensor extends HueSensor implements MotionSensor {
  private _on: boolean
  private _presence: boolean

  public static canHydrate(o: any) {
    return '_presence' in o
  }

  public static isMotionSensor(s: Sensor): s is MotionSensor {
    return (s as MotionSensor).presence !== undefined
  }

  constructor(s: model.Sensor) {
    super(s)
    this._on = !!s.getConfigAttributeValue('on')
    this._presence = !!s.getStateAttributeValue('presence')
  }

  public hydrate() {
    super.hydrate()
    return this
  }

  public isOn() {
    return this._on
  }

  public get presence() {
    return this._presence
  }
}

export class HueCompositeSensor implements CompositeSensor {
  constructor(public motionSensor: MotionSensor,
    public lightSensor: LightSensor,
    public temperatureSensor: TemperatureSensor) {
  }

  public get name() {
    return this.motionSensor.name
  }

  public get shortName() {
    let regex
    if (this.isIndoor()) {
      regex = /(.*) indoor/i
    } else {
      regex = /(.*) outdoor/i
    }
    const matches = this.name.match(regex)
    return matches ? matches[1].trim() : this.name
  }

  public get mac() {
    return this.motionSensor.mac
  }

  public isOutdoor() {
    return this.motionSensor.isOutdoor()
  }

  public isIndoor() {
    return this.motionSensor.isIndoor()
  }
}