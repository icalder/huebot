import { TimeStampedData } from "../services/DataStore"

export function resample24<T>(start: Date, input: TimeStampedData<T>[], 
  transformer: (i: T) => number, extrapolateMissing: boolean = false): {x: number, y: number}[] {
  // Each dim-1 bucket represents an hour
  // dim-2 is [count][cumavg]
  const acc = new Array<number[]>(24)
  for (let i = 0; i != 24; ++i) {
    acc[i] = new Array<number>(2).fill(0)
  }
  const t0 = start.getTime()
  for (const i of input) {
    // calculate the accumulator bucket this sample should be in
    const ti = i.ts.getTime()
    const deltat = ti - t0
    const bucket = Math.floor(deltat / (60 * 60 * 1000))
    if (bucket >= 0 && bucket < 24) {
      acc[bucket][0]++
      // update the cumulative average for this bucket
      acc[bucket][1] = acc[bucket][1] + (transformer(i.value) - acc[bucket][1]) / acc[bucket][0]
    }
  }

  if (extrapolateMissing) {
    // Any empty buckets get the previous bucket's value
    // If the first bucket is empty it gets the value of the first non-empty bucket
    if (acc[0][0] == 0) {
      for (let i = 1; i != 24; ++i) {
        if (acc[i][0] > 0) {
          acc[0][1] = acc[i][1]
          continue
        }
      }
    }
    for (let i = 1; i != 24; ++i) {
      if (acc[i][0] == 0) {
        acc[i][1] = acc[i-1][1]
      }
    }
  }

  // Return data as {x,y} points
  const firstHour = start.getHours() + (isDST(start) ? 1 : 0)
  const result = acc.map((b, idx) => ({x: (firstHour + idx) % 24, y: b[1]}))
  return result
}

function isDST(date = new Date()) {
  const january = new Date(date.getFullYear(), 0, 1).getTimezoneOffset();
  const july = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();

  return Math.max(january, july) !== date.getTimezoneOffset();
}