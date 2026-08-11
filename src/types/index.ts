export interface Character {
  name: string
  className: string
}

export type UserRole = 'master' | 'member'
export type UserStatus = 'pending' | 'approved' | 'rejected'

export interface UserProfile {
  id: string
  name: string
  email: string
  phone: string
  characters: Character[]
  role: UserRole
  status: UserStatus
  helpedCount: number
  wasHelpedCount: number
  createdAt: Record<string, unknown>
}

export type RequestStatus = 'open' | 'in_progress' | 'completed'

export interface HelpRequest {
  id: string
  creatorId: string
  creatorName: string
  title: string
  description: string
  status: RequestStatus
  difficultyVotes: Record<string, number>
  helpers: string[]
  completedHelpers: string[]
  createdAt: Record<string, unknown>
  completedAt: Record<string, unknown> | null
}

export const DOFUS_CLASSES = [
  'Cra', 'Ecaflip', 'Eliotrope', 'Eniripsa', 'Enutrof',
  'Feca', 'Foggernaut', 'Forgelance', 'Huppermage', 'Iop',
  'Masqueraider', 'Osamodas', 'Ouginak', 'Pandawa', 'Rogue',
  'Sacrier', 'Sadida', 'Sram', 'Xelor',
] as const

export function formatTimestamp(ts: Record<string, unknown> | null | undefined): string {
  if (!ts) return ''
  const seconds = typeof (ts as any).seconds === 'number' ? (ts as any).seconds : null
  if (seconds) {
    return new Date(seconds * 1000).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }
  if (ts instanceof Date) {
    return ts.toLocaleDateString('pt-BR')
  }
  return ''
}

export function formatTimestampShort(ts: Record<string, unknown> | null | undefined): string {
  if (!ts) return ''
  const seconds = typeof (ts as any).seconds === 'number' ? (ts as any).seconds : null
  if (seconds) {
    return new Date(seconds * 1000).toLocaleDateString('pt-BR')
  }
  if (ts instanceof Date) {
    return ts.toLocaleDateString('pt-BR')
  }
  return ''
}
