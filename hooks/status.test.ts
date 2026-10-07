import { expect, mock, test } from 'claude-code/testing'

const DAY = 24 * 60 * 60 * 1000
const MON = Date.UTC(2026, 9, 5)

test('the status line shows session and weekly gauges once readings arrive', async ($, on) => {
  mock.clock(on, { now: MON + 2.5 * DAY })
  const lines: (string | undefined)[] = []
  on('ui.status', ($, e) => {
    lines.push(e.text)
    return { value: undefined }
  })
  on('session.measure', ($, e) => ({ changed: e.changed }))
  await $.session.measure({
    context: { window: 200000 },
    rateLimits: [
      { kind: 'five_hour', percentUsed: 17, resetsAt: new Date(MON + 2.5 * DAY + DAY / 12).toISOString() },
      { kind: 'seven_day', percentUsed: 42, resetsAt: new Date(MON + 7 * DAY).toISOString() },
    ],
    changed: ['rateLimits'],
  })
  const line = lines.at(-1) ?? ''
  expect(line).toMatch(/^Session .* 17% → \d\d:\d\d   Week .* 42% → Mon \d\d:\d\d$/)
  expect(line).not.toMatch(/resets|·|Weekly/)
})
