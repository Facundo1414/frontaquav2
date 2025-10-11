/**
 * Utilitario para programar auto-shutdown en horario laboral
 * Configura el servicio para cerrarse automáticamente fuera del horario de trabajo
 */

export function scheduleBusinessHoursShutdown(shutdownHour = 16) {
  const timezone = process.env.TZ || 'America/Argentina/Cordoba';
  const serviceName = process.env.SERVICE_NAME || 'Frontend';
  
  try {
    const now = new Date();
    
    // Crear fecha de shutdown para hoy a la hora especificada
    const shutdownTime = new Date();
    shutdownTime.setHours(shutdownHour, 0, 0, 0);
    
    // Si ya pasó la hora de shutdown hoy, programar para mañana
    if (now >= shutdownTime) {
      shutdownTime.setDate(shutdownTime.getDate() + 1);
    }
    
    const msUntilShutdown = shutdownTime.getTime() - now.getTime();
    
    // Programar shutdown
    setTimeout(() => {
      console.log(`🔴 [${serviceName}] Auto-shutdown: Fin del horario laboral (${shutdownHour}:00)`);
      console.log(`🔴 [${serviceName}] Próximo inicio: mañana a las 9:00 AM`);
      process.exit(0);
    }, msUntilShutdown);
    
    // Log informativo
    const shutdownStr = shutdownTime.toLocaleString('es-AR', { 
      timeZone: timezone,
      weekday: 'long',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    console.log(`⏰ [${serviceName}] Auto-shutdown programado para: ${shutdownStr}`);
    console.log(`⏰ [${serviceName}] Tiempo hasta shutdown: ${Math.round(msUntilShutdown / 1000 / 60)} minutos`);
    
  } catch (error) {
    console.warn(`⚠️ [${serviceName}] Error configurando auto-shutdown:`, error.message);
    console.warn(`⚠️ [${serviceName}] El servicio continuará sin auto-shutdown`);
  }
}

/**
 * Verifica si estamos en horario laboral (9-16, lunes a viernes)
 */
export function isBusinessHours() {
  const timezone = process.env.TZ || 'America/Argentina/Cordoba';
  
  try {
    const now = new Date();
    
    // Obtener hora y día en timezone de Córdoba
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      hour12: false,
      weekday: 'short'
    });
    
    const parts = formatter.formatToParts(now);
    const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0');
    const weekday = parts.find(p => p.type === 'weekday')?.value || '';
    
    const isWeekend = weekday === 'Sat' || weekday === 'Sun';
    const isWorkingHour = hour >= 9 && hour < 16;
    
    return !isWeekend && isWorkingHour;
  } catch (error) {
    console.warn('⚠️ Error verificando horario laboral:', error.message);
    return true; // En caso de error, permitir operación
  }
}