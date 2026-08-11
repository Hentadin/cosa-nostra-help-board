import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useHelpRequests, useUser } from '../hooks/useFirestore'
import { useAuth } from '../contexts/AuthContext'
import { DifficultyBar } from '../components/DifficultyBar'
import { ArrowLeft, Check, HandHelping, ShieldCheck, UserCheck } from 'lucide-react'
import { formatTimestamp } from '../types'

export function RequestDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { requests, voteDifficulty, acceptHelp, completeRequest, loading } = useHelpRequests()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [voteValue, setVoteValue] = useState(5)

  const request = requests.find((r) => r.id === id)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-guild-red" />
      </div>
    )
  }

  if (!request) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400 dark:text-gray-500">Pedido não encontrado.</p>
        <button onClick={() => navigate('/')} className="mt-4 text-guild-red dark:text-guild-red-dark hover:underline">
          Voltar
        </button>
      </div>
    )
  }

  const isCreator = user?.uid === request.creatorId
  const hasVoted = user ? user.uid in request.difficultyVotes : false
  const hasAccepted = user ? request.helpers.includes(user.uid) : false
  const isCompleted = request.status === 'completed'

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-guild-red dark:hover:text-guild-red-dark"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>

      <div className="p-6 rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-6">
        <div>
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-xl font-bold">{request.title}</h1>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              request.status === 'open' ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400' :
              request.status === 'in_progress' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' :
              'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
            }`}>
              {request.status === 'open' ? 'Aberto' : request.status === 'in_progress' ? 'Em andamento' : 'Concluído'}
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Criado por <span className="font-medium text-gray-700 dark:text-gray-300">{request.creatorName}</span>
            {' · '}{formatTimestamp(request.createdAt)}
          </p>
        </div>

        {request.description && (
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{request.description}</p>
        )}

        <div>
          <h3 className="text-sm font-semibold mb-2">Dificuldade</h3>
          <DifficultyBar votes={request.difficultyVotes} />
        </div>

        {!isCompleted && !isCreator && (
          <div className="p-4 rounded-lg bg-gray-50 dark:bg-neutral-800 space-y-3">
            {!hasVoted && (
              <div>
                <label className="block text-sm font-medium mb-2">Seu voto de dificuldade (1-10)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={voteValue}
                    onChange={(e) => setVoteValue(Number(e.target.value))}
                    className="flex-1 accent-guild-red dark:accent-guild-red-dark"
                  />
                  <span className="w-8 text-center font-bold text-guild-red dark:text-guild-red-dark">{voteValue}</span>
                  <button
                    onClick={() => voteDifficulty(request.id, user!.uid, voteValue)}
                    className="px-3 py-1 bg-guild-gold dark:bg-guild-gold-dark hover:brightness-110 text-black rounded-lg text-sm font-medium flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" /> Votar
                  </button>
                </div>
              </div>
            )}
            {hasVoted && (
              <p className="text-sm text-gray-500">
                Seu voto: <span className="font-bold text-guild-red dark:text-guild-red-dark">{request.difficultyVotes[user!.uid]}</span>
              </p>
            )}

            {!hasAccepted && (
              <button
                onClick={() => acceptHelp(request.id, user!.uid)}
                className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center justify-center gap-2"
              >
                <HandHelping className="w-4 h-4" />
                Aceitar Ajudar
              </button>
            )}
            {hasAccepted && (
              <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" /> Você aceitou ajudar
              </p>
            )}
          </div>
        )}

        {isCreator && !isCompleted && (
          <div className="p-4 rounded-lg bg-gray-50 dark:bg-neutral-800 space-y-3">
            <h3 className="text-sm font-semibold">Finalizar Pedido</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Selecione quem realmente te ajudou para atualizar o ranking.
            </p>
            {request.helpers.length === 0 ? (
              <p className="text-sm text-gray-400">Ninguém aceitou ajudar ainda.</p>
            ) : (
              <FinalizeForm
                request={request}
                onComplete={async (helperIds) => {
                  await completeRequest(request.id, helperIds)
                }}
              />
            )}
          </div>
        )}

        {request.helpers.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-2">
              {isCompleted ? 'Quem ajudou' : 'Aceitaram ajudar'} ({request.helpers.length})
            </h3>
            <div className="space-y-2">
              {request.helpers.map((helperId) => (
                <HelperCard
                  key={helperId}
                  userId={helperId}
                  completed={request.completedHelpers.includes(helperId)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function HelperCard({ userId, completed }: { userId: string; completed: boolean }) {
  const helper = useUser(userId)

  if (!helper) return null

  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border ${
      completed
        ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
        : 'border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800'
    }`}>
      <div className="w-8 h-8 rounded-full bg-guild-red dark:bg-red-600 flex items-center justify-center text-white text-sm font-bold">
        {helper.name.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{helper.name}</p>
        <div className="flex gap-1 flex-wrap mt-0.5">
          {helper.characters.map((c, i) => (
            <span key={i} className="text-xs text-guild-gold dark:text-guild-gold-dark font-medium">
              {c.name} ({c.className})
            </span>
          ))}
        </div>
        {helper.phone && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">📱 {helper.phone}</p>
        )}
      </div>
      {completed && (
        <UserCheck className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />
      )}
    </div>
  )
}

function FinalizeForm({ request, onComplete }: { request: { helpers: string[]; id: string }; onComplete: (ids: string[]) => Promise<void> }) {
  const [selected, setSelected] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  const toggle = (id: string) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])
  }

  const handleComplete = async () => {
    setSubmitting(true)
    await onComplete(selected)
    setSubmitting(false)
  }

  return (
    <div className="space-y-2">
      {request.helpers.map((helperId) => (
        <FinalizeHelperOption
          key={helperId}
          userId={helperId}
          selected={selected.includes(helperId)}
          onToggle={() => toggle(helperId)}
        />
      ))}
      <button
        onClick={handleComplete}
        disabled={selected.length === 0 || submitting}
        className="w-full py-2 bg-guild-red hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500 text-white rounded-lg font-medium disabled:opacity-50"
      >
        {submitting ? 'Finalizando...' : `Finalizar (${selected.length} selecionados)`}
      </button>
    </div>
  )
}

function FinalizeHelperOption({ userId, selected, onToggle }: { userId: string; selected: boolean; onToggle: () => void }) {
  const helper = useUser(userId)

  if (!helper) return null

  return (
    <label className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer border transition-colors ${
      selected
        ? 'border-guild-red dark:border-guild-red-dark bg-red-50 dark:bg-red-900/20'
        : 'border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800'
    }`}>
      <input type="checkbox" checked={selected} onChange={onToggle} className="accent-guild-red" />
      <span className="text-sm">{helper.name}</span>
      <span className="text-xs text-gray-400 dark:text-gray-500">
        {helper.characters.map((c) => `${c.name} (${c.className})`).join(', ')}
      </span>
    </label>
  )
}
