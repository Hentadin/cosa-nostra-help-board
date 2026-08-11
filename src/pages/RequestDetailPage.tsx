import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useHelpRequests, useUser, useComments } from '../hooks/useFirestore'
import { useAuth } from '../contexts/AuthContext'
import { DifficultyBar } from '../components/DifficultyBar'
import { ArrowLeft, Check, HandHelping, ShieldCheck, UserCheck, Send, MessageCircle, Reply } from 'lucide-react'
import { formatTimestamp } from '../types'
import { UserName } from '../components/UserName'

export function RequestDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { requests, voteDifficulty, acceptHelp, completeRequest, cancelHelp, cancelRequest, loading } = useHelpRequests()
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [voteValue, setVoteValue] = useState(5)
  const [acceptComment, setAcceptComment] = useState('')
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

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
        <p className="text-gray-400 dark:text-gray-500">Pedido nao encontrado.</p>
        <button onClick={() => navigate('/')} className="mt-4 text-guild-red dark:text-guild-red-dark hover:underline">
          Voltar
        </button>
      </div>
    )
  }

  const isCreator = user?.uid === request.creatorId
  const hasVoted = user ? user.uid in (request.difficultyVotes || {}) : false
  const hasAccepted = user ? (request.helpers || []).includes(user.uid) : false
  const isCompleted = request.status === 'completed'
  const isCancelled = request.status === 'cancelled'
  const isMaster = profile?.role === 'master' && profile?.status === 'approved'

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
              request.status === 'cancelled' ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' :
              'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
            }`}>
              {request.status === 'open' ? 'Aberto' : request.status === 'in_progress' ? 'Em andamento' : request.status === 'cancelled' ? 'Cancelado' : 'Concluido'}
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Criado por{' '}
            <UserName name={request.creatorName} userId={request.creatorId} />{' '}
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

        {!isCompleted && !isCancelled && !isCreator && (
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
                Seu voto: <span className="font-bold text-guild-red dark:text-guild-red-dark">{(request.difficultyVotes || {})[user!.uid]}</span>
              </p>
            )}

            {!hasAccepted && (
              <div className="space-y-2">
                <textarea
                  value={acceptComment}
                  onChange={(e) => setAcceptComment(e.target.value)}
                  placeholder="Como voce pode ajudar? (opcional)"
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-guild-red dark:focus:ring-guild-red-dark outline-none resize-none text-sm"
                />
                <button
                  onClick={() => acceptHelp(request.id, user!.uid, acceptComment || undefined)}
                  className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center justify-center gap-2"
                >
                  <HandHelping className="w-4 h-4" />
                  Aceitar Ajudar
                </button>
              </div>
            )}
            {hasAccepted && (
              <div className="space-y-2">
                <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" /> Voce aceitou ajudar
                </p>
                <button
                  onClick={() => cancelHelp(request.id, user!.uid)}
                  className="text-xs text-red-500 hover:text-red-600 hover:underline"
                >
                  Cancelar minha ajuda
                </button>
              </div>
            )}
          </div>
        )}

        {(isCreator || isMaster) && !isCompleted && !isCancelled && (
          <div className="p-4 rounded-lg bg-gray-50 dark:bg-neutral-800 space-y-3">
            {isCreator && (
              <>
                <h3 className="text-sm font-semibold">Finalizar Pedido</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Selecione quem realmente te ajudou para atualizar o ranking.
                </p>
                {(request.helpers || []).length === 0 ? (
                  <p className="text-sm text-gray-400">Ninguem aceitou ajudar ainda.</p>
                ) : (
                  <FinalizeForm
                    request={request}
                    onComplete={async (helperIds) => {
                      await completeRequest(request.id, helperIds)
                    }}
                  />
                )}
              </>
            )}
            <button
              onClick={() => setShowCancelModal(true)}
              className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm"
            >
              {isMaster && !isCreator ? 'Cancelar pedido (Cupula)' : 'Cancelar pedido'}
            </button>
          </div>
        )}

        {isCancelled && (
          <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-center">
            <p className="text-sm font-semibold text-red-600 dark:text-red-400">Este pedido foi cancelado.</p>
            {request.cancellationReason && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 italic">
                &ldquo;{request.cancellationReason}&rdquo;
              </p>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Os comentarios foram encerrados.</p>
          </div>
        )}

        {showCancelModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl">
              <h3 className="text-lg font-bold mb-2">Cancelar pedido</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                Por que esta cancelando? Isso ficara visivel no pedido.
              </p>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-guild-red outline-none resize-none text-sm mb-3"
                placeholder="Ex: Consegui resolver sozinho..."
              />
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowCancelModal(false); setCancelReason('') }}
                  className="flex-1 py-2 rounded-lg border border-gray-300 dark:border-neutral-700 text-sm"
                >
                  Voltar
                </button>
                <button
                  onClick={async () => {
                    await cancelRequest(request.id, cancelReason.trim() || undefined)
                    setShowCancelModal(false)
                    setCancelReason('')
                  }}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}

        {(request.helpers || []).length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-2">
              {isCompleted ? 'Quem ajudou' : 'Aceitaram ajudar'} ({(request.helpers || []).length})
            </h3>
            <div className="space-y-2">
              {(request.helpers || []).map((helperId) => (
                <HelperCard
                  key={helperId}
                  userId={helperId}
                  comment={request.helperComments?.[helperId]}
                  completed={(request.completedHelpers || []).includes(helperId)}
                />
              ))}
            </div>
          </div>
        )}

        <CommentsSection requestId={id!} isCompleted={isCompleted} isCancelled={isCancelled} />
      </div>
    </div>
  )
}

function HelperCard({ userId, comment, completed }: { userId: string; comment?: string; completed: boolean }) {
  const helper = useUser(userId)

  if (!helper) return null

  return (
    <div className={`p-3 rounded-lg border ${
      completed
        ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
        : 'border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800'
    }`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <UserName name={helper.name} userId={userId} />
          <div className="flex gap-1 flex-wrap mt-0.5">
            {(helper.characters || []).map((c, i) => (
              <span key={i} className="text-xs text-guild-gold dark:text-guild-gold-dark font-medium">
                {c.name} ({c.className})
              </span>
            ))}
          </div>
          {comment && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">&ldquo;{comment}&rdquo;</p>
          )}
          {helper.phone && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">&#x1F4F1; {helper.phone}</p>
          )}
        </div>
        {completed && (
          <UserCheck className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
        )}
      </div>
    </div>
  )
}

function CommentsSection({ requestId, isCompleted, isCancelled }: { requestId: string; isCompleted: boolean; isCancelled: boolean }) {
  const { comments, loading, addComment } = useComments(requestId)
  const { user, profile } = useAuth()
  const [text, setText] = useState('')
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')

  const topLevel = comments.filter((c) => !c.parentId)
  const repliesOf = (parentId: string) => comments.filter((c) => c.parentId === parentId)

  const handleAdd = async () => {
    if (!text.trim() || !user) return
    await addComment(user.uid, profile?.name || '?', text.trim())
    setText('')
  }

  const handleReply = async (parentId: string) => {
    if (!replyText.trim() || !user) return
    await addComment(user.uid, profile?.name || '?', replyText.trim(), parentId)
    setReplyText('')
    setReplyTo(null)
  }

  if (loading) return null

  return (
    <div className="border-t border-gray-200 dark:border-neutral-800 pt-4">
      <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
        <MessageCircle className="w-4 h-4" />
        Comentarios ({comments.length})
      </h3>

      {!isCompleted && !isCancelled && (
        <div className="flex gap-2 mb-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Comente sobre o pedido..."
            rows={2}
            className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-guild-red dark:focus:ring-guild-red-dark outline-none resize-none text-sm"
          />
          <button
            onClick={handleAdd}
            disabled={!text.trim()}
            className="px-3 py-2 bg-guild-red hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500 text-white rounded-lg text-sm font-medium self-end disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="space-y-3">
        {topLevel.length === 0 && (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">Nenhum comentario ainda.</p>
        )}
        {topLevel.map((c) => (
          <div key={c.id}>
            <div className="text-sm">
              <UserName name={c.authorName} userId={c.authorId} className="font-medium" />{' '}
              <span className="text-gray-400 text-xs">{formatTimestamp(c.createdAt)}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{c.content}</p>
            {!isCompleted && !isCancelled && (
              <button
                onClick={() => setReplyTo(replyTo === c.id ? null : c.id)}
                className="text-xs text-guild-red dark:text-guild-red-dark hover:underline mt-1 flex items-center gap-1"
              >
                <Reply className="w-3 h-3" /> Responder
              </button>
            )}

            {replyTo === c.id && (
              <div className="flex gap-2 mt-2 ml-2">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Sua resposta..."
                  rows={2}
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-guild-red dark:focus:ring-guild-red-dark outline-none resize-none text-sm"
                />
                <button
                  onClick={() => handleReply(c.id)}
                  disabled={!replyText.trim()}
                  className="px-3 py-2 bg-guild-gold dark:bg-guild-gold-dark hover:brightness-110 text-black rounded-lg text-sm font-medium self-end disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            )}

            {repliesOf(c.id).map((r) => (
              <div key={r.id} className="ml-4 pl-3 border-l-2 border-gray-200 dark:border-neutral-700 mt-2">
                <div className="text-sm">
                <UserName name={r.authorName} userId={r.authorId} className="font-medium" />{' '}
                  <span className="text-gray-400 text-xs">{formatTimestamp(r.createdAt)}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{r.content}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function FinalizeForm({ request, onComplete }: { request: { helpers: string[]; helperComments?: Record<string, string>; id: string }; onComplete: (ids: string[]) => Promise<void> }) {
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
          comment={request.helperComments?.[helperId]}
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

function FinalizeHelperOption({ userId, comment, selected, onToggle }: { userId: string; comment?: string; selected: boolean; onToggle: () => void }) {
  const helper = useUser(userId)

  if (!helper) return null

  return (
    <label className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer border transition-colors ${
      selected
        ? 'border-guild-red dark:border-guild-red-dark bg-red-50 dark:bg-red-900/20'
        : 'border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800'
    }`}>
      <input type="checkbox" checked={selected} onChange={onToggle} className="accent-guild-red" />
      <div className="flex-1 min-w-0">
        <span className="text-sm">{helper.name}</span>
        <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">
          {(helper.characters || []).map((c) => `${c.name} (${c.className})`).join(', ')}
        </span>
        {comment && <p className="text-xs text-gray-500 italic mt-0.5">&ldquo;{comment}&rdquo;</p>}
      </div>
    </label>
  )
}
