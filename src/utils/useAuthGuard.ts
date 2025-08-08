'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { getAccessToken } from '@/utils/authToken'

export function useAuthGuard() {
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      const token = getAccessToken()
      if (!token) {
        router.push('/login')
      }
    }

    const interval = setInterval(checkAuth, 5000)
    window.addEventListener('focus', checkAuth)

    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', checkAuth)
    }
  }, [router])
}
