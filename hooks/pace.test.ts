import { expect, test } from 'claude-code/testing'

import { bar, expectedPercent, linearPercent, workdayMs } from './pace'

const DAY = 24 * 60 * 60 * 1000
const MON = Date.UTC(2026, 9, 5) // Monday 2026-10-05 00:00 UTC

test('a whole week counts five workdays', async () => {
  expect(workdayMs(MON, MON + 7 * DAY, 0)).toBe(5 * DAY)
})

test('window reset on Monday: Wednesday noon is halfway', async () => {
  expect(expectedPercent(MON + 2.5 * DAY, MON + 7 * DAY, 0)).toBe(50)
})

test('weekend adds nothing to the target', async () => {
  const sat = expectedPercent(MON + 5 * DAY, MON + 7 * DAY, 0)
  const sun = expectedPercent(MON + 6.9 * DAY, MON + 7 * DAY, 0)
  expect(sat).toBe(100)
  expect(sun).toBe(100)
})

test('window reset on Thursday: Friday end is 40%', async () => {
  const thu = MON + 3 * DAY
  expect(expectedPercent(thu + 2 * DAY, thu + 7 * DAY, 0)).toBe(40)
})

test('timezone offset shifts the day boundary', async () => {
  // Sunday 23:00 UTC is already Monday 01:00 at +120
  expect(workdayMs(MON - DAY / 24, MON, 120)).toBe(DAY / 24)
  expect(workdayMs(MON - DAY / 24, MON, 0)).toBe(0)
})

test('bar fills and marks', async () => {
  expect(bar(50, 10)).toBe('█████░░░░░')
  expect(bar(20, 10, 60)).toBe('██░░░┃░░░░')
})

test('session pace is linear over its five hours', async () => {
  const H = DAY / 24
  expect(linearPercent(MON + 2 * H, MON + 5 * H, 5 * H)).toBe(40)
  expect(linearPercent(MON - H, MON + 5 * H, 5 * H)).toBe(0)
  expect(linearPercent(MON + 6 * H, MON + 5 * H, 5 * H)).toBe(100)
})
