# 🎨 Frontend Aqua V2 - Next.js Application

## 📖 Descripción

Aplicación web moderna construida con Next.js 16 (App Router), React 19, TypeScript y Tailwind CSS. Interface de usuario para el sistema AQUA V2 de gestión de deudas, clientes y WhatsApp.

## 🎯 Propósito

- **Dashboard Principal**: Vista general de métricas y accesos rápidos
- **Gestión de Clientes**: CRUD completo con búsqueda y filtros
- **Gestión de Deudas**: Visualización y gestión de deudas por cliente
- **WhatsApp**: Envío de mensajes individuales y masivos
- **PYSE**: Generación de documentos legales
- **Comprobantes**: Generación y descarga de PDFs
- **Upload Excel**: Carga masiva de datos
- **Admin Panel**: Dashboard administrativo con métricas y control
- **Autenticación**: Login, registro y gestión de sesión

## 🏗️ Arquitectura

```
┌──────────────────────────────────────────────────────────┐
│              Frontend Next.js App                        │
│         (App Router + Server Components)                 │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │              App Router (/src/app)              │   │
│  │                                                 │   │
│  │  /login      /register     /home     /admin    │   │
│  │  /clientes   /deudas       /whatsapp /pyse     │   │
│  └─────────────────────────────────────────────────┘   │
│                          │                              │
│  ┌───────────────────────▼──────────────────────────┐  │
│  │         React Context Providers                  │  │
│  │  • GlobalContext (user, auth state)              │  │
│  │  • ThemeProvider (dark/light mode)               │  │
│  │  • QueryClientProvider (React Query)             │  │
│  └──────────────────────────────────────────────────┘  │
│                          │                              │
│  ┌───────────────────────▼──────────────────────────┐  │
│  │              API Client Layer                    │  │
│  │  • axiosInstance (configured with baseURL)       │  │
│  │  • Interceptors (auth, error handling)           │  │
│  │  • Request/Response transformers                 │  │
│  └──────────────────────────────────────────────────┘  │
│                          │                              │
│  ┌───────────────────────▼──────────────────────────┐  │
│  │           UI Components (shadcn/ui)              │  │
│  │  • Button, Dialog, Table, Form, etc.             │  │
│  │  • Custom components (ClientTable, etc.)         │  │
│  └──────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
                          │
                          ▼
                ┌──────────────────┐
                │  Backend API     │
                │  (Aqua API)      │
                └──────────────────┘
```

## 📦 Stack Tecnológico

### Core

- **Next.js 16**: Framework React con App Router
- **React 19**: Biblioteca UI
- **TypeScript 5**: Tipado estático
- **Tailwind CSS 4**: Utility-first CSS framework

### UI Components

- **shadcn/ui**: Componentes React accesibles y personalizables
- **Radix UI**: Primitives para UI (Dialog, Select, etc)
- **Lucide React**: Íconos SVG
- **Framer Motion**: Animaciones fluidas

### State Management

- **React Query (TanStack)**: Server state y caching
- **React Context**: Client state global
- **React Hook Form**: Gestión de formularios
- **Zod**: Validación de schemas

### Data Fetching

- **Axios**: HTTP client configurado
- **Socket.IO Client**: WebSocket para tiempo real

### Otros

- **next-themes**: Dark/Light mode
- **sonner**: Toast notifications
- **xlsx**: Exportación/importación Excel
- **qrcode**: Generación de QR codes

## 📁 Estructura del Proyecto

```
frontaquav2/
├── src/
│   ├── app/                          # App Router (Next.js 16)
│   │   ├── (auth)/                   # Grupo de rutas auth
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (protected)/              # Rutas protegidas
│   │   │   ├── home/
│   │   │   ├── clientes/
│   │   │   ├── deudas/
│   │   │   ├── whatsapp/
│   │   │   ├── pyse/
│   │   │   └── comprobantes/
│   │   ├── admin/                    # Admin panel
│   │   │   ├── dashboard/
│   │   │   ├── baileys/
│   │   │   ├── metrics/
│   │   │   └── whatsapp/
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Home page
│   │   └── providers/                # Context providers
│   │       ├── context/
│   │       │   └── GlobalContext.tsx
│   │       └── query-provider.tsx
│   │
│   ├── components/                   # Componentes reutilizables
│   │   ├── ui/                       # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── table.tsx
│   │   │   └── ...
│   │   ├── ClientTable.tsx
│   │   ├── DebtTable.tsx
│   │   ├── WhatsAppQR.tsx
│   │   └── ...
│   │
│   ├── lib/                          # Utilidades y configuración
│   │   ├── api/
│   │   │   └── axiosInstance.ts      # Axios configurado
│   │   ├── utils.ts                  # Helper functions
│   │   └── validations.ts            # Zod schemas
│   │
│   └── types/                        # TypeScript types
│       ├── client.ts
│       ├── debt.ts
│       └── ...
│
├── public/                           # Assets estáticos
│   ├── logo.png
│   └── ...
│
├── components.json                   # shadcn/ui config
├── next.config.ts                    # Next.js config
├── tailwind.config.ts               # Tailwind config
├── tsconfig.json                     # TypeScript config
├── package.json
└── README.md
```

## 🔧 Configuración

### Variables de Entorno (`.env.local`)

```env
# Backend API
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_WS_URL=http://localhost:3000

# Baileys Worker (opcional, solo si acceso directo)
NEXT_PUBLIC_BAILEYS_URL=http://localhost:3002

# Admin (UID del usuario admin)
NEXT_PUBLIC_ADMIN_UID=your_admin_user_id

# WhatsApp Cloud API (opcional)
NEXT_PUBLIC_WHATSAPP_CLOUD_PHONE_ID=your_phone_id

# Feature Flags (opcional)
NEXT_PUBLIC_ENABLE_DARK_MODE=true
NEXT_PUBLIC_ENABLE_ANALYTICS=false

# Development
NEXT_PUBLIC_ENV=development
```

## 🚀 Instalación y Ejecución

### Requisitos Previos

- Node.js 20+
- npm o yarn
- Backend API corriendo

### Instalación

```bash
cd "Front-aqua v2/frontaquav2"
npm install
```

### Desarrollo (Turbopack)

```bash
npm run dev
```

Abre [http://localhost:3001](http://localhost:3001)

### Desarrollo (Webpack - legacy)

```bash
npm run dev:legacy
```

### Build Production

```bash
npm run build
npm run start
```

### Análisis de Bundle

```bash
npm run build:analyze
```

## 📡 API Integration

### Axios Instance

Configuración centralizada en `src/lib/api/axiosInstance.ts`:

```typescript
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor (agregar token)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor (manejar errores)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Refresh token o redirect a login
    }
    return Promise.reject(error);
  }
);
```

### React Query

Configuración en `src/app/providers/query-provider.tsx`:

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000, // 1 minuto
      cacheTime: 300000, // 5 minutos
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
```

### Ejemplo de uso

```typescript
// Hook personalizado
function useClientes() {
  return useQuery({
    queryKey: ["clientes"],
    queryFn: async () => {
      const { data } = await api.get("/clientes");
      return data;
    },
  });
}

// En componente
function ClientesPage() {
  const { data, isLoading, error } = useClientes();

  if (isLoading) return <Loader />;
  if (error) return <Error />;

  return <ClientTable data={data} />;
}
```

## 🔐 Autenticación

### Global Context

Gestión de autenticación en `src/app/providers/context/GlobalContext.tsx`:

```typescript
interface GlobalContextType {
  userId: string | null;
  userEmail: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const GlobalContext = createContext<GlobalContextType>();

export function useGlobalContext() {
  return useContext(GlobalContext);
}
```

### Protected Routes

Middleware en páginas protegidas:

```typescript
// src/app/(protected)/layout.tsx
export default function ProtectedLayout({ children }) {
  const { isAuthenticated } = useGlobalContext();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated]);

  return <>{children}</>;
}
```

### Login Flow

```typescript
async function handleLogin(email: string, password: string) {
  try {
    const { data } = await api.post("/auth/login", { email, password });

    // Guardar token
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("refresh_token", data.refresh_token);

    // Actualizar context
    login(data.access_token, data.user);

    // Redirect
    router.push("/home");
  } catch (error) {
    toast.error("Credenciales inválidas");
  }
}
```

## 🎨 UI Components (shadcn/ui)

### Instalación de componentes

```bash
npx shadcn@latest add button
npx shadcn@latest add dialog
npx shadcn@latest add table
```

### Componentes Disponibles

| Componente | Uso                        |
| ---------- | -------------------------- |
| `Button`   | Botones con variantes      |
| `Dialog`   | Modales                    |
| `Table`    | Tablas de datos            |
| `Form`     | Formularios con validación |
| `Select`   | Dropdowns                  |
| `Input`    | Campos de texto            |
| `Tabs`     | Pestañas                   |
| `Alert`    | Alertas y notificaciones   |
| `Avatar`   | Avatares de usuario        |
| `Slider`   | Sliders de rango           |

### Ejemplo de uso

```tsx
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

function MyComponent() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Abrir Modal</Button>
      </DialogTrigger>
      <DialogContent>
        <h2>Contenido del Modal</h2>
      </DialogContent>
    </Dialog>
  );
}
```

## 🎭 Theming (Dark/Light Mode)

### Configuración

Proveedor en `src/app/layout.tsx`:

```tsx
import { ThemeProvider } from "next-themes";

export default function RootLayout({ children }) {
  return (
    <html suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### Uso en componentes

```tsx
import { useTheme } from "next-themes";

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
      Toggle Theme
    </button>
  );
}
```

### Colores CSS Variables

Definidas en `src/app/globals.css`:

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    /* ... */
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    /* ... */
  }
}
```

## 📱 Páginas Principales

### 1. Login (`/login`)

- Formulario de login
- Validación con Zod
- Manejo de errores
- Redirect después de login exitoso

### 2. Home/Dashboard (`/home`)

- Resumen de métricas
- Accesos rápidos
- Gráficos (Recharts)
- Notificaciones recientes

### 3. Clientes (`/clientes`)

- Tabla con paginación
- Búsqueda y filtros
- CRUD operations
- Exportar a Excel

### 4. Deudas (`/deudas`)

- Listado por cliente
- Filtros por estado, período
- Detalle de deuda
- Generar comprobante

### 5. WhatsApp (`/whatsapp`)

- QR code para Baileys
- Envío individual
- Envío masivo
- Historial de mensajes
- Modo Cloud API o Baileys

### 6. PYSE (`/pyse`)

- Selección de template
- Datos del cliente
- Preview del documento
- Generar HTML/XML
- Tracking de uso

### 7. Admin Panel (`/admin`)

- Dashboard con métricas
- Logs en tiempo real
- Control de Baileys Worker
- Métricas de Railway/Supabase
- Gestión de servicios
- WhatsApp usage tracking

## 🔌 WebSocket Integration

### Conexión Socket.IO

```typescript
import io from "socket.io-client";

const socket = io(process.env.NEXT_PUBLIC_WS_URL!);

// Conectar
socket.on("connect", () => {
  console.log("WebSocket connected");
});

// Escuchar eventos
socket.on("jobUpdate", (data) => {
  console.log("Job progress:", data.progress);
});

// Emitir eventos
socket.emit("subscribe:jobStatus", { jobId: "job-123" });

// Desconectar
socket.disconnect();
```

### Uso en componentes

```tsx
function JobStatus({ jobId }: { jobId: string }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_WS_URL!);

    socket.emit("subscribe:jobStatus", { jobId });

    socket.on("jobUpdate", (data) => {
      setProgress(data.progress);
    });

    return () => {
      socket.disconnect();
    };
  }, [jobId]);

  return <ProgressBar value={progress} />;
}
```

## 📊 Validación de Formularios

### React Hook Form + Zod

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Schema
const clientSchema = z.object({
  dni: z.string().min(7).max(8),
  nombre: z.string().min(3),
  direccion: z.string(),
  telefono: z.string().optional(),
});

type ClientForm = z.infer<typeof clientSchema>;

// Componente
function ClientForm() {
  const form = useForm<ClientForm>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      dni: "",
      nombre: "",
      direccion: "",
    },
  });

  const onSubmit = async (data: ClientForm) => {
    await api.post("/clientes", data);
    toast.success("Cliente creado");
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Input {...form.register("dni")} />
      {form.formState.errors.dni && (
        <span>{form.formState.errors.dni.message}</span>
      )}
      {/* ... */}
    </form>
  );
}
```

## 🧪 Testing

### Jest + Testing Library

#### Unit Tests

```bash
npm run test
```

#### Watch Mode

```bash
npm run test:watch
```

#### Coverage

```bash
npm run test:coverage
```

### Playwright (E2E)

#### Run tests

```bash
npm run test:e2e
```

#### UI Mode

```bash
npm run test:e2e:ui
```

#### Headed mode

```bash
npm run test:e2e:headed
```

### Ejemplo de test

```typescript
// components/Button.test.tsx
import { render, screen } from "@testing-library/react";
import { Button } from "./Button";

describe("Button", () => {
  it("renders correctly", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    screen.getByText("Click me").click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## 🚀 Deployment

### Railway

#### Configuración

```json
// railway.json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node server.js",
    "healthcheckPath": "/",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}
```

#### Variables de entorno

Configurar en Railway dashboard:

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_ADMIN_UID`
- Etc.

### Procfile (opcional)

```
web: node server.js
```

### server.js (Custom Server)

```javascript
const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const port = process.env.PORT || 3001;

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
```

## ⚡ Performance

### Optimizaciones Implementadas

1. **Next.js Image**: Optimización automática de imágenes
2. **Code Splitting**: Carga bajo demanda de componentes
3. **React Query Cache**: Cache de datos del servidor
4. **Memoization**: React.memo, useMemo, useCallback
5. **Turbopack**: Build más rápido en desarrollo
6. **Bundle Analyzer**: Análisis de tamaño de bundle
7. **Dynamic Imports**: Lazy loading de componentes pesados

### Lighthouse Score (Target)

- Performance: > 90
- Accessibility: > 95
- Best Practices: > 90
- SEO: > 90

## 🔍 Debugging

### React DevTools

Instalar extensión de navegador:

- [Chrome](https://chrome.google.com/webstore/detail/react-developer-tools)
- [Firefox](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/)

### Next.js Debug Mode

```bash
NODE_OPTIONS='--inspect' npm run dev
```

Abrir Chrome DevTools → Sources → Node

### Console Logs

En desarrollo, usar `console.log` liberalmente.  
En producción, remover o usar logger condicional:

```typescript
const isDev = process.env.NODE_ENV === "development";
if (isDev) console.log("Debug info");
```

## 📝 Convenciones de Código

### Naming

- **Componentes**: PascalCase (`ClientTable.tsx`)
- **Hooks**: camelCase con prefijo `use` (`useClientes.ts`)
- **Utilities**: camelCase (`formatDate.ts`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_ITEMS = 100`)

### Estructura de Componentes

```tsx
// Imports
import { useState } from "react";
import { Button } from "@/components/ui/button";

// Types
interface Props {
  title: string;
  onSubmit: () => void;
}

// Component
export function MyComponent({ title, onSubmit }: Props) {
  // Hooks
  const [state, setState] = useState();

  // Handlers
  const handleClick = () => {
    // ...
  };

  // Render
  return (
    <div>
      <h1>{title}</h1>
      <Button onClick={handleClick}>Submit</Button>
    </div>
  );
}
```

### TypeScript

- Usar `interface` para props
- Usar `type` para unions/intersections
- Evitar `any`, usar `unknown` si necesario
- Tipar explícitamente returns de funciones async

## 🛠️ Troubleshooting

### Error: Module not found

```bash
# Limpiar cache
rm -rf .next node_modules
npm install
```

### Error: API request failed

1. Verificar `NEXT_PUBLIC_API_URL` en `.env.local`
2. Verificar backend está corriendo
3. Ver Network tab en DevTools
4. Verificar CORS configurado en backend

### Error: Hydration mismatch

- Asegurarse que HTML servidor === HTML cliente
- No usar `Math.random()`, `Date.now()` en render
- Usar `suppressHydrationWarning` si necesario

### Build error

```bash
# Ver errores de TypeScript
npx tsc --noEmit

# Ver errores de ESLint
npm run lint
```

## 📞 Soporte

Para issues o preguntas:

1. Revisar console del navegador
2. Verificar Network tab para requests
3. Revisar React DevTools
4. Ver logs de build en Railway
5. Consultar Next.js docs: https://nextjs.org/docs

---

**Última actualización**: Noviembre 2025  
**Versión**: 0.1.0  
**Mantenedor**: Equipo AQUAV2
