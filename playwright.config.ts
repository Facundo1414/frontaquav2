import { defineConfig, devices } from '@playwright/test';

/**
 * 🎭 Playwright Test Configuration
 * Sprint 3: Testing & Quality Assurance
 * 
 * E2E Tests para flujos críticos:
 * - Login y autenticación
 * - Envío de deudas (senddebts)
 * - Próximos a vencer
 * - Generación de documentos PDF
 */

export default defineConfig({
  // Directorio de tests
  testDir: './tests/e2e',
  
  // Timeout por test
  timeout: 60 * 1000, // 60 segundos
  
  // Expectativas timeout
  expect: {
    timeout: 10 * 1000, // 10 segundos
  },
  
  // Configuración de ejecución
  fullyParallel: true,
  forbidOnly: !!process.env.CI, // No permitir .only en CI
  retries: process.env.CI ? 2 : 0, // Reintentos en CI
  workers: process.env.CI ? 1 : undefined, // Workers en paralelo (local: auto, CI: 1)
  
  // Reporter
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'playwright-report/results.json' }],
    ['junit', { outputFile: 'playwright-report/junit.xml' }],
    ['list'],
  ],
  
  // Configuración compartida para todos los tests
  use: {
    // Base URL de la aplicación
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3001',
    
    // Trace en caso de fallo (útil para debugging)
    trace: 'on-first-retry',
    
    // Screenshot en caso de fallo
    screenshot: 'only-on-failure',
    
    // Video en caso de fallo
    video: 'retain-on-failure',
    
    // Navegación
    navigationTimeout: 30 * 1000,
    actionTimeout: 15 * 1000,
  },

  // Proyectos (navegadores)
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Opcional: Tests mobile
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  // Web server (si necesitas levantar la app automáticamente)
  webServer: process.env.CI ? undefined : {
    command: 'npm run dev',
    url: 'http://localhost:3001',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 minutos para que levante
  },
});
