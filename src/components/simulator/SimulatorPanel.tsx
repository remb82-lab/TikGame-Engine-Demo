import { useState, type ChangeEvent } from 'react'
import type { EventSimulator, ScenarioName } from '../../core/simulator/EventSimulator'
import type { GameRuntime } from '../../core/game/GameRuntime'
import { demoUsers } from '../../data/users'
import { useSimulatorState } from '../../hooks/useEngine'

const scenarios: ScenarioName[] = ['Quiet Stream', 'Active Stream', 'Gift Battle', 'Chaos Mode']

export function SimulatorPanel({ simulator, runtime, onReset }: { simulator: EventSimulator; runtime: GameRuntime; onReset: () => void }) {
  const state = useSimulatorState(simulator)
  const [comment, setComment] = useState<'red' | 'blue' | 'boost'>('red')
  const [gift, setGift] = useState<'ROSE' | 'STAR' | 'GALAXY'>('ROSE')
  return (
    <section className="panel control-panel">
      <div className="panel__heading"><div><span className="eyebrow">LOCAL SOURCE</span><h3>Live Event Simulator</h3></div><span className="panel-badge">NO API</span></div>
      <label className="field-label">Test user</label>
      <div className="inline-control">
        <select aria-label="Test user" value={state.selectedUser.id} onChange={(event: ChangeEvent<HTMLSelectElement>) => simulator.setUser(demoUsers.find((u) => u.id === event.target.value) ?? demoUsers[0])}>
          {demoUsers.map((user) => <option value={user.id} key={user.id}>@{user.username}</option>)}
        </select>
        <button className="icon-button" onClick={() => simulator.randomUser()} title="Random user">⟳</button>
      </div>
      <div className="comment-command">
        <select aria-label="Comment command" value={comment} onChange={(event: ChangeEvent<HTMLSelectElement>) => setComment(event.target.value as 'red' | 'blue' | 'boost')}>
          <option value="red">COMMENT: red</option>
          <option value="blue">COMMENT: blue</option>
          <option value="boost">COMMENT: boost</option>
        </select>
        <button onClick={() => simulator.emitComment(comment)}>SEND</button>
      </div>
      <div className="event-buttons">
        <button onClick={() => simulator.emitEvent('LIKE')}><span>♥</span> LIKE</button>
        <button onClick={() => simulator.emitEvent('FOLLOW')}><span>＋</span> FOLLOW</button>
      </div>
      <div className="gift-command">
        <select aria-label="Gift type" value={gift} onChange={(event: ChangeEvent<HTMLSelectElement>) => setGift(event.target.value as 'ROSE' | 'STAR' | 'GALAXY')}>
          <option value="ROSE">ROSE · small</option>
          <option value="STAR">STAR · large</option>
          <option value="GALAXY">GALAXY · large</option>
        </select>
        <button onClick={() => simulator.emitGift(gift)}>✦ GIFT</button>
      </div>
      <label className="field-label">Scenario</label>
      <select aria-label="Demo scenario" value={state.scenario} onChange={(event: ChangeEvent<HTMLSelectElement>) => simulator.setScenario(event.target.value as ScenarioName)}>
        {scenarios.map((scenario) => <option key={scenario}>{scenario}</option>)}
      </select>
      <div className="segmented segmented--speed">
        {[0.5, 1, 2, 4].map((speed) => <button className={state.speed === speed ? 'is-active' : ''} onClick={() => simulator.setSpeed(speed)} key={speed}>{speed}×</button>)}
      </div>
      <div className="control-actions">
        <button className={state.autoRunning ? 'secondary-action is-active' : 'secondary-action'} onClick={() => state.autoRunning ? simulator.stopAuto() : simulator.startAuto()}>{state.autoRunning ? '■ Stop Auto' : '▶ Auto Demo'}</button>
        <button className="secondary-action" onClick={() => { if (state.paused) { simulator.resume(); runtime.setRunning(true) } else { simulator.pause(); runtime.setRunning(false) } }}>{state.paused ? '▶ Resume' : 'Ⅱ Pause'}</button>
      </div>
      <div className="toggle-row"><span><strong>Burst Mode</strong><small>Amplify event intensity</small></span><button aria-label="Burst Mode" aria-pressed={state.burst} className={`switch ${state.burst ? 'switch--on' : ''}`} onClick={() => simulator.setBurst(!state.burst)}><i /></button></div>
      <button className="reset-link" onClick={onReset}>↻ Reset arena</button>
    </section>
  )
}
