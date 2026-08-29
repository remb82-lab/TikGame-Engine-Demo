import type { BattleState, TeamId } from '../../types/live'

export interface OverlayTeamView {
  id: TeamId
  health: number
  energy: number
  shieldActive: boolean
  recentlyHit: boolean
  criticalHit: boolean
}

export class OverlayRenderer {
  team(state: BattleState, team: TeamId, now = Date.now()): OverlayTeamView {
    const source = state.teams[team]
    return {
      id: team,
      health: source.health,
      energy: source.energy,
      shieldActive: source.shieldUntil > now,
      recentlyHit: now - source.lastHitAt < 650,
      criticalHit: now - source.lastCriticalAt < 900,
    }
  }
}
