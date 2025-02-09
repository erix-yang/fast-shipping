import { useAuth } from '../contexts/AuthContext'
import { Navigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useState, useEffect } from 'react'

export const RequireRole = ({ children, allowedRoles }) => {
  const { user } = useAuth()
  const [userRole, setUserRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getUserRole() {
      if (user) {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        
        if (!error && data) {
          setUserRole(data.role)
        }
      }
      setLoading(false)
    }
    getUserRole()
  }, [user])

  if (loading) return null

  if (!user || !allowedRoles.includes(userRole)) {
    return <Navigate to="/login" />
  }

  return children
} 