import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth'
import {
  doc, getDoc, setDoc, serverTimestamp, collection, getDocs, query, where,
} from 'firebase/firestore'
import { auth, db } from '../config/firebase'
import type { UserProfile, UserStatus } from '../types'

interface AuthState {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  approvalStatus: UserStatus | 'none'
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, data: Omit<UserProfile, 'id' | 'role' | 'status' | 'helpedCount' | 'wasHelpedCount' | 'createdAt'>) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [approvalStatus, setApprovalStatus] = useState<UserStatus | 'none'>('none')

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        const snap = await getDoc(doc(db, 'users', firebaseUser.uid))
        if (snap.exists()) {
          const data = { id: firebaseUser.uid, ...snap.data() } as UserProfile
          setProfile(data)
          setApprovalStatus(data.status)
        } else {
          setProfile(null)
          setApprovalStatus('none')
        }
      } else {
        setProfile(null)
        setApprovalStatus('none')
      }
      setLoading(false)
    })
    return unsub
  }, [])

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password)
  }

  const register = async (email: string, password: string, data: Omit<UserProfile, 'id' | 'role' | 'status' | 'helpedCount' | 'wasHelpedCount' | 'createdAt'>) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password)

    const mastersSnap = await getDocs(query(collection(db, 'users'), where('role', '==', 'master')))
    const isFirst = mastersSnap.empty
    const role = isFirst ? 'master' : 'member'
    const status = isFirst ? 'approved' : 'pending'

    const profileData = {
      ...data,
      role,
      status,
      helpedCount: 0,
      wasHelpedCount: 0,
      createdAt: serverTimestamp(),
    }
    await setDoc(doc(db, 'users', cred.user.uid), profileData)
    setProfile({ id: cred.user.uid, ...profileData, createdAt: new Date() } as unknown as UserProfile)
    setApprovalStatus(status)
  }

  const logout = async () => {
    await signOut(auth)
    setProfile(null)
    setApprovalStatus('none')
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, approvalStatus, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
