import type { CSSProperties } from 'react'
import type { DemoUser } from '../../types/live'

export function Avatar({ user, small = false }: { user: DemoUser; small?: boolean }) {
  const initials = user.displayName.split(' ').map((part) => part[0]).join('').slice(0, 2)
  const hue = (user.avatarSeed * 13) % 360
  return (
    <span className={`avatar ${small ? 'avatar--small' : ''}`} style={{ '--avatar-hue': `${hue}deg` } as CSSProperties} aria-hidden="true">
      {initials}
    </span>
  )
}
