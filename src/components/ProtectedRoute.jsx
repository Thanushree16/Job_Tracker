import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function ProtectedRoute({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })
    
  }, [])

  if (loading) return null
  if (!session) {
    navigate('/login')
    return null
  }

  return children
}

export default ProtectedRoute