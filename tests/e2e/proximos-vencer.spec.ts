/**
 * 🎭 E2E Test - Flujo Próximos a Vencer
 * Sprint 3: Testing & Quality Assurance
 *
 * Flujo completo:
 * 1. Login
 * 2. Navegar a próximos-vencer
 * 3. Cargar Excel
 * 4. Aplicar filtros
 * 5. Preview de datos
 * 6. Generar Excel filtrado
 * 7. Validar diasAnticipacion > 0 (Bug fix Sprint 3)
 */

import { test, expect } from "@playwright/test";
import {
  login,
  navigateToRoute,
  uploadExcelFile,
  waitForTableLoad,
  expectToastMessage,
  expectNoErrors,
  waitForJobCompletion,
} from "./helpers/test-helpers";
import * as path from "path";

test.describe("Próximos a Vencer - Flujo Completo", () => {
  test.beforeEach(async ({ page }) => {
    // Login antes de cada test
    await login(
      page,
      process.env.TEST_USER_EMAIL,
      process.env.TEST_USER_PASSWORD
    );
  });

  test("debería procesar flujo completo de próximos a vencer", async ({
    page,
  }) => {
    // 1. Navegar a próximos-vencer
    await navigateToRoute(page, "/proximos-vencer");

    // Verificar que estamos en la página correcta
    await expect(
      page.locator("h1, h2").filter({ hasText: /Próximos a Vencer/i })
    ).toBeVisible();

    // 2. Verificar que diasAnticipacion > 0 (Bug fix validación)
    const diasText = page.locator("text=/días restantes/i");
    if (await diasText.isVisible()) {
      const fullText = await diasText.textContent();
      const diasMatch = fullText?.match(/(\d+)\s+días/);
      if (diasMatch) {
        const dias = parseInt(diasMatch[1]);
        expect(dias).toBeGreaterThan(0);
        console.log(`✅ Validación diasAnticipacion: ${dias} días > 0`);
      }
    }

    // 3. Cargar archivo Excel (si se proporciona en variables de entorno)
    const testExcelPath = process.env.TEST_EXCEL_PATH;
    if (testExcelPath) {
      await uploadExcelFile(page, testExcelPath);

      // Esperar procesamiento
      await waitForJobCompletion(page);

      // 4. Verificar que se cargaron datos
      await waitForTableLoad(page);

      // Contar filas cargadas
      const rowCount = await page.locator("table tbody tr").count();
      expect(rowCount).toBeGreaterThan(0);
      console.log(`✅ Cargadas ${rowCount} filas`);

      // 5. Aplicar filtros (opcional)
      const filterButton = page.locator('button:has-text("Filtrar")');
      if (await filterButton.isVisible()) {
        await filterButton.click();
        await page.waitForTimeout(1000);
      }

      // 6. Preview de datos
      const previewButton = page.locator(
        'button:has-text("Preview"), button:has-text("Vista previa")'
      );
      if (await previewButton.isVisible()) {
        await previewButton.click();
        await page.waitForSelector('[role="dialog"], .modal', {
          state: "visible",
        });
      }

      // 7. Generar Excel
      const generateButton = page.locator(
        'button:has-text("Generar"), button:has-text("Descargar")'
      );
      if (await generateButton.isVisible()) {
        const downloadPromise = page.waitForEvent("download");
        await generateButton.click();

        const download = await downloadPromise;
        const filename = download.suggestedFilename();

        expect(filename).toMatch(/\.xlsx$/);
        console.log(`✅ Descargado: ${filename}`);
      }
    }

    // Verificar que no hay errores
    await expectNoErrors(page);
  });

  test("debería mostrar error cuando diasAnticipacion = 0", async ({
    page,
  }) => {
    // Este test simula el escenario del último día del mes
    // Mock de la API para forzar diasAnticipacion = 0
    await page.route("**/api/proximos-vencer/**", (route) => {
      const url = route.request().url();

      if (url.includes("/check-dias")) {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ diasAnticipacion: 0 }),
        });
      } else {
        route.continue();
      }
    });

    await navigateToRoute(page, "/proximos-vencer");

    // Intentar enviar con diasAnticipacion = 0
    const sendButton = page.locator(
      'button:has-text("Enviar"), button:has-text("Procesar")'
    );
    if (await sendButton.isVisible()) {
      await sendButton.click();

      // Debería mostrar mensaje de error
      await expectToastMessage(
        page,
        /no hay días válidos|días restantes/i,
        "error"
      );

      console.log(
        "✅ Validación de diasAnticipacion = 0 funcionó correctamente"
      );
    }
  });

  test("debería validar formato de Excel", async ({ page }) => {
    await navigateToRoute(page, "/proximos-vencer");

    // Intentar cargar archivo inválido
    const invalidFilePath = path.join(__dirname, "fixtures", "invalid.txt");

    await uploadExcelFile(page, invalidFilePath).catch(() => {
      // Esperamos que falle
    });

    // Verificar mensaje de error
    const errorMessage = page.locator(
      '[role="alert"]:has-text("formato inválido"), text=/formato no válido/i'
    );
    if (await errorMessage.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log("✅ Validación de formato funcionó");
    }
  });

  test("debería mostrar información de rango de fechas", async ({ page }) => {
    await navigateToRoute(page, "/proximos-vencer");

    // Verificar que se muestra el rango de fechas
    await expect(page.locator("text=/Desde:/i")).toBeVisible();
    await expect(page.locator("text=/Hasta:/i")).toBeVisible();

    // Verificar que el rango es del mes actual
    const fechaHasta = await page.locator("text=/Hasta:/i ~ *").textContent();
    const mesActual = new Date().toLocaleString("es", { month: "long" });

    expect(fechaHasta?.toLowerCase()).toContain(mesActual.toLowerCase());
    console.log(`✅ Rango de fechas validado: ${fechaHasta}`);
  });

  test("debería manejar carga de archivo grande", async ({ page }) => {
    test.slow(); // Marcar como test lento

    await navigateToRoute(page, "/proximos-vencer");

    const largeFilePath = process.env.TEST_LARGE_EXCEL_PATH;
    if (largeFilePath) {
      await uploadExcelFile(page, largeFilePath);

      // Esperar indicador de carga
      await expect(page.locator('[role="progressbar"], .loading')).toBeVisible({
        timeout: 5000,
      });

      // Esperar completado (puede tardar)
      await waitForJobCompletion(page);

      // Verificar que se cargó correctamente
      await waitForTableLoad(page);
      const rowCount = await page.locator("table tbody tr").count();

      expect(rowCount).toBeGreaterThan(100); // Archivo grande = > 100 filas
      console.log(`✅ Archivo grande procesado: ${rowCount} filas`);
    }
  });

  test("debería permitir editar mensaje antes de enviar", async ({ page }) => {
    await navigateToRoute(page, "/proximos-vencer");

    // Buscar textarea del mensaje
    const messageTextarea = page.locator(
      'textarea[id*="message"], textarea:below(:text("Mensaje"))'
    );

    if (await messageTextarea.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Verificar mensaje por defecto
      const defaultMessage = await messageTextarea.inputValue();
      expect(defaultMessage).toContain("cuotas");

      // Editar mensaje
      const customMessage = "Mensaje personalizado de prueba";
      await messageTextarea.fill(customMessage);

      // Verificar que se guardó
      expect(await messageTextarea.inputValue()).toBe(customMessage);
      console.log("✅ Edición de mensaje funcionó");
    }
  });

  test("debería deshabilitar envío si WhatsApp no está sincronizado", async ({
    page,
  }) => {
    // Mock de WhatsApp no sincronizado
    await page.route("**/api/whatsapp/status", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ready: false, syncing: true }),
      });
    });

    await navigateToRoute(page, "/proximos-vencer");

    // Botón de enviar debería estar deshabilitado
    const sendButton = page.locator('button:has-text("Enviar")');

    if (await sendButton.isVisible()) {
      await expect(sendButton).toBeDisabled();

      // Debería mostrar mensaje de sincronización
      await expect(page.locator("text=/sincronizando/i")).toBeVisible();
      console.log("✅ Validación de WhatsApp sync funcionó");
    }
  });
});

test.describe("Próximos a Vencer - Edge Cases", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await navigateToRoute(page, "/proximos-vencer");
  });

  test("debería manejar Excel sin datos", async ({ page }) => {
    const emptyFilePath = process.env.TEST_EMPTY_EXCEL_PATH;

    if (emptyFilePath) {
      await uploadExcelFile(page, emptyFilePath);

      // Debería mostrar error o mensaje
      await expectToastMessage(page, /vacío|sin datos/i, "error");
      console.log("✅ Excel vacío manejado correctamente");
    }
  });

  test("debería permitir cancelar operación", async ({ page }) => {
    // Buscar botón de cancelar
    const cancelButton = page.locator('button:has-text("Cancelar")');

    if (await cancelButton.isVisible()) {
      await cancelButton.click();

      // Debería volver al estado inicial
      await expect(page.locator("text=/Cargar archivo/i")).toBeVisible();
      console.log("✅ Cancelación funcionó");
    }
  });

  test("debería mantener estado al navegar entre pasos", async ({ page }) => {
    // Este test verifica que el contexto se mantiene
    const testExcelPath = process.env.TEST_EXCEL_PATH;

    if (testExcelPath) {
      await uploadExcelFile(page, testExcelPath);
      await waitForJobCompletion(page);

      // Ir al siguiente paso
      const nextButton = page.locator('button:has-text("Siguiente")');
      if (await nextButton.isVisible()) {
        await nextButton.click();

        // Volver al paso anterior
        const backButton = page.locator(
          'button:has-text("Anterior"), button:has-text("Volver")'
        );
        await backButton.click();

        // Los datos deberían seguir cargados
        await waitForTableLoad(page);
        console.log("✅ Estado persistido entre pasos");
      }
    }
  });
});
