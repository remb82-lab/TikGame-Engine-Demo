import type { DemoUser, GiftEvent, LiveEvent, LiveEventType } from '../../types/live'
import { demoUsers } from '../../data/users'
import { DemoEventBus } from '../events/DemoEventBus'

export type ScenarioName = 'Quiet Stream' | 'Active Stream' | 'Gift Battle' | 'Chaos Mode'

type SimulatorListener = () => void

interface SimulatorState {
  selectedUser: DemoUser
  scenario: ScenarioName
  speed: number
  autoRunning: boolean
  paused: boolean
  burst: boolean
  revision: number
}

export class EventSimulator {
  private state: SimulatorState = {
    selectedUser: demoUsers[0],
    scenario: 'Active Stream',
    speed: 1,
    autoRunning: false,
    paused: false,
    burst: false,
    revision: 0,
  }
  private listeners = new Set<SimulatorListener>()
  private scriptTimer: ReturnType<typeof setInterval> | null = null
  private autoTimer: ReturnType<typeof setInterval> | null = null

  constructor(private readonly bus: DemoEventBus) {}

  getSnapshot = (): SimulatorState => this.state
  getServerSnapshot = (): SimulatorState => this.state
  subscribe = (listener: SimulatorListener): (() => void) => {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }
  private emit(): void {
    this.state = { ...this.state, revision: this.state.revision + 1 }
    for (const listener of this.listeners) listener()
  }

  setUser(user: DemoUser): void { this.state = { ...this.state, selectedUser: user }; this.emit() }
  randomUser(): DemoUser {
    const user = demoUsers[Math.floor(Math.random() * demoUsers.length)]
    this.setUser(user)
    return user
  }
  setScenario(scenario: ScenarioName): void { this.state = { ...this.state, scenario }; this.emit() }
  setSpeed(speed: number): void { this.state = { ...this.state, speed }; this.emit(); if (this.state.autoRunning) this.startAuto() }
  setBurst(burst: boolean): void { this.state = { ...this.state, burst }; this.emit() }
  pause(): void { this.state = { ...this.state, paused: true }; this.emit() }
  resume(): void { this.state = { ...this.state, paused: false }; this.emit() }

  emitComment(text: string, user = this.state.selectedUser): LiveEvent {
    const event: LiveEvent = { id: crypto.randomUUID(), type: 'COMMENT', user, timestamp: Date.now(), payload: { text } }
    this.bus.publish(event)
    return event
  }

  emitGift(gift: GiftEvent['payload']['gift'], user = this.state.selectedUser): LiveEvent {
    const tier: GiftEvent['payload']['tier'] = gift === 'ROSE' ? 'small' : 'large'
    const event: LiveEvent = { id: crypto.randomUUID(), type: 'GIFT', user, timestamp: Date.now(), payload: { gift, tier, quantity: this.state.burst ? 2 : 1 } }
    this.bus.publish(event)
    return event
  }

  emitEvent(type: LiveEventType, user = this.state.selectedUser): LiveEvent {
    const now = Date.now()
    let event: LiveEvent
    switch (type) {
      case 'COMMENT':
        event = { id: crypto.randomUUID(), type, user, timestamp: now, payload: { text: Math.random() > 0.48 ? 'red' : 'blue' } }
        break
      case 'LIKE':
        event = { id: crypto.randomUUID(), type, user, timestamp: now, payload: { count: this.state.burst ? 10 : 1 + Math.floor(Math.random() * 5) } }
        break
      case 'FOLLOW':
        event = { id: crypto.randomUUID(), type, user, timestamp: now, payload: { active: true } }
        break
      case 'GIFT': {
        const large = Math.random() > 0.68
        const gift: GiftEvent['payload']['gift'] = large ? (Math.random() > 0.5 ? 'GALAXY' : 'STAR') : 'ROSE'
        event = { id: crypto.randomUUID(), type, user, timestamp: now, payload: { gift, tier: large ? 'large' : 'small', quantity: this.state.burst ? 2 : 1 } }
        break
      }
    }
    this.bus.publish(event)
    return event
  }

  private pickAutoType(): LiveEventType {
    const roll = Math.random()
    switch (this.state.scenario) {
      case 'Quiet Stream': return roll < 0.56 ? 'LIKE' : roll < 0.79 ? 'COMMENT' : roll < 0.94 ? 'FOLLOW' : 'GIFT'
      case 'Gift Battle': return roll < 0.30 ? 'LIKE' : roll < 0.45 ? 'COMMENT' : roll < 0.56 ? 'FOLLOW' : 'GIFT'
      case 'Chaos Mode': return roll < 0.30 ? 'LIKE' : roll < 0.52 ? 'COMMENT' : roll < 0.70 ? 'FOLLOW' : 'GIFT'
      default: return roll < 0.46 ? 'LIKE' : roll < 0.67 ? 'COMMENT' : roll < 0.84 ? 'FOLLOW' : 'GIFT'
    }
  }

  startAuto(): void {
    this.stopAuto(false)
    this.state = { ...this.state, autoRunning: true }
    this.emit()
    const base = this.state.scenario === 'Quiet Stream' ? 1250 : this.state.scenario === 'Chaos Mode' ? 260 : 650
    this.autoTimer = setInterval(() => {
      if (this.state.paused) return
      const user = demoUsers[Math.floor(Math.random() * demoUsers.length)]
      const type = this.pickAutoType()
      this.emitEvent(type, user)
      if (this.state.burst && Math.random() > 0.58) this.emitEvent('LIKE', user)
    }, Math.max(90, base / this.state.speed))
  }

  stopAuto(emit = true): void {
    if (this.autoTimer) clearInterval(this.autoTimer)
    this.autoTimer = null
    this.state = { ...this.state, autoRunning: false }
    if (emit) this.emit()
  }

  runScriptedDemo(): void {
    this.stopAuto(false)
    this.clearScriptTimers()
    this.state = { ...this.state, autoRunning: true, paused: false, scenario: 'Active Stream' }
    this.emit()

    const redUsers = [demoUsers[0], demoUsers[2], demoUsers[4], demoUsers[6]]
    const blueUsers = [demoUsers[1], demoUsers[3], demoUsers[5], demoUsers[7]]
    const actions: Array<{ at: number; run: () => void }> = []
    const at = (time: number, run: () => void) => actions.push({ at: time, run })

    ;[...redUsers, ...blueUsers].forEach((user, index) => at(260 + index * 190, () => {
      this.bus.publish({ id: crypto.randomUUID(), type: 'COMMENT', user, timestamp: Date.now(), payload: { text: redUsers.includes(user) ? 'red' : 'blue' } })
    }))
    for (let i = 0; i < 16; i++) at(2100 + i * 170, () => this.emitEvent('LIKE', i % 2 === 0 ? redUsers[i % redUsers.length] : blueUsers[i % blueUsers.length]))
    at(3850, () => this.emitEvent('FOLLOW', blueUsers[1]))
    at(4300, () => this.emitEvent('GIFT', redUsers[0]))
    at(5000, () => this.emitEvent('GIFT', blueUsers[0]))
    at(5600, () => this.emitEvent('FOLLOW', redUsers[2]))
    at(6100, () => this.emitEvent('GIFT', redUsers[1]))
    at(6800, () => this.emitEvent('GIFT', blueUsers[2]))
    at(7500, () => this.bus.publish({ id: crypto.randomUUID(), type: 'GIFT', user: redUsers[0], timestamp: Date.now(), payload: { gift: 'GALAXY', tier: 'large', quantity: 1 } }))
    at(8300, () => this.bus.publish({ id: crypto.randomUUID(), type: 'GIFT', user: redUsers[2], timestamp: Date.now(), payload: { gift: 'GALAXY', tier: 'large', quantity: 1 } }))
    at(9000, () => this.bus.publish({ id: crypto.randomUUID(), type: 'GIFT', user: redUsers[0], timestamp: Date.now(), payload: { gift: 'GALAXY', tier: 'large', quantity: 1 } }))
    at(9700, () => this.bus.publish({ id: crypto.randomUUID(), type: 'GIFT', user: redUsers[1], timestamp: Date.now(), payload: { gift: 'GALAXY', tier: 'large', quantity: 6 } }))
    at(9900, () => this.bus.publish({ id: crypto.randomUUID(), type: 'GIFT', user: redUsers[3], timestamp: Date.now(), payload: { gift: 'GALAXY', tier: 'large', quantity: 6 } }))
    at(10100, () => this.bus.publish({ id: crypto.randomUUID(), type: 'GIFT', user: redUsers[0], timestamp: Date.now(), payload: { gift: 'STAR', tier: 'large', quantity: 6 } }))
    at(10300, () => this.bus.publish({ id: crypto.randomUUID(), type: 'GIFT', user: redUsers[2], timestamp: Date.now(), payload: { gift: 'GALAXY', tier: 'large', quantity: 6 } }))

    actions.sort((a, b) => a.at - b.at)
    let elapsed = 0
    let index = 0
    const frameMs = 40
    this.scriptTimer = setInterval(() => {
      if (this.state.paused) return
      elapsed += frameMs * this.state.speed
      while (index < actions.length && actions[index].at <= elapsed) actions[index++].run()
      if (index >= actions.length) {
        this.clearScriptTimers()
        this.state = { ...this.state, autoRunning: false }
        this.emit()
      }
    }, frameMs)
  }

  clearScriptTimers(): void {
    if (this.scriptTimer) clearInterval(this.scriptTimer)
    this.scriptTimer = null
  }
  dispose(): void { this.stopAuto(false); this.clearScriptTimers(); this.listeners.clear() }
}
