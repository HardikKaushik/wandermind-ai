import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

export default function Profile() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-700">Please log in to view your profile.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-700 mb-6">
        <ArrowLeft size={16} /> Back
      </button>
      <div className="max-w-md mx-auto glass rounded-xl p-6">
        <h2 className="font-display text-xl font-bold mb-4">Profile</h2>
        <div className="space-y-3 text-sm">
          <p><span className="text-gray-700">Username:</span> {user.username}</p>
          <p><span className="text-gray-700">Email:</span> {user.email}</p>
          <p><span className="text-gray-700">Language:</span> {user.preferred_language}</p>
          <p><span className="text-gray-700">Currency:</span> {user.preferred_currency}</p>
        </div>
      </div>
    </div>
  )
}
