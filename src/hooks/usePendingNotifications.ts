import { useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useUsers } from './useFirestore'

export function usePendingNotifications() {
  const { profile } = useAuth()
  const { users } = useUsers()
  const notifiedRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!profile || profile.role !== 'master' || profile.status !== 'approved') return

    if (!('Notification' in window)) return

    if (Notification.permission === 'default') {
      Notification.requestPermission()
    }

    if (Notification.permission !== 'granted') return

    const pending = users.filter((u) => u.status === 'pending')

    for (const u of pending) {
      if (!notifiedRef.current.has(u.id)) {
        notifiedRef.current.add(u.id)
        new Notification('Famiglia Cosa Nostra — Novo cadastro pendente', {
          body: `${u.name} (${u.email}) aguarda aprovacao.`,
          icon: '/guild-icon.jpeg',
          tag: u.id,
        })
      }
    }
  }, [users, profile])
}
