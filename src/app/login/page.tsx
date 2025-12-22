'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Clock } from 'lucide-react'
import { toast } from 'sonner'
import { motion } from '@/lib/motion'
import { LoadingOverlay } from '@/components/LoadingOverlay'
import { getUserFriendlyError } from '@/utils/errorMessages'
import { logger } from '@/lib/logger';

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState('')
  const [isRedirecting, setIsRedirecting] = useState(false)
  const { login, isSubmitting } = useAuth()
  const router = useRouter()

  const validateEmail = (email: string) => /\S+@\S+\.\S+/.test(email)

  const handleEmailChange = (value: string) => {
    setEmail(value)
    if (value && !validateEmail(value)) {
      setEmailError('Formato de email inválido')
    } else {
      setEmailError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validación final
    if (!validateEmail(email)) {
      setEmailError('Formato de email inválido')
      return toast.error('Por favor, verifica tu email')
    }

    logger.log('🔐 Iniciando login...')
    const { success, message, username } = await login(email, password)

    logger.log('📊 Resultado login:', { success, username })

    if (success) {
      toast.success(`¡Bienvenido, ${username}!`)
      setIsRedirecting(true)
      
      // Pequeña pausa para animación de salida
      await new Promise(resolve => setTimeout(resolve, 500))
      
      logger.log('🚀 Redirigiendo a /home...')
      router.push('/home')
      logger.log('✅ router.push ejecutado')
    } else {
      console.error('❌ Login falló:', message)
      const friendlyMessage = getUserFriendlyError(message || 'Error desconocido')
      toast.error(friendlyMessage)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar lateral con fondo gradiente animado */}
      <motion.div
        className="hidden md:flex flex-col justify-center items-center w-1/3 p-8 text-white"
        style={{
          background: 'linear-gradient(135deg, #1e3a8a, #2563eb, #3b82f6)',
          backgroundSize: '400% 400%',
          animation: 'gradientShift 15s ease infinite',
        }}
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1 }}
      >
        {/* Logo con animación de "flotar" */}
        <motion.img
          src="/logoWater.png"
          alt="Logo Water"
          className="w-48 h-auto mb-8"
          animate={{ y: [0, -15, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
        />
        <motion.h2
          className="text-3xl font-bold mb-4 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          Bienvenido a Aqua
        </motion.h2>
        <motion.p
          className="text-center text-lg max-w-xs"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 1 }}
        >
          Gestiona tus clientes con WhatsApp de forma simple y eficiente.
        </motion.p>

        {/* Aviso de Horario de Servicio */}
        <motion.div
          className="mt-8 bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 max-w-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 1 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-yellow-300" />
            <h4 className="font-semibold text-white">Horario de Servicio</h4>
          </div>
          <p className="text-sm text-white/90">
            Los servicios están disponibles de <strong>Lunes a Viernes</strong> de <strong>8:00 a 16:00 hs</strong>
          </p>
          <p className="text-xs text-white/75 mt-2">
            Fuera de este horario, no se podrá ingresar al sistema.
          </p>
        </motion.div>

        {/* Animación de burbujas decorativas (opcional) */}
        <motion.div
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          initial={{ opacity: 0.3 }}
          animate={{ opacity: 0.6 }}
          transition={{ repeat: Infinity, duration: 6 }}
          style={{ zIndex: 0 }}
        >
          {/* Aquí podrías agregar SVG o elementos decorativos */}
        </motion.div>
      </motion.div>

      {/* Formulario login */}
      <div
        className="flex-1 flex items-center justify-center bg-cover bg-center relative"
        style={{ backgroundImage: 'url(/bg_topEspacioClientes.jpg)' }}
      >
        <div className="absolute inset-0 bg-black opacity-50 z-0" />
        <Card className="relative z-10 max-w-md w-full p-6 mx-4">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-semibold">
              Iniciar Sesión
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div
                initial={{ scale: 1 }}
                whileFocus={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Label className="pb-2" htmlFor="email">
                  Email de Usuario
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Ingresa tu email de usuario"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  disabled={isSubmitting}
                  className={emailError ? 'border-red-500' : ''}
                  required
                />
                {emailError && (
                  <p className="text-red-500 text-sm mt-1">{emailError}</p>
                )}
              </motion.div>

              <motion.div
                initial={{ scale: 1 }}
                whileFocus={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Label className="pb-2" htmlFor="password">
                  Contraseña
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </motion.div>

              <Button type="submit" className="w-full" disabled={isSubmitting || !!emailError}>
                {isSubmitting ? 'Cargando...' : 'Iniciar Sesión'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Loading overlay durante redirección */}
      {isRedirecting && (
        <LoadingOverlay message="Redirigiendo al inicio..." />
      )}

      {/* CSS para animación de gradiente */}
      <style jsx global>{`
        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </div>
  )
}
