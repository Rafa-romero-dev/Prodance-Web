'use client'

import { useSession, signOut } from 'next-auth/react'

export function UserMenu() {
  const { data: session } = useSession()

  if (!session?.user) return null

  return (
    <div className="flex items-center justify-end gap-4 mb-6 text-sm">
      <span className="text-gray-700">
        {session.user.name} <span className="text-gray-400">({session.user.role})</span>
      </span>
      <button
        onClick={() => signOut({ callbackUrl: '/login' })}
        className="text-blue-600 hover:text-blue-800 font-medium"
      >
        Sign out
      </button>
    </div>
  )
}
