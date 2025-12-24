'use client'
import { useJobRecovery } from '@/hooks/useJobRecovery';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, X, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface JobRecoveryNotificationProps {
  jobType: 'senddebts' | 'proximos_vencer';
  onRecover: (jobId: string, progress: number, status?: string) => void;
  onDismiss: () => void;
}

export function JobRecoveryNotification({
  jobType,
  onRecover,
  onDismiss,
}: JobRecoveryNotificationProps) {
  const { activeJobs, hasActiveJobs, isChecking, latestJob } = useJobRecovery({ jobType });
  const [dismissed, setDismissed] = useState(false);

  // Si el job está completado, automáticamente navegar a resultados
  useEffect(() => {
    if (latestJob?.status === 'completed' && !dismissed) {
      // Auto-recuperar al paso de resultados
      onRecover(latestJob.jobId, 100, 'completed');
      setDismissed(true);
    }
  }, [latestJob, dismissed, onRecover]);

  if (!hasActiveJobs || dismissed || isChecking) {
    return null;
  }

  // No mostrar si ya está completado (se manejó arriba)
  if (latestJob?.status === 'completed') {
    return null;
  }

  const job = latestJob!;
  const isProcessing = job.status === 'processing';
  const isPending = job.status === 'pending';

  const handleRecover = () => {
    onRecover(job.jobId, job.progress || 0, job.status);
    setDismissed(true);
  };

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-md"
      >
        <div className="mx-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg shadow-lg">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              {isProcessing ? (
                <RefreshCw className="h-5 w-5 text-blue-600 dark:text-blue-400 animate-spin" />
              ) : (
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                Proceso en segundo plano detectado
              </h3>
              
              <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                {isProcessing ? (
                  <>
                    Hay un proceso de <strong>{jobType === 'senddebts' ? 'SendDebts' : 'Próximos a Vencer'}</strong> en progreso ({job.progress}%).
                    {job.processedItems && job.totalItems && (
                      <> Procesados: {job.processedItems}/{job.totalItems}</>
                    )}
                  </>
                ) : (
                  <>
                    Hay un proceso de <strong>{jobType === 'senddebts' ? 'SendDebts' : 'Próximos a Vencer'}</strong> pendiente.
                  </>
                )}
              </p>

              {job.inputFilename && (
                <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                  Archivo: {job.inputFilename}
                </p>
              )}

              <div className="mt-3 flex gap-2">
                <Button
                  size="sm"
                  onClick={handleRecover}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Ver progreso
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDismiss}
                  className="text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700"
                >
                  Ignorar
                </Button>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              className="flex-shrink-0 text-blue-400 hover:text-blue-600 dark:text-blue-500 dark:hover:text-blue-300"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Progress bar */}
          {isProcessing && job.progress > 0 && (
            <div className="mt-3 w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
              <div
                className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${job.progress}%` }}
              />
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
