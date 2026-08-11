import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../hooks/useTheme'
import { Sun, Moon, LogOut, Trophy, Home, Shield } from 'lucide-react'

export function Layout() {
  const { user, profile, logout } = useAuth()
  const { theme, toggle } = useTheme()
  const navigate = useNavigate()
  const isMaster = profile?.role === 'master' && profile?.status === 'approved'

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-neutral-900/80 backdrop-blur border-b border-gray-200 dark:border-neutral-800">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg">
            <span className="text-guild-red dark:text-guild-red-dark">Famiglia Cosa Nostra</span>
            <span className="text-gray-400 dark:text-gray-500 hidden sm:inline">Help Board</span>
          </Link>

          <div className="flex items-center gap-1">
            <Link
              to="/"
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-600 dark:text-gray-400"
              title="Dashboard"
            >
              <Home className="w-5 h-5" />
            </Link>
            <Link
              to="/ranking"
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-600 dark:text-gray-400"
              title="Ranking"
            >
              <Trophy className="w-5 h-5" />
            </Link>
            {isMaster && (
              <Link
                to="/admin"
                className="p-2 rounded-lg hover:bg-guild-red/10 dark:hover:bg-red-900/30 text-guild-red dark:text-guild-red-dark"
                title="Painel da Cúpula"
              >
                <Shield className="w-5 h-5" />
              </Link>
            )}
            <button
              onClick={toggle}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-600 dark:text-gray-400"
              title="Alternar tema"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            {user && (
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-600 dark:text-gray-400"
                title="Sair"
              >
                <LogOut className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
        {profile && (
          <div className="max-w-4xl mx-auto px-4 pb-2 text-xs text-gray-500 dark:text-gray-400 flex gap-3">
            <span>{profile.name}</span>
            {(profile.characters || []).slice(0, 2).map((c, i) => (
              <span key={i} className="text-guild-red dark:text-guild-red-dark">
                {c.name} ({c.className})
              </span>
            ))}
            {isMaster && (
              <span className="ml-auto text-guild-gold dark:text-guild-gold-dark font-bold">CÚPULA</span>
            )}
          </div>
        )}
      </nav>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6">
        <Outlet />
      </main>

      <footer className="border-t border-gray-200 dark:border-neutral-800 py-4 text-center text-xs text-gray-400 dark:text-gray-500">
        Famiglia Cosa Nostra — Dofus
      </footer>
    </div>
  )
}
