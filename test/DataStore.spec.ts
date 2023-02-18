import { describe, it, assert } from 'vitest'
import { MongoDataStore } from '../src/services/MongoDataStore'

const datastore = new MongoDataStore('pi4:27017')

describe('DataStore', () => {
  /*it('logs something to console async', async () => {
    await Promise.resolve()
    console.log('Console output async!!!')
  })*/

  it('can get motion values for a sensor', async () => {
    const now = new Date()
    const samples = await datastore.getMotionData('2', new Date(now.getTime() - 24 * 60 * 60 * 1000), now)
    console.log(samples)
    assert.isNotEmpty(samples)
  })

  it('can get light level values for a sensor', async () => {
    const now = new Date()
    const samples = await datastore.getLightLevelData('3', new Date(now.getTime() - 24 * 60 * 60 * 1000), now)
    console.log(samples)
    assert.isNotEmpty(samples)
  })

  it('can get temperature values for a sensor', async () => {
    const now = new Date()
    const samples = await datastore.getTemperatureData('4', new Date(now.getTime() - 1 * 60 * 60 * 1000), now)
    console.log(samples)
    assert.isNotEmpty(samples)
  })
})