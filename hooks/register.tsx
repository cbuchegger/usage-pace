import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register, SessionRateLimit } from 'claude-code'

import type { Reading } from '../types'
import { bar, expectedPercent, linearPercent } from './pace'

const session = atom({ plugin: 'pace', key: 'session' } as const, null)
const weekly = atom({ plugin: 'pace', key: 'weekly' } as const, null)

const WIDTH = 10
const FIVE_HOURS = 5 * 60 * 60 * 1000
const MINUTE = 60 * 1000

const fmtTime = (d: Date) => `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`

const fmtReset = (ms: number, offsetMinutes: number, withDay: boolean) => {
  const d = new Date(ms + offsetMinutes * 60 * 1000)
  const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getUTCDay()]
  return withDay ? `${day} ${fmtTime(d)}` : fmtTime(d)
}

const toReading = (limit: SessionRateLimit | undefined): Reading | null =>
  limit?.resetsAt ? { percentUsed: limit.percentUsed, resetsAt: limit.resetsAt } : null

const gauge = (label: string, r: Reading, expected: number, offset: number, withDay: boolean) =>
  `${label} ${bar(r.percentUsed, WIDTH, expected)} ${r.percentUsed.toFixed(0)}% → ${fmtReset(Date.parse(r.resetsAt), offset, withDay)}`

async function show($: EngineInterface) {
  const s = await read($, session)
  const w = await read($, weekly)
  if (s === null && w === null) return

  const now = await $.clock.now()
  const offset = -new Date(now).getTimezoneOffset()
  const parts = [
    s && gauge('Session', s, linearPercent(now, Date.parse(s.resetsAt), FIVE_HOURS), offset, false),
    w && gauge('Week', w, expectedPercent(now, Date.parse(w.resetsAt), offset), offset, true),
  ]
  $.ui.status(parts.filter(Boolean).join('   '))
}

async function remember($: EngineInterface, limits: SessionRateLimit[]) {
  const s = toReading(limits.find(l => l.kind === 'five_hour'))
  const w = toReading(limits.find(l => l.kind === 'seven_day'))
  if (s) await update($, session, () => s)
  if (w) await update($, weekly, () => w)
  await show($)
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const result = await next(e)
    await remember($, (await $.session.usage()).rateLimits)
    // The pace marker moves with the clock, so redraw between readings too.
    $.clock.every(MINUTE, () => void show($))
    return result
  })

  on('session.measure', async ($, e, next) => {
    await remember($, e.rateLimits)
    return next(e)
  })
}
