import { useState, useRef, type FormEvent } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useUsers } from '../hooks/useFirestore'
import { DOFUS_CLASSES, type Character } from '../types'
import { Save, Camera, Plus, Trash2, User } from 'lucide-react'
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'

export function ProfilePage() {
  const { profile, user } = useAuth()
  const { updateUser } = useUsers()
  const [name, setName] = useState(profile?.name || '')
  const [phone, setPhone] = useState(profile?.phone || '')
  const [characters, setCharacters] = useState<Character[]>(profile?.characters || [])
  const [profilePhoto, setProfilePhoto] = useState(profile?.photoUrl || '')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState<'profile' | number | null>(null)
  const [msg, setMsg] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const charFileRefs = useRef<(HTMLInputElement | null)[]>([])

  if (!profile) return null

  const uploadImage = async (file: File): Promise<string> => {
    const storage = getStorage()
    const ext = file.name.split('.').pop() || 'jpg'
    const path = `photos/${user!.uid}/${Date.now()}.${ext}`
    const fileRef = ref(storage, path)
    await uploadBytes(fileRef, file)
    return getDownloadURL(fileRef)
  }

  const handleProfilePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading('profile')
    const url = await uploadImage(file)
    setProfilePhoto(url)
    setUploading(null)
  }

  const handleCharPhoto = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(index)
    const url = await uploadImage(file)
    setCharacters(characters.map((c, i) => i === index ? { ...c, photoUrl: url } : c))
    setUploading(null)
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
        photoUrl: profilePhoto,
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
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center overflow-hidden ${
              profilePhoto ? '' : 'bg-gray-200 dark:bg-neutral-700'
            }`}>
              {profilePhoto ? (
                <img src={profilePhoto} alt="" className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 p-1 bg-guild-red dark:bg-red-600 text-white rounded-full"
              disabled={uploading === 'profile'}
            >
              {uploading === 'profile' ? (
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Camera className="w-3 h-3" />
              )}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleProfilePhoto}
              className="hidden"
            />
          </div>
          <div className="text-xs text-gray-400 dark:text-gray-500">
            {profile.email}
          </div>
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
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(11) 99999-9999"
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
            <div key={i} className="p-3 rounded-lg border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 space-y-2">
              <div className="flex gap-2">
                <div className="relative">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center overflow-hidden ${
                    char.photoUrl ? '' : 'bg-gray-300 dark:bg-neutral-600'
                  }`}>
                    {char.photoUrl ? (
                      <img src={char.photoUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => charFileRefs.current[i]?.click()}
                    className="absolute -bottom-1 -right-1 p-0.5 bg-guild-gold text-black rounded-full"
                    disabled={uploading === i}
                  >
                    {uploading === i ? (
                      <div className="w-2.5 h-2.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Camera className="w-2.5 h-2.5" />
                    )}
                  </button>
                  <input
                    ref={(el) => { charFileRefs.current[i] = el }}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleCharPhoto(i, e)}
                    className="hidden"
                  />
                </div>
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    placeholder="Nome do personagem"
                    value={char.name}
                    onChange={(e) => updateChar(i, 'name', e.target.value)}
                    className="flex-1 px-2 py-1.5 rounded border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-guild-red dark:focus:ring-guild-red-dark outline-none text-sm"
                  />
                  <select
                    value={char.className}
                    onChange={(e) => updateChar(i, 'className', e.target.value)}
                    className="w-28 px-2 py-1.5 rounded border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:ring-2 focus:ring-guild-red dark:focus:ring-guild-red-dark outline-none text-sm"
                  >
                    <option value="">Classe</option>
                    {DOFUS_CLASSES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => removeChar(i)}
                  className="text-gray-400 hover:text-red-500 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
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
