import { GobbalIcon, RoyalGobbalIcon } from './Icons'

interface Props {
  votes: Record<string, number>
}

export function DifficultyBar({ votes }: Props) {
  const entries = Object.values(votes)
  const avg = entries.length > 0
    ? entries.reduce((a, b) => a + b, 0) / entries.length
    : 0

  const pct = (avg / 10) * 100

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1">
          <GobbalIcon className="w-6 h-6" /> Fácil (1)
        </span>
        <span className="font-bold text-sm text-gray-900 dark:text-gray-100">
          {avg > 0 ? `${avg.toFixed(1)} / 10` : 'Sem votos'}
        </span>
        <span className="flex items-center gap-1">
          Difícil (10) <RoyalGobbalIcon className="w-6 h-6" />
        </span>
      </div>
      <div className="h-4 rounded-full bg-gray-200 dark:bg-neutral-700 overflow-hidden relative">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, #4ade80 ${Math.max(0, 50 - pct / 2)}%, #fbbf24 50%, #ef4444 ${Math.min(100, 50 + pct / 2)}%)`,
          }}
        />
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
          <div
            key={n}
            className="absolute top-0 bottom-0 w-px bg-white/50 dark:bg-black/30"
            style={{ left: `${n * 10}%` }}
          />
        ))}
      </div>
      <p className="text-xs text-gray-400 dark:text-gray-500 text-right">
        {entries.length} voto{entries.length !== 1 ? 's' : ''}
      </p>
    </div>
  )
}
