import { useState, useCallback, useEffect, useRef } from "react"
import {  userLogin, checkValidateToken } from "../lib/api"
import { useGlobalContext } from "@/app/providers/context/GlobalContext"
import { useRouter } from "next/navigation"

export const useAuth = () => {
  const { setAccessToken, setRefreshToken, setUsernameGlobal } = useGlobalContext()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const hasCheckedAuth = useRef(false) 

  const login = useCallback(
    async (email: string, password: string) => {
      setIsSubmitting(true)
      try {
        const result = await userLogin(email, password)

        setAccessToken(result.accessToken)
        setRefreshToken(result.refreshToken)
        setUsernameGlobal(result.user.email || email)

        localStorage.setItem("accessToken", result.accessToken)
        localStorage.setItem("refreshToken", result.refreshToken)
        localStorage.setItem("username", result.user.email || email)

        return { success: true, username: result.user.email || email }
      } catch (error: any) {
        return {
          success: false,
          message: error?.response?.data?.message || "Error en login",
        }
      } finally {
        setIsSubmitting(false)
      }
    },
    [setAccessToken, setRefreshToken, setUsernameGlobal]
  )

  const checkAuth = useCallback(async () => {
    if (hasCheckedAuth.current) return
    hasCheckedAuth.current = true

    const isValid = await checkValidateToken()
    if (!isValid) {
      router.push("/login")
    }
  }, [router])

  return { login, isSubmitting, checkAuth }
}
