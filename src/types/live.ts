export type TeamId = 'red' | 'blue'
export type LiveEventType = 'COMMENT' | 'LIKE' | 'FOLLOW' | 'GIFT'

export interface DemoUser {
  id: string
  username: string
  displayName: string
  avatarSeed: number
}

interface EventBase<TType extends LiveEventType, TPayload> {
  id: string
  type: TType
  user: DemoUser
  timestamp: number
  payload: TPayload
}

export type CommentEvent = EventBase<'COMMENT', { text: string }>
export type LikeEvent = EventBase<'LIKE', { count: number }>
export type FollowEvent = EventBase<'FOLLOW', { active: true }>
export type GiftEvent = EventBase<'GIFT', { gift: 'ROSE' | 'STAR' | 'GALAXY'; tier: 'small' | 'large'; quantity: number }>

export type LiveEvent = CommentEvent | LikeEvent | FollowEvent | GiftEvent

export interface GameConfig {
  likePower: 1 | 2 | 5
  giftDamage: 5 | 10 | 25
  roundTime: 30 | 60 | 90
}

export interface PlayerState {
  user: DemoUser
  team: TeamId | null
  score: number
  likes: number
  gifts: number
}

export interface TeamState {
  id: TeamId
  health: number
  energy: number
  shieldUntil: number
  lastHitAt: number
  lastCriticalAt: number
}

export interface FeedItem {
  id: string
  timestamp: number
  tone: TeamId | 'neutral' | 'gold'
  text: string
}

export interface BattleState {
  teams: Record<TeamId, TeamState>
  players: Record<string, PlayerState>
  feed: FeedItem[]
  winner: TeamId | null
  roundStartedAt: number
  remainingSeconds: number
  config: GameConfig
  running: boolean
  revision: number
}

export type GameCommand =
  | { type: 'JOIN_TEAM'; user: DemoUser; team: TeamId }
  | { type: 'ADD_ENERGY'; user: DemoUser; amount: number }
  | { type: 'SHIELD'; user: DemoUser; durationMs: number }
  | { type: 'ATTACK'; user: DemoUser; damage: number; label: string; criticalChance: number; gift: GiftEvent['payload']['gift']; quantity: number }
  | { type: 'BOOST'; user: DemoUser; amount: number }
