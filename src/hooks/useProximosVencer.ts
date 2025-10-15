// hooks/useProximosVencer.ts
"use client";
import { useProximosVencerContext } from "../app/providers/context/ProximosVencerContext";
import { processFileProximosVencer, sendProximosVencer } from "@/lib/api";
import { toast } from "sonner";

const useProximosVencer = () => {
  const {
    rawData,
    setRawData,
    notWhatsappData,
    setNotWhatsappData,
    processedData,
    setProcessedData,
    filteredData,
    setFilteredData,
    activeStep,
    setActiveStep,
    fileNameFiltered,
    setFileNameFiltered,
    processedFile,
    setProcessedFile,
    diasAnticipacion,
    setDiasAnticipacion,
  } = useProximosVencerContext();

  const processExcelFile = async () => {
    try {
      if (rawData.length === 0) {
        toast.error("No hay datos para procesar");
        return;
      }

      const responseData = await processFileProximosVencer(
        rawData,
        diasAnticipacion
      );

      // Separar usuarios con WhatsApp de los que no tienen
      const usersWithWhatsapp = responseData.data.filter(
        (user: any) => user.celular && user.celular.length >= 10
      );
      const usersWithoutWhatsapp = responseData.data.filter(
        (user: any) => !user.celular || user.celular.length < 10
      );

      console.log("Usuarios con WhatsApp:", usersWithWhatsapp.length);
      console.log("Usuarios sin WhatsApp:", usersWithoutWhatsapp.length);

      setProcessedData(responseData.data);
      setFilteredData(usersWithWhatsapp);

      // Si hay usuarios sin WhatsApp, generar archivo Excel
      if (usersWithoutWhatsapp.length > 0) {
        await generateNotWhatsappFile(usersWithoutWhatsapp);
      }

      toast.success(
        `Se procesaron ${responseData.data.length} registros. ${usersWithWhatsapp.length} con WhatsApp y ${usersWithoutWhatsapp.length} sin WhatsApp.`
      );

      setActiveStep(1);
    } catch (error) {
      console.error("Error:", error);
      toast.error(
        error instanceof Error ? error.message : "Error al procesar el archivo"
      );
    }
  };

  const generateNotWhatsappFile = async (data: any[]) => {
    try {
      const response = await fetch("/api/excel/generate-not-whatsapp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data }),
      });

      if (!response.ok) {
        throw new Error("Error al generar archivo de usuarios sin WhatsApp");
      }

      const filename = `usuarios_sin_whatsapp_${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      setNotWhatsappData(filename);
    } catch (error) {
      console.error("Error generando archivo sin WhatsApp:", error);
      toast.error("Error al generar archivo de usuarios sin WhatsApp");
    }
  };

  const sendMessagesAndGenerateReport = async () => {
    try {
      const blob = await sendProximosVencer(filteredData, diasAnticipacion);
      setProcessedFile(blob);

      const currentDate = new Date().toISOString().split("T")[0];
      setFileNameFiltered(`reporte_proximos_vencer_${currentDate}.xlsx`);

      toast.success(
        `Se enviaron ${filteredData.length} mensajes de próximos a vencer`
      );
      setActiveStep(2);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al enviar mensajes");
    }
  };

  const reset = () => {
    setRawData([]);
    setNotWhatsappData("");
    setProcessedData([]);
    setFilteredData([]);
    setActiveStep(0);
    setFileNameFiltered("");
    setProcessedFile(null);
    setDiasAnticipacion(1);
  };

  return {
    rawData,
    setRawData,
    notWhatsappData,
    processedData,
    filteredData,
    activeStep,
    setActiveStep,
    fileNameFiltered,
    processedFile,
    diasAnticipacion,
    setDiasAnticipacion,
    processExcelFile,
    sendMessagesAndGenerateReport,
    reset,
  };
};

export default useProximosVencer;
