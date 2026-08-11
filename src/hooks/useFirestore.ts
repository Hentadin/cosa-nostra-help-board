import { useState, useEffect } from 'react'
import {
  collection, query, orderBy, onSnapshot, addDoc,
  updateDoc, doc, serverTimestamp, getDoc, deleteDoc,
} from 'firebase/firestore'
import { db } from '../config/firebase'
import type { HelpRequest, UserProfile } from '../types'

export function useHelpRequests() {
  const [requests, setRequests] = useState<HelpRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'helpRequests'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as HelpRequest))
      setRequests(data)
      setLoading(false)
    })
    return unsub
  }, [])

  const createRequest = async (data: Pick<HelpRequest, 'title' | 'description' | 'creatorId' | 'creatorName'>) => {
    await addDoc(collection(db, 'helpRequests'), {
      ...data,
      status: 'open',
      difficultyVotes: {},
      helpers: [],
      completedHelpers: [],
      createdAt: serverTimestamp(),
      completedAt: null,
    })
  }

  const voteDifficulty = async (requestId: string, userId: string, vote: number) => {
    const ref = doc(db, 'helpRequests', requestId)
    const snap = await getDoc(ref)
    if (!snap.exists()) return
    const current = snap.data()
    const votes = { ...(current.difficultyVotes || {}), [userId]: vote }
    await updateDoc(ref, { difficultyVotes: votes })
  }

  const acceptHelp = async (requestId: string, userId: string) => {
    const ref = doc(db, 'helpRequests', requestId)
    const snap = await getDoc(ref)
    if (!snap.exists()) return
    const helpers = [...(snap.data().helpers || [])]
    if (!helpers.includes(userId)) {
      helpers.push(userId)
      await updateDoc(ref, { helpers, status: 'in_progress' })
    }
  }

  const completeRequest = async (requestId: string, completedHelpers: string[]) => {
    const ref = doc(db, 'helpRequests', requestId)
    await updateDoc(ref, {
      status: 'completed',
      completedHelpers,
      completedAt: serverTimestamp(),
    })

    for (const helperId of completedHelpers) {
      const userRef = doc(db, 'users', helperId)
      const userSnap = await getDoc(userRef)
      if (userSnap.exists()) {
        const data = userSnap.data() as UserProfile
        await updateDoc(userRef, { helpedCount: (data.helpedCount || 0) + 1 })
      }
    }
    const snap = await getDoc(ref)
    if (snap.exists()) {
      const creatorId = snap.data().creatorId
      const creatorRef = doc(db, 'users', creatorId)
      const creatorSnap = await getDoc(creatorRef)
      if (creatorSnap.exists()) {
        const data = creatorSnap.data() as UserProfile
        await updateDoc(creatorRef, { wasHelpedCount: (data.wasHelpedCount || 0) + 1 })
      }
    }
  }

  return { requests, loading, createRequest, voteDifficulty, acceptHelp, completeRequest }
}

export function useUsers() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), (snap) => {
      setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() } as UserProfile)))
      setLoading(false)
    })
    return unsub
  }, [])

  const approveUser = async (userId: string) => {
    await updateDoc(doc(db, 'users', userId), { status: 'approved' })
  }

  const rejectUser = async (userId: string) => {
    await updateDoc(doc(db, 'users', userId), { status: 'rejected' })
  }

  const deleteUser = async (userId: string) => {
    await deleteDoc(doc(db, 'users', userId))
  }

  const updateUser = async (userId: string, data: Partial<UserProfile>) => {
    await updateDoc(doc(db, 'users', userId), data)
  }

  return { users, loading, approveUser, rejectUser, deleteUser, updateUser }
}

export function useUser(id: string | null) {
  const [user, setUser] = useState<UserProfile | null>(null)

  useEffect(() => {
    if (!id) { setUser(null); return }
    const unsub = onSnapshot(doc(db, 'users', id), (snap) => {
      if (snap.exists()) setUser({ id: snap.id, ...snap.data() } as UserProfile)
      else setUser(null)
    })
    return unsub
  }, [id])

  return user
}
