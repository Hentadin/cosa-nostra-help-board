import { Navigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../config/firebase'
import { useAuth } from '../contexts/AuthContext'

export function ProtectedRoute({ children, masterOnly = false }: { children: React.ReactNode; masterOnly?: boolean }) {
  const { user, loading, approvalStatus } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-guild-red" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  if (masterOnly && approvalStatus !== 'approved') return <Navigate to="/" replace />

  if (approvalStatus === 'none') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <span className="text-3xl">&#9888;&#65039;</span>
          </div>
          <h1 className="text-xl font-bold mb-2">Perfil não encontrado</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Seu cadastro está incompleto. Entre em contato com a cúpula da Famiglia.
          </p>
          <button
            onClick={async () => { await signOut(auth); window.location.reload() }}
            className="text-sm text-guild-red dark:text-guild-red-dark hover:underline"
          >
            Voltar para o login
          </button>
        </div>
      </div>
    )
  }

  if (approvalStatus === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
            <span className="text-3xl">&#9203;</span>
          </div>
          <h1 className="text-xl font-bold mb-2">Cadastro em Análise</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Seu cadastro está pendente de aprovação pela cúpula.
            Você receberá acesso assim que for aprovado, camarada.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="text-sm text-guild-red dark:text-guild-red-dark hover:underline"
          >
            Verificar novamente
          </button>
        </div>
      </div>
    )
  }

  if (approvalStatus === 'rejected') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <span className="text-3xl">&#128683;</span>
          </div>
          <h1 className="text-xl font-bold mb-2">Cadastro Recusado</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Seu cadastro foi recusado. Entre em contato com a cúpula da Famiglia se achar que isso foi um erro.
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
