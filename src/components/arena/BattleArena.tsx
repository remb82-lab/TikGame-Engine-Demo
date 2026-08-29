import type { BattleState, TeamId } from '../../types/live'
import { OverlayRenderer } from '../../core/game/OverlayRenderer'

const overlayRenderer = new OverlayRenderer()

function TeamFighter({ team, state }: { team: TeamId; state: BattleState }) {
  const view = overlayRenderer.team(state, team)
  const opponent = team === 'red' ? 'blue' : 'red'
  return (
    <div className={`fighter fighter--${team} ${view.recentlyHit ? 'fighter--hit' : ''}`}>
      <div className="fighter__avatar">
        <div className="fighter__core"><span>{team === 'red' ? 'R' : 'B'}</span></div>
        <div className="fighter__orbit fighter__orbit--one" />
        <div className="fighter__orbit fighter__orbit--two" />
        {view.shieldActive && <div className="fighter__shield">SHIELD</div>}
        {view.criticalHit && <div className="critical-burst">CRITICAL!</div>}
      </div>
      <div className="fighter__label">TEAM {team.toUpperCase()}</div>
      <div className="fighter__status">Targeting {opponent.toUpperCase()}</div>
    </div>
  )
}

function Meter({ value, kind }: { value: number; kind: 'health' | 'energy' }) {
  return <div className={`meter meter--${kind}`}><div className="meter__fill" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} /></div>
}

export function BattleArena({ state, onRunDemo }: { state: BattleState; onRunDemo: () => void }) {
  return (
    <section className="arena-shell" aria-label="LIVE Battle Arena">
      <div className="arena">
        <div className="arena__scanline" />
        <header className="arena__header">
          <div><span className="live-dot" /> LIVE BATTLE ARENA</div>
          <div className="round-clock">00:{String(state.remainingSeconds).padStart(2, '0')}</div>
        </header>
        <div className="battle-score">
          {(['red', 'blue'] as TeamId[]).map((team) => (
            <div className={`battle-score__team battle-score__team--${team}`} key={team}>
              <div className="battle-score__line"><strong>{team.toUpperCase()}</strong><span>{state.teams[team].health} HP</span></div>
              <Meter value={state.teams[team].health} kind="health" />
              <div className="battle-score__line battle-score__line--energy"><span>ENERGY</span><span>{state.teams[team].energy}%</span></div>
              <Meter value={state.teams[team].energy} kind="energy" />
            </div>
          ))}
        </div>
        <div className="arena__versus"><span>VS</span></div>
        <div className="arena__fighters">
          <TeamFighter team="red" state={state} />
          <TeamFighter team="blue" state={state} />
        </div>
        <div className="arena__floor"><span>SIMULATED LIVE SIGNAL</span><span>ENGINE ONLINE</span></div>
        {Object.keys(state.players).length === 0 && !state.winner && (
          <div className="arena-intro">
            <span className="eyebrow">INTERACTIVE STREAMING DEMO</span>
            <h2>Audience actions<br />become gameplay.</h2>
            <p>Watch comments, likes, follows and gifts flow through the engine in real time.</p>
            <button className="primary-action primary-action--hero" onClick={onRunDemo}>▶ Run Live Demo</button>
          </div>
        )}
        {state.winner && (
          <div className={`winner winner--${state.winner}`} role="status" aria-live="assertive">
            <div className="winner__burst" />
            <span className="eyebrow">ROUND COMPLETE</span>
            <div className="winner__title">{state.winner.toUpperCase()} WINS</div>
            <p>LIVE events → engine rules → game state</p>
            <button className="primary-action" onClick={onRunDemo}>↻ Replay Demo</button>
          </div>
        )}
      </div>
    </section>
  )
}
