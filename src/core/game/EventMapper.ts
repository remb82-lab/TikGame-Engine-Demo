import type { BattleState, GameCommand, LiveEvent, TeamId } from '../../types/live'

export class EventMapper {
  map(event: LiveEvent, state: BattleState): GameCommand[] {
    const player = state.players[event.user.id]
    const team = player?.team ?? null

    switch (event.type) {
      case 'COMMENT': {
        const command = event.payload.text.trim().toLowerCase()
        if (command === 'red' || command === 'blue') {
          return [{ type: 'JOIN_TEAM', user: event.user, team: command as TeamId }]
        }
        if (command === 'boost' && team) {
          return [{ type: 'BOOST', user: event.user, amount: 5 }]
        }
        return []
      }
      case 'LIKE':
        return team
          ? [{ type: 'ADD_ENERGY', user: event.user, amount: event.payload.count * state.config.likePower }]
          : []
      case 'FOLLOW':
        return team ? [{ type: 'SHIELD', user: event.user, durationMs: 5_000 }] : []
      case 'GIFT': {
        if (!team) return []
        const multiplier = event.payload.tier === 'large' ? 2.4 : 1
        return [{
          type: 'ATTACK',
          user: event.user,
          damage: Math.round(state.config.giftDamage * multiplier * event.payload.quantity),
          label: event.payload.tier === 'large' ? 'POWER ATTACK' : 'ATTACK',
          criticalChance: event.payload.tier === 'large' ? 0.35 : 0.12,
          gift: event.payload.gift,
          quantity: event.payload.quantity,
        }]
      }
    }
  }
}
