import { useEffect, useMemo, useState } from 'react'
import { DemoEventBus } from '../core/events/DemoEventBus'
import { EventMapper } from '../core/game/EventMapper'
import { GameRuntime } from '../core/game/GameRuntime'
import { EventSimulator } from '../core/simulator/EventSimulator'
import { BattleArena } from '../components/arena/BattleArena'
import { EventFeed } from '../components/event-feed/EventFeed'
import { Leaderboard } from '../components/leaderboard/Leaderboard'
import { SimulatorPanel } from '../components/simulator/SimulatorPanel'
import { StudioPanel } from '../components/studio/StudioPanel'
import { useGameState } from '../hooks/useEngine'

export function App() {
  const engine = useMemo(() => {
    const bus = new DemoEventBus()
    const mapper = new EventMapper()
    const runtime = new GameRuntime(bus, mapper)
    const simulator = new EventSimulator(bus)
    return { runtime, simulator }
  }, [])
  useEffect(() => {
    engine.runtime.start()
    return () => {
      engine.simulator.dispose()
      engine.runtime.dispose()
    }
  }, [engine])

  const state = useGameState(engine.runtime)
  const [mobileTab, setMobileTab] = useState<'game' | 'simulator' | 'studio'>('game')

  const runDemo = () => {
    engine.runtime.reset()
    engine.simulator.runScriptedDemo()
    setMobileTab('game')
  }
  const reset = () => {
    engine.simulator.stopAuto()
    engine.simulator.clearScriptTimers()
    engine.simulator.resume()
    engine.runtime.reset()
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="TikGame Engine Demo home">
          <span className="brand-mark"><i /><i /><i /></span>
          <span><strong>TIKGAME</strong><small>ENGINE DEMO</small></span>
        </a>
        <div className="topbar__pipeline"><span>EVENT</span><b>→</b><span>ENGINE</span><b>→</b><span>GAME</span></div>
        <a className="github-link" href="https://github.com/remb82-lab/TikGame-Engine-Demo" target="_blank" rel="noreferrer">GitHub ↗</a>
      </header>

      <section className="hero-copy" id="top">
        <div><span className="eyebrow">INTERACTIVE LIVE GAME ENGINE · PUBLIC DEMO</span><h1>Turn audience events<br />into <em>gameplay.</em></h1></div>
        <p>Comments choose a side. Likes charge energy. Follows trigger shields. Gifts become attacks. No external API required.</p>
      </section>

      <nav className="mobile-tabs" aria-label="Demo sections">
        <button className={mobileTab === 'game' ? 'is-active' : ''} onClick={() => setMobileTab('game')}>Arena</button>
        <button className={mobileTab === 'simulator' ? 'is-active' : ''} onClick={() => setMobileTab('simulator')}>Simulator</button>
        <button className={mobileTab === 'studio' ? 'is-active' : ''} onClick={() => setMobileTab('studio')}>Studio</button>
      </nav>

      <div className="demo-grid">
        <aside className={`demo-column demo-column--left ${mobileTab === 'simulator' ? 'is-mobile-active' : ''}`}>
          <SimulatorPanel simulator={engine.simulator} runtime={engine.runtime} onReset={reset} />
          <EventFeed state={state} />
        </aside>
        <section className={`demo-center ${mobileTab === 'game' ? 'is-mobile-active' : ''}`}>
          <BattleArena state={state} onRunDemo={runDemo} />
          <div className="runtime-status"><span><i /> DemoEventBus</span><b>→</b><span><i /> EventMapper</span><b>→</b><span><i /> GameRuntime</span><b>→</b><span><i /> OverlayRenderer</span></div>
        </section>
        <aside className={`demo-column demo-column--right ${mobileTab === 'studio' ? 'is-mobile-active' : ''}`}>
          <StudioPanel runtime={engine.runtime} state={state} />
          <Leaderboard state={state} />
        </aside>
      </div>

      <section className="architecture-strip">
        <span className="eyebrow">THE POINT OF THE DEMO</span>
        <h2>A small public showcase of the engine boundary.</h2>
        <div className="architecture-cards">
          <article><span>01</span><strong>EVENT</strong><p>Local simulator produces typed COMMENT, LIKE, FOLLOW and GIFT events.</p></article>
          <article><span>02</span><strong>ENGINE</strong><p>The UI-independent runtime maps events into deterministic game commands and state.</p></article>
          <article><span>03</span><strong>GAME</strong><p>The Battle Arena renders health, energy, shields, damage, ranking and winner state.</p></article>
        </div>
      </section>
      <footer><span>Built as an independent public demo by <strong>remb82-lab</strong>.</span><span>This project uses simulated LIVE events and does not connect to TikTok APIs.</span></footer>
    </main>
  )
}
