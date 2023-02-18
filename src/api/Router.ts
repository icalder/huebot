import express from "express"
import { Response } from "express"
import { useHueApiClient } from "./HueApiClient.js"

const api = useHueApiClient()
export const apiRouter = express.Router()
apiRouter.use(express.json())

apiRouter.get('/ping', async (req, res) => {
  return res.status(200).send({'message': 'pong'})
})

apiRouter.get('/lights', async (req, res) => {
  try {
    const lights = await api.getLights()
    return res.status(200).send(lights)
  } catch (e) {
    sendErrorResponse(res, e)
  }
})

apiRouter.get('/sensors', async (req, res) => {
  try {
    const sensors = await api.getSensors()
    return res.status(200).send(sensors)
  } catch (e) {
    sendErrorResponse(res, e)
  }
})

apiRouter.put('/sensors/:id/config', async (req, res) => {
  try {
    const result = await api.configureSensor(req.params.id, req.body)
    return res.status(200).send(result)
  } catch (e) {
    sendErrorResponse(res, e)
  }
})

apiRouter.get('/sensors/:id', async (req, res) => {
  try {
    const sensor = await api.getSensor(req.params.id)
    return res.status(200).send(sensor)
  } catch (e) {
    sendErrorResponse(res, e)
  }
})

function sendErrorResponse(res: Response, e: unknown) {
  if (getHueErrorType(e) == 3) {
    return res.status(404).send(e)
  } else {
    return res.status(500).send(e)
  }
}

function getHueErrorType(e: unknown): number | undefined {
  if (hasKey(e, '_hueError') && hasKey(e._hueError, 'payload') && hasKey(e._hueError.payload, 'type')) {
    return e._hueError.payload.type as number
  }
  return undefined
}

function hasKey<T extends keyof any>(obj: unknown, key: T): obj is { [key in T]: unknown } {
  return !!obj && typeof obj === 'object' && key in obj
}