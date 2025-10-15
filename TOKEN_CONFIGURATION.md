# Configuración de Duración de Tokens

## Problema Resuelto

El token de sesión se estaba perdiendo muy rápidamente (cada hora) porque Supabase tiene una configuración por defecto de 1 hora para los tokens JWT. Ahora se ha implementado un sistema de **auto-refresh automático** que:

- ✅ Detecta automáticamente cuando el token va a expirar
- ✅ Refresca el token automáticamente antes de que expire
- ✅ Maneja errores de refresh y redirige al login si es necesario
- ✅ Muestra el estado del token en tiempo real
- ✅ Configurable a través de variables de entorno

## Configuración

### Variables de Entorno (Opcionales)

Puedes añadir estas variables a tu archivo `.env.local` para personalizar el comportamiento:

```bash
# Minutos antes de la expiración para refrescar automáticamente (default: 10)
NEXT_PUBLIC_TOKEN_REFRESH_BEFORE_MINUTES=10

# Minutos mínimos de validez del token antes de considerarlo expirado (default: 5)
NEXT_PUBLIC_MIN_TOKEN_VALIDITY_MINUTES=5

# Horas por defecto si no se puede decodificar el token (default: 8)
NEXT_PUBLIC_DEFAULT_TOKEN_HOURS=8
```

### Configuración de Supabase (Duración Real del Token)

Para cambiar la duración **real** del token de acceso en Supabase:

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Navega a **Authentication > Settings**
3. En la sección **JWT Settings**, encontrarás:
   - **JWT expiry limit**: Por defecto 3600 segundos (1 hora)
   - Puedes cambiarlo a **28800** segundos (8 horas) o el valor que prefieras

**Valores recomendados:**

- **JWT expiry limit**: `28800` (8 horas)
- **Refresh token expiry**: `604800` (7 días - por defecto)

## Cómo Funciona

### 1. Auto-Refresh Inteligente

- El sistema detecta automáticamente cuando el token va a expirar
- 10 minutos antes de la expiración, automáticamente solicita un nuevo token
- Si el refresh falla, limpia la sesión y redirige al login

### 2. Interceptor de Axios

- Cada petición HTTP verifica si el token necesita refresh
- Si detecta un error 401, intenta refrescar el token automáticamente
- Solo redirige al login si el refresh falla completamente

### 3. Estado Visual

- Un indicador en la esquina superior derecha muestra el tiempo restante del token
- Verde: Token válido
- Amarillo: Token se va a refrescar pronto

## Archivos Modificados

1. **`src/lib/tokenManager.ts`** - Nuevo: Gestión inteligente de tokens
2. **`src/lib/api/axiosInstance.ts`** - Interceptor mejorado con auto-refresh
3. **`src/utils/authToken.ts`** - Actualizado para usar tokenManager
4. **`src/app/providers/context/GlobalContext.tsx`** - Integración con tokenManager
5. **`src/hooks/useAuth.ts`** - Manejo mejorado del login
6. **`src/components/navbar/navbar.tsx`** - Logout mejorado
7. **`src/components/TokenStatus.tsx`** - Nuevo: Indicador visual del estado del token

## Flujo de Trabajo

1. **Login**: Al hacer login, se configuran los tokens con expiración automática
2. **Uso Normal**: Las peticiones funcionan normalmente
3. **Auto-Refresh**: 10 minutos antes de expirar, se renueva automáticamente
4. **Error Handling**: Si falla el refresh, se limpia la sesión y redirige al login

## Verificación

Para verificar que funciona correctamente:

1. Inicia sesión en la aplicación
2. Observa el indicador en la esquina superior derecha
3. Verifica en la consola del navegador los logs de refresh automático
4. El token debería durar ahora al menos 8 horas (o lo que hayas configurado en Supabase)

## Debugging

Si tienes problemas:

1. Abre las herramientas de desarrollador (F12)
2. Ve a la pestaña Console
3. Busca logs que empiecen con "Token" para ver el estado del sistema
4. Verifica que las variables de entorno estén configuradas correctamente

## Migración de Código Existente

El código existente seguirá funcionando sin cambios. El tokenManager es compatible con el sistema anterior y añade funcionalidad adicional de forma transparente.
