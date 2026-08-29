import { describe, expect, it, vi } from 'vitest'
import { DemoEventBus } from '../events/DemoEventBus'
import { EventMapper } from './EventMapper'
import { GameRuntime } from './GameRuntime'
import { EventSimulator } from '../simulator/EventSimulator'
import type { DemoUser } from '../../types/live'

const user: DemoUser = { id: 'u1', username: 'tester', displayName: 'Tester', avatarSeed: 1 }
const enemy: DemoUser = { id: 'u2', username: 'enemy', displayName: 'Enemy', avatarSeed: 2 }

describe('GameRuntime', () => {
  it('maps comments and likes into team energy without UI dependencies', () => {
    vi.useFakeTimers()
    const bus = new DemoEventBus()
    const runtime = new GameRuntime(bus, new EventMapper())
    bus.publish({ id: '1', type: 'COMMENT', user, timestamp: 1, payload: { text: 'red' } })
    bus.publish({ id: '2', type: 'LIKE', user, timestamp: 2, payload: { count: 5 } })
    expect(runtime.getSnapshot().players.u1.team).toBe('red')
    expect(runtime.getSnapshot().teams.red.energy).toBe(10)
    runtime.dispose()
    vi.useRealTimers()
  })

  it('applies shield reduction and gift attack damage', () => {
    vi.useFakeTimers()
    const bus = new DemoEventBus()
    const runtime = new GameRuntime(bus, new EventMapper())
    bus.publish({ id: '1', type: 'COMMENT', user, timestamp: 1, payload: { text: 'red' } })
    bus.publish({ id: '2', type: 'COMMENT', user: enemy, timestamp: 2, payload: { text: 'blue' } })
    bus.publish({ id: '3', type: 'FOLLOW', user: enemy, timestamp: 3, payload: { active: true } })
    vi.spyOn(Math, 'random').mockReturnValue(0.99)
    bus.publish({ id: '4', type: 'GIFT', user, timestamp: 4, payload: { gift: 'ROSE', tier: 'small', quantity: 1 } })
    expect(runtime.getSnapshot().teams.blue.health).toBeGreaterThan(90)
    expect(runtime.getSnapshot().teams.blue.health).toBeLessThan(100)
    runtime.dispose()
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('finishes the scripted showcase even at minimum damage and 4x event speed', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-29T18:00:00Z'))
    vi.spyOn(Math, 'random').mockReturnValue(0.99)
    const bus = new DemoEventBus()
    const runtime = new GameRuntime(bus, new EventMapper())
    const simulator = new EventSimulator(bus)
    runtime.updateConfig({ giftDamage: 5 })
    simulator.setSpeed(4)
    simulator.runScriptedDemo()
    vi.advanceTimersByTime(3_000)
    expect(runtime.getSnapshot().winner).toBe('red')
    expect(Object.keys(runtime.getSnapshot().players).length).toBeGreaterThanOrEqual(8)
    simulator.dispose()
    runtime.dispose()
    vi.restoreAllMocks()
    vi.useRealTimers()
  })
})
