# TikGame Living World — Stream Scene

## What it is

`public/living-world.html` is a standalone vertical stream scene for OBS/TikTok LIVE. It keeps running even with zero viewer events: autonomous red/blue inhabitants gather crystals, return resources to their side, fight nearby enemies, respawn, and react to world events.

## OBS setup

1. Add a **Browser Source**.
2. Use the deployed GitHub Pages URL ending in `/living-world.html`.
3. Set **Width: 1080** and **Height: 1920**.
4. FPS: **30** is the default safe choice for modest streaming PCs; 60 FPS is optional.
5. Do not add `?controls=1` in production.

For local testing, open:

`living-world.html?controls=1`

The debug panel can spawn red/blue viewers and trigger meteor/storm/surge events.

## Viewer commands

- `!red` — joins the Red clan and spawns a named inhabitant.
- `!blue` — joins the Blue clan and spawns a named inhabitant.
- `!heal red` / `!heal blue` — heals the chosen clan.
- `!meteor` — triggers a meteor shower.
- `!storm` — triggers an energy storm.

## LIVE bridge contract

The public demo does **not** connect directly to TikTok. A local LIVE connector can inject normalized events into the scene.

In the page context:

```js
window.TikGameLivingWorld.emit({ type: 'comment', user: 'alex', text: '!red' })
window.TikGameLivingWorld.emit({ type: 'like', user: 'alex', team: 'red', count: 25 })
window.TikGameLivingWorld.emit({ type: 'follow', user: 'alex', team: 'blue' })
window.TikGameLivingWorld.emit({ type: 'gift', user: 'alex', team: 'red', value: 25 })
window.TikGameLivingWorld.emit({ type: 'world', action: 'meteor' })
```

It also accepts `window.postMessage` events in this shape:

```js
window.postMessage({
  source: 'tikgame-live',
  event: { type: 'comment', user: 'alex', text: '!blue' }
}, '*')
```

## Stream behavior

- One cycle lasts 90 seconds.
- The world auto-generates resources and global events.
- Red and Blue scores are earned from crystal delivery, combat, joins, likes, follows, and gifts.
- Large gift values trigger a temporary clan surge.
- The next cycle starts automatically, so the scene can run continuously.

## Performance notes

The scene is dependency-free and rendered with Canvas 2D using an isometric 3D-like projection. Device pixel ratio is capped to reduce GPU/CPU load. It is intended to remain lighter than a full WebGL engine while still reading as a dynamic 3D world in a vertical stream.
