import type { BattleState } from '../../types/live'

export function EventFeed({ state }: { state: BattleState }) {
  return (
    <section className="panel feed-panel">
      <div className="panel__heading"><div><span className="eyebrow">EVENT STREAM</span><h3>Event Feed</h3></div><span className="live-chip"><i /> LIVE</span></div>
      <div className="feed-list" aria-live="polite" aria-relevant="additions">
        {state.feed.slice(0, 10).map((item) => (
          <div className={`feed-item feed-item--${item.tone}`} key={item.id}>
            <span className="feed-item__pulse" />
            <span>{item.text}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
