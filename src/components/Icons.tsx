export function GobbalIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none">
      <ellipse cx="32" cy="40" rx="22" ry="16" fill="#4ade80" />
      <ellipse cx="32" cy="38" rx="18" ry="12" fill="#86efac" />
      <circle cx="22" cy="30" r="5" fill="white" />
      <circle cx="22" cy="30" r="3" fill="#1a1a1a" />
      <circle cx="42" cy="30" r="5" fill="white" />
      <circle cx="42" cy="30" r="3" fill="#1a1a1a" />
      <ellipse cx="32" cy="44" rx="6" ry="3" fill="#1a1a1a" />
      <ellipse cx="20" cy="22" rx="6" ry="4" fill="#4ade80" />
      <ellipse cx="44" cy="22" rx="6" ry="4" fill="#4ade80" />
      <ellipse cx="32" cy="56" rx="5" ry="2" fill="#22c55e" />
    </svg>
  )
}

export function RoyalGobbalIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none">
      <ellipse cx="32" cy="38" rx="24" ry="18" fill="#ef4444" />
      <ellipse cx="32" cy="36" rx="20" ry="14" fill="#fca5a5" />
      <circle cx="22" cy="28" r="5" fill="#fef08a" />
      <circle cx="22" cy="28" r="3" fill="#1a1a1a" />
      <circle cx="42" cy="28" r="5" fill="#fef08a" />
      <circle cx="42" cy="28" r="3" fill="#1a1a1a" />
      <path d="M28 44 Q32 48 36 44" stroke="#1a1a1a" strokeWidth="2" fill="none" />
      <ellipse cx="20" cy="20" rx="7" ry="5" fill="#ef4444" />
      <ellipse cx="44" cy="20" rx="7" ry="5" fill="#ef4444" />
      <path d="M18 14 L16 6 M28 12 L32 4 M46 14 L48 6" stroke="#fbbf24" strokeWidth="2.5" />
      <circle cx="16" cy="6" r="2" fill="#fbbf24" />
      <circle cx="32" cy="4" r="2" fill="#fbbf24" />
      <circle cx="48" cy="6" r="2" fill="#fbbf24" />
      <ellipse cx="32" cy="56" rx="6" ry="3" fill="#dc2626" />
    </svg>
  )
}
