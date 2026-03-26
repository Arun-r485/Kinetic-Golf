import { useAuth } from '../context/AuthContext'

export const useRole = () => {
  const { user } = useAuth()

  const role = user?.role ?? 'guest'
  const isAdmin = role === 'admin'
  const isSubscriber = role === 'subscriber' && 
    user?.subscriptionStatus === 'active'
  const isGuest = !user
  const isInactiveSubscriber = 
    role === 'subscriber' && 
    user?.subscriptionStatus !== 'active'

  return { 
    role,
    isAdmin,
    isSubscriber,
    isGuest,
    isInactiveSubscriber,
    user
  }
}
