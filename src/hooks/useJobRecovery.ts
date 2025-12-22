import { useEffect, useState } from "react";
import { getActiveJobs, ActiveJob, getJobDetails } from "@/lib/api/jobsApi";
import { logger } from "@/lib/logger";

interface UseJobRecoveryOptions {
  jobType?: "senddebts" | "proximos_vencer";
  onJobFound?: (job: ActiveJob) => void;
  autoRecover?: boolean; // Si es true, llama onJobFound automáticamente
}

/**
 * Hook para detectar y recuperar jobs en progreso
 * Útil cuando el usuario cierra la página y vuelve
 */
export const useJobRecovery = (options: UseJobRecoveryOptions = {}) => {
  const { jobType, onJobFound, autoRecover = false } = options;

  const [activeJobs, setActiveJobs] = useState<ActiveJob[]>([]);
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkForActiveJobs = async () => {
      try {
        setIsChecking(true);
        setError(null);

        const jobs = await getActiveJobs();

        // Filtrar por tipo si se especificó
        const filteredJobs = jobType
          ? jobs.filter((job) => job.type === jobType)
          : jobs;

        setActiveJobs(filteredJobs);

        if (filteredJobs.length > 0) {
          logger.log(
            `🔄 Detectados ${filteredJobs.length} job(s) en progreso:`,
            filteredJobs
          );

          // Si autoRecover está activado, notificar del primer job
          if (autoRecover && filteredJobs.length > 0 && onJobFound) {
            onJobFound(filteredJobs[0]);
          }
        }
      } catch (err: any) {
        logger.error("Error verificando jobs activos:", err);
        setError(err.message);
      } finally {
        setIsChecking(false);
      }
    };

    checkForActiveJobs();
  }, [jobType, autoRecover, onJobFound]);

  const recoverJob = async (jobId: string) => {
    try {
      const jobDetails = await getJobDetails(jobId);
      logger.log(`📥 Job recuperado: ${jobId}`, jobDetails);
      return jobDetails;
    } catch (err: any) {
      logger.error(`Error recuperando job ${jobId}:`, err);
      throw err;
    }
  };

  const hasActiveJobs = activeJobs.length > 0;
  const latestJob = activeJobs.length > 0 ? activeJobs[0] : null;

  return {
    activeJobs,
    hasActiveJobs,
    latestJob,
    isChecking,
    error,
    recoverJob,
  };
};
