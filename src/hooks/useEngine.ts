import { useSyncExternalStore } from 'react'
import type { GameRuntime } from '../core/game/GameRuntime'
import type { EventSimulator } from '../core/simulator/EventSimulator'

export function useGameState(runtime: GameRuntime) {
  return useSyncExternalStore(runtime.subscribe, runtime.getSnapshot, runtime.getServerSnapshot)
}

export function useSimulatorState(simulator: EventSimulator) {
  return useSyncExternalStore(simulator.subscribe, simulator.getSnapshot, simulator.getServerSnapshot)
}
