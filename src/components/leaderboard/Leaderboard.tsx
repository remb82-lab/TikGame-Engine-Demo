import type { BattleState } from '../../types/live'
import { Avatar } from '../arena/Avatar'

export function Leaderboard({ state }: { state: BattleState }) {
  const players = Object.values(state.players).filter((player) => player.team).sort((a, b) => b.score - a.score).slice(0, 6)
  return (
    <section className="panel leaderboard-panel">
      <div className="panel__heading"><div><span className="eyebrow">LIVE RANKING</span><h3>Leaderboard</h3></div><span className="panel-badge">TOP {Math.max(players.length, 3)}</span></div>
      <div className="leaderboard-list">
        {players.length === 0 ? <div className="empty-state">Players appear after joining RED or BLUE.</div> : players.map((player, index) => (
          <div className="leaderboard-row" key={player.user.id}>
            <span className="rank">{String(index + 1).padStart(2, '0')}</span>
            <Avatar user={player.user} small />
            <div className="leaderboard-row__identity"><strong>@{player.user.username}</strong><span>{player.likes} energy · {player.gifts} gifts</span></div>
            <span className={`team-pill team-pill--${player.team}`}>{player.team?.toUpperCase()}</span>
            <strong className="score">{player.score}</strong>
          </div>
        ))}
      </div>
    </section>
  )
}
