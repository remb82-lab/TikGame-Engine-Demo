import type { BattleState, FeedItem, GameCommand, GameConfig, PlayerState, TeamId } from '../../types/live'

function createTeam(id: TeamId) {
  return { id, health: 100, energy: 0, shieldUntil: 0, lastHitAt: 0, lastCriticalAt: 0 }
}

function withFeed(state: BattleState, item: FeedItem): BattleState {
  return { ...state, feed: [item, ...state.feed].slice(0, 28) }
}

export class BattleArenaGame {
  createInitialState(config: GameConfig, now = Date.now()): BattleState {
    return {
      teams: { red: createTeam('red'), blue: createTeam('blue') },
      players: {},
      feed: [{ id: 'ready', timestamp: now, tone: 'neutral', text: 'Arena ready · waiting for LIVE events' }],
      winner: null,
      roundStartedAt: now,
      remainingSeconds: config.roundTime,
      config,
      running: true,
      revision: 0,
    }
  }

  applyCommand(state: BattleState, command: GameCommand, now = Date.now()): BattleState {
    if (state.winner) return state
    const current: PlayerState = state.players[command.user.id] ?? {
      user: command.user,
      team: null,
      score: 0,
      likes: 0,
      gifts: 0,
    }

    if (command.type === 'JOIN_TEAM') {
      const nextPlayer = { ...current, team: command.team, score: current.score + 2 }
      return withFeed(
        { ...state, players: { ...state.players, [command.user.id]: nextPlayer } },
        { id: crypto.randomUUID(), timestamp: now, tone: command.team, text: `@${command.user.username} joined ${command.team.toUpperCase()}` },
      )
    }

    const team = current.team
    if (!team) return state

    if (command.type === 'ADD_ENERGY') {
      const teamState = state.teams[team]
      const nextPlayer = { ...current, likes: current.likes + command.amount, score: current.score + command.amount }
      return withFeed(
        {
          ...state,
          teams: { ...state.teams, [team]: { ...teamState, energy: Math.min(100, teamState.energy + command.amount) } },
          players: { ...state.players, [current.user.id]: nextPlayer },
        },
        { id: crypto.randomUUID(), timestamp: now, tone: team, text: `@${command.user.username} liked · +${command.amount} energy` },
      )
    }

    if (command.type === 'BOOST') {
      const teamState = state.teams[team]
      return withFeed(
        { ...state, teams: { ...state.teams, [team]: { ...teamState, energy: Math.min(100, teamState.energy + command.amount) } } },
        { id: crypto.randomUUID(), timestamp: now, tone: team, text: `${team.toUpperCase()} received audience BOOST` },
      )
    }

    if (command.type === 'SHIELD') {
      const teamState = state.teams[team]
      const nextPlayer = { ...current, score: current.score + 8 }
      return withFeed(
        {
          ...state,
          teams: { ...state.teams, [team]: { ...teamState, shieldUntil: now + command.durationMs } },
          players: { ...state.players, [current.user.id]: nextPlayer },
        },
        { id: crypto.randomUUID(), timestamp: now, tone: team, text: `@${command.user.username} activated ${team.toUpperCase()} SHIELD` },
      )
    }

    const enemy: TeamId = team === 'red' ? 'blue' : 'red'
    const attacker = state.teams[team]
    const defender = state.teams[enemy]
    const isCritical = Math.random() < command.criticalChance
    const rawDamage = Math.round(command.damage * (isCritical ? 1.6 : 1))
    const shielded = defender.shieldUntil > now
    const damage = Math.max(1, Math.round(rawDamage * (shielded ? 0.35 : 1)))
    const nextHealth = Math.max(0, defender.health - damage)
    const nextPlayer = { ...current, gifts: current.gifts + 1, score: current.score + damage * 3 }
    const energyCost = command.label === 'POWER ATTACK' ? 20 : 8
    const winner: TeamId | null = nextHealth <= 0 ? team : null
    const nextState: BattleState = {
      ...state,
      winner,
      running: winner ? false : state.running,
      teams: {
        ...state.teams,
        [team]: { ...attacker, energy: Math.max(0, attacker.energy - energyCost) },
        [enemy]: { ...defender, health: nextHealth, lastHitAt: now, lastCriticalAt: isCritical ? now : defender.lastCriticalAt },
      },
      players: { ...state.players, [current.user.id]: nextPlayer },
    }
    let fed = withFeed(nextState, {
      id: crypto.randomUUID(),
      timestamp: now - 1,
      tone: team,
      text: `@${command.user.username} sent ${command.gift}${command.quantity > 1 ? ` ×${command.quantity}` : ''}`,
    })
    fed = withFeed(fed, {
      id: crypto.randomUUID(),
      timestamp: now,
      tone: isCritical ? 'gold' : team,
      text: `${team.toUpperCase()} used ${command.label} · ${isCritical ? 'CRITICAL ' : ''}-${damage} HP${shielded ? ' · shield absorbed' : ''}`,
    })
    if (winner) {
      fed = withFeed(fed, { id: crypto.randomUUID(), timestamp: now + 1, tone: winner, text: `${winner.toUpperCase()} TEAM WINS THE ROUND` })
    }
    return fed
  }

  tick(state: BattleState, now = Date.now()): BattleState {
    if (!state.running || state.winner) return state
    const elapsed = Math.floor((now - state.roundStartedAt) / 1000)
    const remainingSeconds = Math.max(0, state.config.roundTime - elapsed)
    if (remainingSeconds === state.remainingSeconds) return state

    let winner: TeamId | null = null
    if (remainingSeconds <= 0) {
      const red = state.teams.red.health
      const blue = state.teams.blue.health
      winner = red === blue
        ? (state.teams.red.energy >= state.teams.blue.energy ? 'red' : 'blue')
        : red > blue ? 'red' : 'blue'
    }
    let next = { ...state, remainingSeconds, winner, running: winner ? false : state.running }
    if (winner) next = withFeed(next, { id: crypto.randomUUID(), timestamp: now, tone: winner, text: `${winner.toUpperCase()} TEAM WINS ON TIME` })
    return next
  }

  updateConfig(state: BattleState, patch: Partial<GameConfig>, now = Date.now()): BattleState {
    const config = { ...state.config, ...patch }
    const elapsed = Math.floor((now - state.roundStartedAt) / 1000)
    return { ...state, config, remainingSeconds: Math.max(0, config.roundTime - elapsed) }
  }
}
