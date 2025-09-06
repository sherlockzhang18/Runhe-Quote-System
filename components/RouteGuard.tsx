import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { CircularProgress, Box } from '@mui/material'

interface RouteGuardProps {
  children: React.ReactNode
}

const PROTECTED_PATHS = ['/admin', '/price-management', '/quotes']

export default function RouteGuard({ children }: RouteGuardProps) {
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const authCheck = async (url: string) => {
      const path = url.split('?')[0]
      const needsAuth = PROTECTED_PATHS.some(p => path.startsWith(p))

      if (!needsAuth) {
        setAuthorized(true)
        setLoading(false)
        return
      }

      try {
        const res = await fetch('/api/me', {
          credentials: 'include',
        })
        if (res.ok) {
          setAuthorized(true)
        } else {
          setAuthorized(false)
          router.push(`/login?redirect=${encodeURIComponent(url)}`)
        }
      } catch {
        setAuthorized(false)
        router.push(`/login?redirect=${encodeURIComponent(url)}`)
      } finally {
        setLoading(false)
      }
    }

    authCheck(router.asPath)

    const handleRouteChange = (url: string) => {
      setLoading(true)
      authCheck(url)
    }

    router.events.on('routeChangeComplete', handleRouteChange)
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router])

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    )
  }

  if (!authorized) return null
  return <>{children}</>
}
