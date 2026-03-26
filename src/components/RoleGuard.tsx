import React from 'react';
import { useRole } from '../lib/useRole'

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: ('admin' | 'subscriber' | 'guest' | 'inactive')[]
  fallback?: React.ReactNode
}

const RoleGuard = ({ 
  children, 
  allowedRoles, 
  fallback = null 
}: RoleGuardProps) => {
  const { isAdmin, isSubscriber, isGuest, isInactiveSubscriber } = useRole()

  const hasAccess = 
    (allowedRoles.includes('admin') && isAdmin) ||
    (allowedRoles.includes('subscriber') && isSubscriber) ||
    (allowedRoles.includes('guest') && isGuest) ||
    (allowedRoles.includes('inactive') && isInactiveSubscriber)

  if (!hasAccess) return <>{fallback}</>
  return <>{children}</>
}

export default RoleGuard
