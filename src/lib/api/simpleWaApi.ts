import api from "./axiosInstance";
import { getAccessToken } from "../../utils/authToken";

const withAuth = () => ({ Authorization: `Bearer ${getAccessToken()}` });

// Ahora todo pasa por el orquestador /api/wa/*
export const simpleWaInit = async () => {
  const { data } = await api.get("/api/wa/init", { headers: withAuth() });
  return data; // { worker, userId, authenticated, ready, hasQR }
};

export const simpleWaQR = async () => {
  const { data } = await api.get("/api/wa/state", { headers: withAuth() });
  // state devuelve { worker, ...snapshot } -> si necesitamos qr directo podemos depender de events SSE
  return { qr: (data && data.qr) || null };
};

export const simpleWaSendPdf = async (payload: {
  phoneNumber: string;
  pdfBase64: string; // vía orquestador siempre se envía base64 y él genera pdfKey
  caption?: string;
}) => {
  const { data } = await api.post("/api/wa/send-pdf", payload, {
    headers: withAuth(),
  });
  return data; // { worker, key, result }
};

export const simpleWaVerify = async (phone: string) => {
  const { data } = await api.get("/api/wa/verify", {
    headers: withAuth(),
    params: { phone },
  });
  return data as { worker: string; isWhatsApp: boolean };
};

export const simpleWaBulkVerify = async (phones: string[]) => {
  const { data } = await api.post(
    "/api/wa/verify/bulk",
    { phones },
    { headers: withAuth() }
  );
  return data as {
    worker: string;
    results: { phone: string; isWhatsApp: boolean }[];
  };
};

export const simpleWaLogout = async () => {
  const { data } = await api.post(
    "/api/wa/logout",
    {},
    { headers: withAuth() }
  );
  return data; // { worker, success }
};

export const simpleWaState = async () => {
  const { data } = await api.get("/api/wa/state", { headers: withAuth() });
  return data; // { worker, snapshot }
};

// Helper para abrir SSE de eventos unificados (/api/wa/events/stream)
export function openWaEventsStream(
  onEvent: (ev: { type: string; data: any }) => void
) {
  const token = getAccessToken();
  if (!token) throw new Error("No auth token");
  const url = new URL("/api/wa/events/stream", window.location.origin);
  const es = new EventSource(url.toString(), { withCredentials: false });
  // No podemos mandar header Authorization con EventSource estándar; opción: bearer via query param temporal (menos seguro) o usar fetch+readable. Aquí placeholder para evolución.
  // Alternativa real: backend aceptar ?token= ; implementarlo si se decide.
  es.onmessage = (msg) => {
    onEvent({ type: "message", data: msg.data });
  };
  const eventTypes = [
    "snapshot",
    "qr",
    "authenticated",
    "ready",
    "disconnected",
    "activity",
    "info",
    "error",
  ];
  eventTypes.forEach((t) => {
    es.addEventListener(t, (e: MessageEvent) => {
      let parsed: any = null;
      try {
        parsed = JSON.parse(e.data);
      } catch {
        parsed = e.data;
      }
      onEvent({ type: t, data: parsed });
    });
  });
  es.onerror = () => {
    /* manejar reconexión externa */
  };
  return () => es.close();
}
