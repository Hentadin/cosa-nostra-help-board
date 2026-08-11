import { useState } from 'react'
import { useUsers } from '../hooks/useFirestore'
import { Trophy, HeartHandshake, Search, Phone } from 'lucide-react'

export function RankingPage() {
  const { users, loading } = useUsers()
  const [search, setSearch] = useState('')

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-guild-red" />
      </div>
    )
  }

  const topHelpers = [...users]
    .sort((a, b) => b.helpedCount - a.helpedCount)
    .slice(0, 10)
    .filter((u) => u.helpedCount > 0)

  const topHelped = [...users]
    .sort((a, b) => b.wasHelpedCount - a.wasHelpedCount)
    .slice(0, 10)
    .filter((u) => u.wasHelpedCount > 0)

  const filteredMembers = search.trim()
    ? users.filter(
        (u) =>
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.phone?.includes(search) ||
          u.characters.some(
            (c) =>
              c.name.toLowerCase().includes(search.toLowerCase()) ||
              c.className.toLowerCase().includes(search.toLowerCase())
          )
      )
    : []

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-bold">Ranking</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-4 rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <h2 className="font-semibold flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-guild-gold dark:text-guild-gold-dark" />
            Top Helpers
          </h2>
          {topHelpers.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500">Nenhum dado ainda.</p>
          ) : (
            <div className="space-y-2">
              {topHelpers.map((u, i) => (
                <div key={u.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-neutral-800">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    i === 0 ? 'bg-guild-gold text-black' :
                    i === 1 ? 'bg-gray-300 dark:bg-gray-600 text-black dark:text-white' :
                    i === 2 ? 'bg-amber-700 text-white' :
                    'bg-gray-200 dark:bg-neutral-700 text-gray-600 dark:text-gray-400'
                  }`}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{u.name}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {(u.characters || []).slice(0, 2).map((c) => `${c.name} (${c.className})`).join(', ')}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-guild-red dark:text-guild-red-dark">
                    {u.helpedCount} 🆘
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <h2 className="font-semibold flex items-center gap-2 mb-4">
            <HeartHandshake className="w-5 h-5 text-guild-gold dark:text-guild-gold-dark" />
            Mais Ajudados
          </h2>
          {topHelped.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500">Nenhum dado ainda.</p>
          ) : (
            <div className="space-y-2">
              {topHelped.map((u, i) => (
                <div key={u.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-neutral-800">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-gray-200 dark:bg-neutral-700 text-gray-600 dark:text-gray-400">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{u.name}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {(u.characters || []).slice(0, 2).map((c) => `${c.name} (${c.className})`).join(', ')}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-guild-red dark:text-guild-red-dark">
                    {u.wasHelpedCount} ✋
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="p-4 rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <h2 className="font-semibold flex items-center gap-2 mb-4">
          <Phone className="w-5 h-5 text-guild-gold dark:text-guild-gold-dark" />
          Membros da Guilda
        </h2>
        <div className="relative mb-4">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, telefone, personagem ou classe..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-guild-red dark:focus:ring-guild-red-dark outline-none text-sm"
          />
        </div>

        {search.trim() === '' ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
            Digite algo para buscar membros pelo nome, telefone, personagem ou classe.
          </p>
        ) : filteredMembers.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
            Nenhum membro encontrado.
          </p>
        ) : (
          <div className="space-y-2">
            {filteredMembers.map((u) => (
              <div key={u.id} className="p-3 rounded-lg bg-gray-50 dark:bg-neutral-800">
                <p className="text-sm font-medium">{u.name}</p>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                  {(u.characters || []).map((c, i) => (
                    <span key={i} className="text-xs text-guild-gold dark:text-guild-gold-dark font-medium">
                      {c.name} ({c.className})
                    </span>
                  ))}
                </div>
                {u.phone && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">📱 {u.phone}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
