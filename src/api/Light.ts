import { model } from "node-hue-api"
import { Light } from "./Types"

export class HueLight implements Light {
  private _id: string
  private _name: string
  
  constructor(s: model.Light) {
    this._id = s.id.toString()
    this._name = s.name
  }

  public get id() {
    return this._id
  }

  public get name() {
    return this._name
  }
}