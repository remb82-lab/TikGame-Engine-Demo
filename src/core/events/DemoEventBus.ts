import type { LiveEvent } from '../../types/live'

type Listener = (event: LiveEvent) => void

export class DemoEventBus {
  private listeners = new Set<Listener>()

  publish(event: LiveEvent): void {
    for (const listener of this.listeners) listener(event)
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  clear(): void {
    this.listeners.clear()
  }
}
