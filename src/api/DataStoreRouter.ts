import express from "express"
import { DataStore } from "../services/DataStore"

export function dataStoreRouter(ds: DataStore): express.Router {
  const router = express.Router()

  router.get('/sensors/:id/motions', async (req, res) => {
    const sensorId = req.params.id
    const startDate = req.query.start ? new Date(req.query.end as string) : new Date()
    if (!req.query.start) {
      startDate.setDate(startDate.getDate() - 1)
    }
    const endDate = req.query.end ? new Date(req.query.end as string) : new Date()
    const end = req.query.end ? Date.parse(req.query.end as string) : new Date()
    return res.status(200).send(await ds.getMotionData(sensorId, startDate, endDate))
  })

  router.get('/sensors/:id/lightlevels', async (req, res) => {
    const sensorId = req.params.id
    const startDate = req.query.start ? new Date(req.query.end as string) : new Date()
    if (!req.query.start) {
      startDate.setDate(startDate.getDate() - 1)
    }
    const endDate = req.query.end ? new Date(req.query.end as string) : new Date()
    const end = req.query.end ? Date.parse(req.query.end as string) : new Date()
    return res.status(200).send(await ds.getLightLevelData(sensorId, startDate, endDate))
  })

  router.get('/sensors/:id/temperatures', async (req, res) => {
    const sensorId = req.params.id
    const startDate = req.query.start ? new Date(req.query.end as string) : new Date()
    if (!req.query.start) {
      startDate.setDate(startDate.getDate() - 1)
    }
    const endDate = req.query.end ? new Date(req.query.end as string) : new Date()
    const end = req.query.end ? Date.parse(req.query.end as string) : new Date()
    return res.status(200).send(await ds.getTemperatureData(sensorId, startDate, endDate))
  })

  return router

}