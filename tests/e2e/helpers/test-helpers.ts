/**
 * 🔧 Playwright Test Helpers
 * Sprint 3: Testing & Quality Assurance
 *
 * Funciones helper reutilizables para tests E2E
 */

import { Page, expect } from "@playwright/test";

/**
 * Realizar login en la aplicación
 */
export async function login(
  page: Page,
  username: string = "test@example.com",
  password: string = "password"
) {
  // Navegar a la página de login
  await page.goto("/login");

  // Llenar formulario
  await page.fill('input[name="email"], input[type="email"]', username);
  await page.fill('input[name="password"], input[type="password"]', password);

  // Click en botón de login
  await page.click('button[type="submit"], button:has-text("Iniciar")');

  // Esperar navegación o indicador de éxito
  await page.waitForURL("**/dashboard", { timeout: 10000 }).catch(() => {
    // Si no redirige a dashboard, al menos verificar que no estamos en login
    return expect(page).not.toHaveURL(/.*login.*/);
  });
}

/**
 * Cerrar sesión
 */
export async function logout(page: Page) {
  // Buscar botón de logout (ajustar selectores según tu UI)
  const logoutButton = page.locator(
    'button:has-text("Salir"), button:has-text("Cerrar sesión")'
  );

  if (await logoutButton.isVisible({ timeout: 2000 }).catch(() => false)) {
    await logoutButton.click();
    await page.waitForURL("**/login", { timeout: 5000 });
  }
}

/**
 * Esperar a que WhatsApp esté sincronizado
 */
export async function waitForWhatsAppSync(page: Page) {
  // Esperar indicador de sincronización completa
  await page
    .waitForSelector('[data-testid="whatsapp-ready"], .whatsapp-ready', {
      state: "visible",
      timeout: 30000,
    })
    .catch(() => {
      console.warn("WhatsApp sync indicator not found, continuing anyway");
    });
}

/**
 * Cargar archivo Excel en un input file
 */
export async function uploadExcelFile(
  page: Page,
  filePath: string,
  inputSelector: string = 'input[type="file"]'
) {
  const fileInput = page.locator(inputSelector);
  await fileInput.setInputFiles(filePath);

  // Esperar confirmación de carga
  await page.waitForTimeout(1000); // Esperar procesamiento
}

/**
 * Descargar archivo y validar
 */
export async function downloadAndValidate(
  page: Page,
  downloadButtonSelector: string
): Promise<Buffer> {
  // Configurar listener para descarga
  const downloadPromise = page.waitForEvent("download");

  // Click en botón de descarga
  await page.click(downloadButtonSelector);

  // Esperar descarga
  const download = await downloadPromise;

  // Obtener buffer del archivo
  const buffer = await download
    .path()
    .then((path) => require("fs").promises.readFile(path));

  return buffer;
}

/**
 * Verificar presencia de toast/notificación
 */
export async function expectToastMessage(
  page: Page,
  message: string | RegExp,
  type: "success" | "error" | "info" = "success"
) {
  const toastSelector = `[data-sonner-toast], .toast, [role="alert"]`;
  const toast = page.locator(toastSelector).filter({ hasText: message });

  await expect(toast).toBeVisible({ timeout: 5000 });

  // Opcional: verificar tipo de toast
  if (type === "success") {
    await expect(toast).toHaveClass(/success|green/);
  } else if (type === "error") {
    await expect(toast).toHaveClass(/error|red/);
  }
}

/**
 * Navegar a una ruta específica después de login
 */
export async function navigateToRoute(page: Page, route: string) {
  await page.goto(route);
  await page.waitForLoadState("networkidle");
}

/**
 * Esperar carga de tabla/datos
 */
export async function waitForTableLoad(
  page: Page,
  tableSelector: string = 'table, [role="table"]'
) {
  await page.waitForSelector(tableSelector, {
    state: "visible",
    timeout: 15000,
  });

  // Esperar que tenga al menos una fila de datos
  await page.waitForSelector(
    `${tableSelector} tbody tr, ${tableSelector} [role="row"]`,
    {
      state: "visible",
      timeout: 10000,
    }
  );
}

/**
 * Tomar screenshot para debugging
 */
export async function takeDebugScreenshot(page: Page, name: string) {
  await page.screenshot({
    path: `tests/e2e/screenshots/${name}.png`,
    fullPage: true,
  });
}

/**
 * Verificar que no hay errores visibles en la página
 */
export async function expectNoErrors(page: Page) {
  // Verificar que no hay mensajes de error visibles
  const errorMessages = page.locator(
    '[role="alert"]:has-text("Error"), .error-message, .text-red'
  );
  const count = await errorMessages.count();

  if (count > 0) {
    const texts = await errorMessages.allTextContents();
    throw new Error(`Found ${count} error messages: ${texts.join(", ")}`);
  }
}

/**
 * Simular selección de múltiples items en tabla
 */
export async function selectTableRows(page: Page, rowIndices: number[]) {
  for (const index of rowIndices) {
    const checkbox = page.locator(
      `table tbody tr:nth-child(${index + 1}) input[type="checkbox"]`
    );
    await checkbox.check();
  }
}

/**
 * Esperar JobId y progreso
 */
export async function waitForJobCompletion(
  page: Page,
  expectedMessage?: string | RegExp
) {
  // Esperar modal/loader de progreso
  const progressIndicator = page.locator(
    '[data-testid="job-progress"], .processing, [role="progressbar"]'
  );

  await expect(progressIndicator).toBeVisible({ timeout: 5000 });
  await expect(progressIndicator).toBeHidden({ timeout: 60000 }); // Esperar hasta 60s

  // Si se especifica mensaje de éxito, verificarlo
  if (expectedMessage) {
    await expectToastMessage(page, expectedMessage, "success");
  }
}

/**
 * Mock de API endpoint
 */
export async function mockApiEndpoint(
  page: Page,
  url: string | RegExp,
  response: any
) {
  await page.route(url, (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(response),
    });
  });
}

/**
 * Verificar que una request se haya hecho
 */
export async function expectApiCall(
  page: Page,
  url: string | RegExp,
  method: string = "GET"
) {
  const request = await page.waitForRequest(
    (req) => {
      const matchesUrl =
        typeof url === "string" ? req.url().includes(url) : url.test(req.url());
      const matchesMethod = req.method() === method.toUpperCase();
      return matchesUrl && matchesMethod;
    },
    { timeout: 10000 }
  );

  expect(request).toBeTruthy();
  return request;
}
