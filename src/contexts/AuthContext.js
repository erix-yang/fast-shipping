import { createContext, useState, useContext, useEffect } from 'react'
import { supabase } from '../supabaseClient'

const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 检查初始会话
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const login = (email, password) => {
    return supabase.auth.signInWithPassword({ email, password })
  }

  const signup = async (email, password) => {
    try {
      // 1. 创建认证用户
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })
      
      if (authError) {
        console.error('Auth error:', authError)
        throw authError
      }

      if (!authData.user?.id) {
        throw new Error('User creation failed - no user ID')
      }

      // 2. 创建用户配置
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          email: email,
          role: 'customer'
        })

      if (profileError) {
        console.error('Profile creation error:', profileError)
        // 如果配置创建失败，可以选择删除认证用户
        await supabase.auth.signOut()
        throw new Error(`Failed to create user profile: ${profileError.message}`)
      }

      return authData
    } catch (error) {
      console.error('Signup process error:', error)
      throw error
    }
  }

  const logout = () => {
    return supabase.auth.signOut()
  }

  const resetPassword = (email) => {
    return supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    })
  }

  const updatePassword = (newPassword) => {
    return supabase.auth.updateUser({ password: newPassword })
  }

  const updateProfile = async (profileData) => {
    const { data: { user } } = await supabase.auth.getUser()
    
    const { error } = await supabase
      .from('user_profiles')
      .update(profileData)
      .eq('id', user.id)

    if (error) throw error
    return true
  }

  const getUserRole = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (error) throw error
    return data?.role
  }

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        login, 
        signup, 
        logout,
        resetPassword,
        updatePassword,
        updateProfile,
        getUserRole
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  return useContext(AuthContext)
} 