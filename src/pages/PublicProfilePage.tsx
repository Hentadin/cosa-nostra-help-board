import { useParams, Link } from 'react-router-dom'
import { useUser, useUserRequests, useUsers } from '../hooks/useFirestore'
import { formatTimestamp } from '../types'
import { ArrowLeft, Trophy, HelpCircle, HeartHandshake } from 'lucide-react'

export function PublicProfilePage() {
  const { userId } = useParams<{ userId: string }>()
  const user = useUser(userId || null)
  const { userRequests, loading } = useUserRequests(userId || null)
  const { users } = useUsers()

  if (!user) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400 dark:text-gray-500">Membro nao encontrado.</p>
      </div>
    )
  }

  const helpersSorted = [...users]
    .filter((u) => u.status === 'approved')
    .sort((a, b) => b.helpedCount - a.helpedCount)
  const helpRank = helpersSorted.findIndex((u) => u.id === userId) + 1

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <Link
        to="/"
        className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-guild-red dark:hover:text-guild-red-dark"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>

      <div>
        <h1 className="text-2xl font-bold">{user.name}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {user.role === 'master' && (
            <span className="text-guild-gold dark:text-guild-gold-dark font-bold mr-2">Cupula</span>
          )}
          {user.email}
        </p>
      </div>

      {user.characters && user.characters.length > 0 && (
        <div className="p-4 rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <h2 className="text-sm font-semibold mb-2">Personagens</h2>
          <div className="space-y-1">
            {(user.characters || []).map((c, i) => (
              <div key={i} className="text-sm">
                <span className="text-guild-gold dark:text-guild-gold-dark font-medium">
                  {c.name}
                </span>
                <span className="text-gray-500 dark:text-gray-400"> ({c.className})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-center">
          <Trophy className="w-5 h-5 mx-auto text-guild-gold dark:text-guild-gold-dark mb-1" />
          <p className="text-2xl font-bold">{user.helpedCount || 0}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Ajudas dadas</p>
        </div>
        <div className="p-3 rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-center">
          <HeartHandshake className="w-5 h-5 mx-auto text-guild-gold dark:text-guild-gold-dark mb-1" />
          <p className="text-2xl font-bold">{user.wasHelpedCount || 0}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Ajudas recebidas</p>
        </div>
        <div className="p-3 rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-center">
          <HelpCircle className="w-5 h-5 mx-auto text-guild-gold dark:text-guild-gold-dark mb-1" />
          <p className="text-2xl font-bold">{helpRank > 0 ? `#${helpRank}` : '-'}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Ranking ajuda</p>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold mb-2">Atividade recente</h2>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-guild-red" />
          </div>
        ) : userRequests.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500">Nenhuma atividade ainda.</p>
        ) : (
          <div className="space-y-2">
            {userRequests.slice(0, 5).map((req) => {
              const isCreator = req.creatorId === userId
              const isCompletedHelper = req.status === 'completed' && (req.completedHelpers || []).includes(userId!)
              return (
                <Link
                  key={req.id}
                  to={`/requests/${req.id}`}
                  className="block p-3 rounded-lg border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 hover:shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      req.status === 'completed' ? 'bg-green-500' :
                      req.status === 'in_progress' ? 'bg-blue-500' : 'bg-yellow-500'
                    }`} />
                    <span className="text-sm font-medium truncate flex-1">{req.title}</span>
                    <span className={`text-xs ${
                      isCreator ? 'text-guild-gold dark:text-guild-gold-dark' :
                      isCompletedHelper ? 'text-green-600 dark:text-green-400' :
                      'text-blue-600 dark:text-blue-400'
                    }`}>
                      {isCreator ? 'Criou' : isCompletedHelper ? 'Ajudou' : 'Aceitou ajudar'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {formatTimestamp(req.createdAt)}
                  </p>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
