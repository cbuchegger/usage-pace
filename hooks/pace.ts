const DAY = 24 * 60 * 60 * 1000
const WEEK = 7 * DAY

// Milliseconds of Monday-to-Friday time between `from` and `to`, in a zone
// `offsetMinutes` east of UTC.
export function workdayMs(from: number, to: number, offsetMinutes: number): number {
  const shift = offsetMinutes * 60 * 1000
  let total = 0
  let t = from + shift
  const end = to + shift
  while (t < end) {
    const dayStart = Math.floor(t / DAY) * DAY
    const dayEnd = Math.min(dayStart + DAY, end)
    const weekday = new Date(dayStart).getUTCDay()
    if (weekday >= 1 && weekday <= 5) total += dayEnd - t
    t = dayEnd
  }
  return total
}

// Where usage "should" be now if the weekly window were spread evenly over
// its weekdays only, as a percentage 0–100.
export function expectedPercent(now: number, resetsAt: number, offsetMinutes: number): number {
  const start = resetsAt - WEEK
  const all = workdayMs(start, resetsAt, offsetMinutes)
  if (all === 0) return 0
  const elapsed = workdayMs(start, Math.min(Math.max(now, start), resetsAt), offsetMinutes)
  return (elapsed / all) * 100
}

export function bar(percent: number, width: number, marker?: number): string {
  const filled = Math.round((Math.min(Math.max(percent, 0), 100) / 100) * width)
  const chars: string[] = Array.from({ length: width }, (_, i) => (i < filled ? '█' : '░'))
  if (marker !== undefined) {
    const at = Math.min(width - 1, Math.max(0, Math.round((marker / 100) * width) - 1))
    chars[at] = '┃'
  }
  return chars.join('')
}

// Where usage "should" be now if a window of `length` ms were spent evenly.
export function linearPercent(now: number, resetsAt: number, length: number): number {
  const elapsed = Math.min(Math.max(now - (resetsAt - length), 0), length)
  return (elapsed / length) * 100
}
