import { Component, type ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { hasError: boolean; error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <span className="text-3xl">&#x26A0;</span>
            </div>
            <h1 className="text-xl font-bold mb-2">Algo deu errado</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
              Um erro inesperado aconteceu. Tente recarregar a pagina.
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-4 font-mono">
              {this.state.error?.message}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-guild-red hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500 text-white rounded-lg text-sm font-medium"
            >
              Recarregar
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
