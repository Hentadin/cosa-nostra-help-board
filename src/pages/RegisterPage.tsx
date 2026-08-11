import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { DOFUS_CLASSES, type Character } from '../types'
import { Plus, Trash2, UserPlus } from 'lucide-react'

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [characters, setCharacters] = useState<Character[]>([{ name: '', className: '' }])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const addChar = () => setCharacters([...characters, { name: '', className: '' }])
  const removeChar = (index: number) => setCharacters(characters.filter((_, i) => i !== index))
  const updateChar = (index: number, field: keyof Character, value: string) => {
    setCharacters(characters.map((c, i) => i === index ? { ...c, [field]: value } : c))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    const validChars = characters.filter((c) => c.name.trim() && c.className)
    if (validChars.length === 0) {
      setError('Adicione pelo menos 1 personagem.')
      return
    }
    setLoading(true)
    try {
      await register(email, password, { name, email, phone, characters: validChars })
      navigate('/')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao cadastrar.'
      if (msg.includes('email-already-in-use')) setError('Este email já está cadastrado.')
      else if (msg.includes('weak-password')) setError('Senha muito fraca (mínimo 6 caracteres).')
      else setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-1">
          <span className="text-guild-red dark:text-guild-red-dark">Cosa Nostra</span>
        </h1>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-2">Cadastro de Membro</p>
        <p className="text-center text-xs text-amber-600 dark:text-amber-400 mb-6">
          Seu cadastro será revisado pelo mestre da guilda antes do acesso ser liberado.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}
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
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-guild-red dark:focus:ring-guild-red-dark outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-guild-red dark:focus:ring-guild-red-dark outline-none"
              required
              minLength={6}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Telefone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(11) 99999-9999"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-guild-red dark:focus:ring-guild-red-dark outline-none"
            />
          </div>

          <div className="space-y-2">
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
                  className="w-32 px-2 py-2 rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-guild-red dark:focus:ring-guild-red-dark outline-none text-sm"
                >
                  <option value="">Classe</option>
                  {DOFUS_CLASSES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                {characters.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeChar(i)}
                    className="text-gray-400 hover:text-red-500 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-guild-red hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500 text-white rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <UserPlus className="w-4 h-4" />
            {loading ? 'Cadastrando...' : 'Solicitar Cadastro'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          Já tem conta?{' '}
          <Link to="/login" className="text-guild-red dark:text-guild-red-dark font-medium hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
