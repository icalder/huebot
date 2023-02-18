import { reactive, ref, toRefs } from "vue"
import { Light, Sensor } from "../api/Types"
import { HueLight } from "../api/Light"
import { hydrateSensor } from "../api/Sensor"

export type PingEvent = {
  timestamp: Date
}

const STATE_KEY = '__hueBridge__state'

class HueStore {
  private _state = reactive({
    keepalive: undefined as undefined | PingEvent,
    event: undefined as undefined | any,
    lights: [] as Light[],
    sensors: new Map<string, Sensor>()
  })
  
  constructor() {
  }

  loadState(initialData: Record<string, any>) {
    if (initialData && initialData[STATE_KEY]) {
      const state = initialData[STATE_KEY]
      this._state.lights = state.lights.map((o: object) => Object.setPrototypeOf(o, HueLight.prototype))
      this._state.sensors = new Map(Object.entries(state.sensors).map(([k, s]) => [k, hydrateSensor(s)]))      
    }
  }

  saveState(context: Record<string, any>) {
    context[STATE_KEY] = {}
    context[STATE_KEY].lights = this._state.lights
    context[STATE_KEY].sensors = Object.fromEntries(this._state.sensors)
  }

  get state() {
    return toRefs(this._state)
  }

  set lights(value: Light[]) {
    this._state.lights = value
  }

  set sensors(value: Sensor[]) {
    this._state.sensors.clear()
    for (const s of value) {
      this._state.sensors.set(s.id, s)
    }
  }

  setSensor(s: Sensor) {
    this._state.sensors.set(s.id, s)
  }

  setEvent(evt: any) {
    if ('ping' in evt) {
      this._state.keepalive = {timestamp: new Date(evt.ping)}
    } else {
      this._state.event = evt
    }
  }
}

const svc = new HueStore()
export function useHueStore() {
  return svc
}