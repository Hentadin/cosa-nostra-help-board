import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useHelpRequests } from '../hooks/useFirestore'
import { DifficultyBar } from '../components/DifficultyBar'
import { formatTimestampShort } from '../types'
import { UserName } from '../components/UserName'
import { Plus, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import type { RequestStatus } from '../types'

const STATUS_CONFIG: Record<RequestStatus, { label: string; icon: typeof AlertCircle; className: string }> = {
  open: { label: 'Abertos', icon: AlertCircle, className: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20' },
  in_progress: { label: 'Em andamento', icon: Clock, className: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' },
  completed: { label: 'Concluídos', icon: CheckCircle2, className: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20' },
}

export function DashboardPage() {
  const { requests, loading } = useHelpRequests()
  const [filter, setFilter] = useState<RequestStatus | 'all'>('open')

  const filtered = filter === 'all' ? requests : requests.filter((r) => r.status === filter)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-guild-red" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Pedidos de Ajuda</h1>
        <Link
          to="/requests/new"
          className="flex items-center gap-1 px-4 py-2 bg-guild-red hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500 text-white rounded-lg text-sm font-medium"
        >
          <Plus className="w-4 h-4" /> Novo Pedido
        </Link>
      </div>

      <div className="flex gap-2 flex-wrap">
        {([
          ['all', 'Todos'],
          ['open', 'Abertos'],
          ['in_progress', 'Em andamento'],
          ['completed', 'Concluídos'],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === key
                ? 'bg-guild-red dark:bg-red-600 text-white'
                : 'bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-neutral-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Nenhum pedido encontrado.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((req) => {
            const status = STATUS_CONFIG[req.status]
            const avg = Object.values(req.difficultyVotes).length > 0
              ? Object.values(req.difficultyVotes).reduce((a, b) => a + b, 0) / Object.values(req.difficultyVotes).length
              : null

            return (
              <Link
                key={req.id}
                to={`/requests/${req.id}`}
                className="block p-4 rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{req.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      por <UserName name={req.creatorName} userId={req.creatorId} className="font-medium" /> · {formatTimestampShort(req.createdAt)}
                    </p>
                  </div>
                  <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.className}`}>
                    <status.icon className="w-3 h-3" />
                    {status.label}
                  </span>
                </div>
                <div className="mt-2">
                  <DifficultyBar votes={req.difficultyVotes} />
                </div>
                {req.status !== 'completed' && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                    {req.helpers.length} {req.helpers.length === 1 ? 'pessoa aceitou' : 'pessoas aceitaram'} ajudar
                    {avg ? ` · Dificuldade média: ${avg.toFixed(1)}` : ''}
                  </p>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
