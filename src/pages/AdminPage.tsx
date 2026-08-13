import { useUsers } from '../hooks/useFirestore'
import { useAuth } from '../contexts/AuthContext'
import { Check, X, Trash2, Shield, User, Clock, Edit3, Save, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import type { UserProfile, Character } from '../types'
import { UserName } from '../components/UserName'

const PAGE_SIZE = 10

export function AdminPage() {
  const { users, loading, approveUser, rejectUser, deleteUser, updateUser } = useUsers()
  const { profile } = useAuth()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<UserProfile>>({})
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const pending = users.filter((u) => u.status === 'pending')
  const rejected = users.filter((u) => u.status === 'rejected')

  const matchesSearch = (u: UserProfile) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      (u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.phone || '').includes(q) ||
      (u.characters || []).some(
        (c) => (c.name || '').toLowerCase().includes(q) || (c.className || '').toLowerCase().includes(q),
      )
    )
  }

  const approvedFiltered = users
    .filter((u) => u.status === 'approved')
    .filter(matchesSearch)
    .sort((a, b) => {
      if (a.role === 'master' && b.role !== 'master') return -1
      if (a.role !== 'master' && b.role === 'master') return 1
      return (a.name || '').localeCompare(b.name || '')
    })

  const totalPages = Math.max(1, Math.ceil(approvedFiltered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const approved = approvedFiltered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  if (profile?.role !== 'master' || profile?.status !== 'approved') {
    return (
      <div className="text-center py-16">
        <Shield className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
        <p className="text-gray-400 dark:text-gray-500">Acesso restrito à cúpula da Famiglia.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-guild-red" />
      </div>
    )
  }

  const startEdit = (user: UserProfile) => {
    setEditingId(user.id)
    setEditData({ name: user.name, phone: user.phone, characters: [...user.characters] })
  }

  const saveEdit = async (userId: string) => {
    await updateUser(userId, editData)
    setEditingId(null)
    setEditData({})
  }

  const updateChar = (index: number, field: keyof Character, value: string) => {
    const chars = [...(editData.characters || [])]
    chars[index] = { ...chars[index], [field]: value }
    setEditData({ ...editData, characters: chars })
  }

  const addChar = () => {
    const chars = [...(editData.characters || []), { name: '', className: '' }]
    setEditData({ ...editData, characters: chars })
  }

  const removeChar = (index: number) => {
    const chars = (editData.characters || []).filter((_, i) => i !== index)
    setEditData({ ...editData, characters: chars })
  }

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-bold">Painel da Cúpula</h1>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          placeholder="Buscar membro por nome, email, telefone, char ou classe..."
          className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-guild-red dark:focus:ring-guild-red-dark outline-none text-sm"
        />
      </div>

      {pending.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-semibold flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <Clock className="w-5 h-5" /> Pendentes ({pending.length})
          </h2>
          <div className="space-y-2">
            {pending.map((u) => (
              <div key={u.id} className="flex items-center justify-between p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <div>
                  <UserName name={u.name} userId={u.id} className="text-sm font-medium" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">{u.email}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {(u.characters || []).map((c) => `${c.name} (${c.className})`).join(', ')}
                  </p>
                  {u.phone && <p className="text-xs text-gray-400">📱 {u.phone}</p>}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => approveUser(u.id)}
                    className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200"
                    title="Aprovar"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => rejectUser(u.id)}
                    className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200"
                    title="Recusar"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="font-semibold flex items-center gap-2 text-green-600 dark:text-green-400">
          <User className="w-5 h-5" /> Aprovados ({approvedFiltered.length})
        </h2>
        <div className="space-y-2">
          {approved.map((u) => (
            <div key={u.id} className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              {editingId === u.id ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editData.name || ''}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className="w-full px-2 py-1 rounded border text-sm bg-white dark:bg-neutral-800"
                    placeholder="Nome"
                  />
                  <input
                    type="text"
                    value={editData.phone || ''}
                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                    className="w-full px-2 py-1 rounded border text-sm bg-white dark:bg-neutral-800"
                    placeholder="Telefone"
                  />
                  <div className="space-y-1">
                    {(editData.characters || []).map((c, i) => (
                      <div key={i} className="flex gap-1">
                        <input
                          type="text"
                          value={c.name}
                          onChange={(e) => updateChar(i, 'name', e.target.value)}
                          className="flex-1 px-2 py-1 rounded border text-sm bg-white dark:bg-neutral-800"
                          placeholder="Nome char"
                        />
                        <input
                          type="text"
                          value={c.className}
                          onChange={(e) => updateChar(i, 'className', e.target.value)}
                          className="w-24 px-2 py-1 rounded border text-sm bg-white dark:bg-neutral-800"
                          placeholder="Classe"
                        />
                        <button onClick={() => removeChar(i)} className="text-red-400 p-1"><X className="w-3 h-3" /></button>
                      </div>
                    ))}
                    <button onClick={addChar} className="text-xs text-guild-red dark:text-guild-red-dark hover:underline">+ adicionar char</button>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit(u.id)}
                      className="px-3 py-1 bg-green-600 text-white rounded text-sm flex items-center gap-1"
                    >
                      <Save className="w-3 h-3" /> Salvar
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1 bg-gray-300 dark:bg-neutral-700 rounded text-sm"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">
                          <UserName name={u.name} userId={u.id} className="text-sm font-medium" />
                          {u.role === 'master' && (
                    <span className="ml-2 text-xs bg-guild-gold dark:bg-guild-gold-dark text-black px-1.5 py-0.5 rounded font-bold">
                      CÚPULA
                    </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{u.email}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {(u.characters || []).map((c) => `${c.name} (${c.className})`).join(', ')}
                      </p>
                      {u.phone && <p className="text-xs text-gray-400">📱 {u.phone}</p>}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(u)}
                        className="p-1.5 rounded-lg bg-gray-100 dark:bg-neutral-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200"
                        title="Editar"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => { if (confirm(`Excluir ${u.name}?`)) deleteUser(u.id) }}
                        className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
          {approved.length === 0 && (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
              {search.trim() ? 'Nenhum membro encontrado com essa busca.' : 'Nenhum membro aprovado.'}
            </p>
          )}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2 text-sm">
              <button
                onClick={() => setPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" /> Anterior
              </button>
              <span className="text-gray-500 dark:text-gray-400">
                Pagina {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800 disabled:opacity-40"
              >
                Proxima <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </section>

      {rejected.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-semibold flex items-center gap-2 text-red-600 dark:text-red-400">
            <X className="w-5 h-5" /> Recusados ({rejected.length})
          </h2>
          <div className="space-y-1">
            {rejected.map((u) => (
              <div key={u.id} className="flex items-center justify-between p-2 rounded-lg bg-red-50 dark:bg-red-900/20 opacity-60">
                <div>
                  <UserName name={u.name} userId={u.id} className="text-sm" />
                  <p className="text-xs text-gray-400">{u.email}</p>
                </div>
                <button
                  onClick={() => approveUser(u.id)}
                  className="text-xs text-green-600 hover:underline"
                >
                  Re-aprovar
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
