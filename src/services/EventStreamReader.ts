export type EventReader = (evt: any) => void

class EventStreamReader {
  private es?: EventSource
  private eventReaders: EventReader[] = []

  public addEventReader(er: EventReader) {
    this.eventReaders.push(er)
  }

  public start() {
    this.connect()
  }

  private connect() {
    this.es = new EventSource('/eventstream')
    this.es.onerror = () => {
      if (this.es) {
        this.es.close()
        // TODO backoff
        setTimeout(() => (this.connect(), 1000))
      }
    }
    this.es.onmessage = async (ev) => {
      if (ev.data) {
        const data = JSON.parse(ev.data)
        /*if ('ping' in data) {

        }*/
        this.eventReaders.forEach((er) => er(data))
      }
    }
  }
}

const svc = new EventStreamReader()
export function useEventStreamReader() {
  return svc
}