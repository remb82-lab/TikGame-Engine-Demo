import type { GameRuntime } from '../../core/game/GameRuntime'
import type { BattleState } from '../../types/live'

function Choice<T extends number>({ label, value, values, onChange }: { label: string; value: T; values: readonly T[]; onChange: (value: T) => void }) {
  return (
    <div className="mapping-setting">
      <div className="mapping-setting__label"><strong>{label}</strong><span>{String(value)}</span></div>
      <div className="segmented">{values.map((item) => <button key={String(item)} className={item === value ? 'is-active' : ''} onClick={() => onChange(item)}>{String(item)}</button>)}</div>
    </div>
  )
}

export function StudioPanel({ runtime, state }: { runtime: GameRuntime; state: BattleState }) {
  return (
    <section className="panel studio-panel">
      <div className="panel__heading"><div><span className="eyebrow">CREATOR STUDIO LITE</span><h3>Event Mapping</h3></div><span className="panel-badge">LIVE RULES</span></div>
      <div className="mapping-flow">
        <div><span>LIKE</span><b>→</b><strong>ADD_ENERGY</strong></div>
        <div><span>FOLLOW</span><b>→</b><strong>SHIELD</strong></div>
        <div><span>GIFT_SMALL</span><b>→</b><strong>ATTACK</strong></div>
        <div><span>GIFT_LARGE</span><b>→</b><strong>POWER_ATTACK</strong></div>
      </div>
      <Choice label="LIKE POWER" value={state.config.likePower} values={[1, 2, 5]} onChange={(likePower) => runtime.updateConfig({ likePower })} />
      <Choice label="GIFT DAMAGE" value={state.config.giftDamage} values={[5, 10, 25]} onChange={(giftDamage) => runtime.updateConfig({ giftDamage })} />
      <Choice label="ROUND TIME" value={state.config.roundTime} values={[30, 60, 90]} onChange={(roundTime) => runtime.updateConfig({ roundTime })} />
      <div className="studio-note"><span>⚡</span><p><strong>Instant runtime updates.</strong><br />Change a rule and the next simulated event uses it immediately.</p></div>
    </section>
  )
}
