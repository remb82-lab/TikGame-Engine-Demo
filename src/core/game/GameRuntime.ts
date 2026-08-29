import type { BattleState, FeedItem, GameConfig } from '../../types/live'
import { BattleArenaGame } from '../../games/battle-arena/BattleArenaGame'
import { DemoEventBus } from '../events/DemoEventBus'
import { EventMapper } from './EventMapper'

type StateListener = () => void

const INITIAL_CONFIG: GameConfig = { likePower: 2, giftDamage: 10, roundTime: 60 }

export class GameRuntime {
  private state: BattleState
  private readonly listeners = new Set<StateListener>()
  private readonly unsubscribeBus: () => void
  private timer: ReturnType<typeof setInterval> | null = null
  private pausedAt: number | null = null

  constructor(
    private readonly bus: DemoEventBus,
    private readonly mapper: EventMapper,
    private readonly game: BattleArenaGame = new BattleArenaGame(),
  ) {
    this.state = this.game.createInitialState(INITIAL_CONFIG)
    this.unsubscribeBus = this.bus.subscribe((event) => {
      const commands = this.mapper.map(event, this.state)
      if (commands.length === 0) return
      let next = this.state
      for (const command of commands) next = this.game.applyCommand(next, command)
      this.commit(next)
    })
  }

  getSnapshot = (): BattleState => this.state
  getServerSnapshot = (): BattleState => this.state

  subscribe = (listener: StateListener): (() => void) => {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private commit(next: BattleState): void {
    if (next === this.state) return
    this.state = { ...next, revision: this.state.revision + 1 }
    for (const listener of this.listeners) listener()
  }

  private addSystemFeed(text: string): BattleState {
    const item: FeedItem = { id: crypto.randomUUID(), timestamp: Date.now(), tone: 'neutral', text }
    return { ...this.state, feed: [item, ...this.state.feed].slice(0, 28) }
  }

  private tick(): void {
    this.commit(this.game.tick(this.state))
  }

  updateConfig(patch: Partial<GameConfig>): void {
    this.commit(this.game.updateConfig(this.state, patch))
  }

  setRunning(running: boolean): void {
    if (this.state.winner || this.state.running === running) return
    const now = Date.now()
    if (!running) {
      this.pausedAt = now
      this.state = { ...this.state, running: false }
      this.commit(this.addSystemFeed('Simulation paused'))
      return
    }
    const pausedFor = this.pausedAt ? now - this.pausedAt : 0
    this.pausedAt = null
    this.state = { ...this.state, running: true, roundStartedAt: this.state.roundStartedAt + pausedFor }
    this.commit(this.addSystemFeed('Simulation resumed'))
  }

  reset(): void {
    this.pausedAt = null
    this.commit(this.game.createInitialState(this.state.config))
  }

  start(): void {
    if (!this.timer) this.timer = setInterval(() => this.tick(), 1000)
  }

  dispose(): void {
    if (this.timer) clearInterval(this.timer)
    this.timer = null
    this.unsubscribeBus()
    this.listeners.clear()
  }
}
