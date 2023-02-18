import './style.css'
import { createApp } from './main'
import { useHueStore } from './services/HueStore'
import { useEventStreamReader } from './services/EventStreamReader'

const { app, router } = createApp()
const hueStore = useHueStore()
const eventStreamReader = useEventStreamReader()
eventStreamReader.addEventReader((evt: any) => hueStore.setEvent(evt))
eventStreamReader.start()

// wait until router is ready before mounting to ensure hydration match
router.isReady().then(() => {
  app.mount('#app')
  console.log('entry-client running')
})
