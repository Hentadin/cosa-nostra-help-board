import { Link } from 'react-router-dom'

export function UserName({ name, userId, className = '' }: { name: string; userId: string; className?: string }) {
  return (
    <Link
      to={`/profile/${userId}`}
      className={`hover:underline ${className || 'text-gray-700 dark:text-gray-300 font-medium'}`}
    >
      {name}
    </Link>
  )
}
