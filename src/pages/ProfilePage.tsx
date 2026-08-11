import { useState, type FormEvent } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useUsers } from '../hooks/useFirestore'
import { DOFUS_CLASSES, type Character } from '../types'
import { Save, Plus, Trash2, User } from 'lucide-react'

export function ProfilePage() {
  const { profile } = useAuth()
  const { updateUser } = useUsers()
  const [name, setName] = useState(profile?.name || '')
  const [phone, setPhone] = useState(profile?.phone || '')
  const [characters, setCharacters] = useState<Character[]>(profile?.characters || [])
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  if (!profile) return null

  const formatPhone = (v: string) => {
    const d = v.replace(/[^\d+\-()\s]/g, '')
    return d
  }

  const addChar = () => setCharacters([...characters, { name: '', className: '' }])
  const removeChar = (i: number) => setCharacters(characters.filter((_, idx) => idx !== i))
  const updateChar = (i: number, field: keyof Character, value: string) => {
    setCharacters(characters.map((c, idx) => idx === i ? { ...c, [field]: value } : c))
  }

  const handleSave = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMsg('')
    try {
      await updateUser(profile.id, {
        name,
        phone,
        characters: characters.filter((c) => c.name.trim()),
      })
      setMsg('Perfil salvo com sucesso!')
    } catch {
      setMsg('Erro ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-xl font-bold flex items-center gap-2">
        <User className="w-5 h-5" /> Meu Perfil
      </h1>

      {msg && (
        <div className={`p-3 rounded-lg text-sm ${msg.includes('Erro') ? 'bg-red-50 dark:bg-red-900/30 text-red-600' : 'bg-green-50 dark:bg-green-900/30 text-green-600'}`}>
          {msg}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-5">
        <div className="text-xs text-gray-400 dark:text-gray-500">
          {profile.email}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Nome</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-guild-red dark:focus:ring-guild-red-dark outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Telefone</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(formatPhone(e.target.value))}
            placeholder="(11) 99999-9999 | +351 912 345 678"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-guild-red dark:focus:ring-guild-red-dark outline-none"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Personagens</label>
            <button
              type="button"
              onClick={addChar}
              className="text-xs text-guild-red dark:text-guild-red-dark hover:underline flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Adicionar
            </button>
          </div>
          {characters.map((char, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                placeholder="Nome do personagem"
                value={char.name}
                onChange={(e) => updateChar(i, 'name', e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-guild-red dark:focus:ring-guild-red-dark outline-none text-sm"
              />
              <select
                value={char.className}
                onChange={(e) => updateChar(i, 'className', e.target.value)}
                className="w-28 px-2 py-2 rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-guild-red dark:focus:ring-guild-red-dark outline-none text-sm"
              >
                <option value="">Classe</option>
                {DOFUS_CLASSES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => removeChar(i)}
                className="text-gray-400 hover:text-red-500 p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-2 bg-guild-red hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500 text-white rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Salvando...' : 'Salvar Perfil'}
        </button>
      </form>
    </div>
  )
}
